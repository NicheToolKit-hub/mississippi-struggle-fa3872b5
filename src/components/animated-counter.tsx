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
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const progress = Math.min((now - start) / durationMs, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
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
