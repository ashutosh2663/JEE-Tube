import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { getVideoDetails } from "./youtube.mjs";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function timestampToSeconds(timestamp) {
  const parts = timestamp.split(":").map(Number);

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  if (parts.length === 3) {
    return (
      parts[0] * 3600 +
      parts[1] * 60 +
      parts[2]
    );
  }

  return null;
}

export function extractChapters(description) {
  if (!description) return [];

  const lines = description.split(/\r?\n/);

  const chapters = [];

  for (const line of lines) {
    const match = line.match(
      /^\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*-\s*(.+?)\s*$/
    );

    if (!match) continue;

    const time = timestampToSeconds(match[1]);

    if (!Number.isFinite(time)) continue;

    chapters.push({
      id: `chapter-${chapters.length + 1}`,
      title: match[2].trim(),
      time,
    });
  }

  return chapters.sort(
    (a, b) => a.time - b.time
  );
}

export async function saveVideoChapters(youtubeId) {
  const video = await getVideoDetails(youtubeId);

  const chapters = extractChapters(
    video.description
  );

  if (chapters.length === 0) {
    throw new Error(
      "No YouTube chapters found in the description."
    );
  }

  const { data, error } = await supabase
    .from("videos")
    .update({
      chapters,
      updated_at: new Date().toISOString(),
    })
    .eq("youtube_id", youtubeId)
    .select(
      "id, youtube_id, title, chapters"
    )
    .single();

  if (error) {
    throw error;
  }

  return data;
}