import { supabase } from "@/integrations/supabase/client";

const BUCKET = "submission-uploads";
const MAX_BYTES = 20 * 1024 * 1024; // 20MB

/** Upload a file to the private submission bucket. Returns the stored object path. */
export async function uploadSubmissionFile(file: File, folder = "submissions"): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error("File is too large (max 20MB).");
  }
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  return path;
}
