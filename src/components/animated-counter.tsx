import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  /** Final value to count up to. */
  value: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
}

/**
 * Counts up to `value` once it scrolls into view. Respects reduced-motion.
 * Pure presentation — accepts already-fetched numbers so it can be wired to
 * a backend (Lovable Cloud / Supabase) later without changes.
 */
export function AnimatedCounter({
  value,
  durationMs = 1600,
  prefix = "",
  suffix = "",
}: AnimatedCounterProps) {
  // Initialize with the final value so the server-rendered / pre-hydration
  // HTML always shows the real number (crawlers, no-JS, slow connections).
  // The count-up animation still runs on first scroll-into-view — see run().
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useRef(false);
  const from = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /** Animate from the last shown number up (or down) to the new value. */
    const run = () => {
      if (reduced) {
        from.current = value;
        setDisplay(value);
        return;
      }
      const start = performance.now();
      const origin = from.current;
      const tick = (now: number) => {
        const progress = Math.min((now - start) / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(origin + (value - origin) * eased));
        if (progress < 1) requestAnimationFrame(tick);
        else from.current = value;
      };
      requestAnimationFrame(tick);
    };

    // Already scrolled into view once: re-animate whenever the value changes.
    if (seen.current) {
      run();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !seen.current) {
          seen.current = true;
          run();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value, durationMs]);


  return (
    <span ref={ref} aria-label={`${prefix}${value.toLocaleString()}${suffix}`}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
