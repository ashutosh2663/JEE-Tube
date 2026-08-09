import { createClient } from "@supabase/supabase-js";
import { classifyVideo } from "./gemini.mjs";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function injectVideo(video) {
  // Check whether this YouTube video is already stored
  const { data: existing, error: lookupError } = await supabase
    .from("videos")
    .select("id, youtube_id")
    .eq("youtube_id", video.youtubeId)
    .maybeSingle();

  if (lookupError) {
    throw lookupError;
  }

  if (existing) {
    return {
      action: "skipped",
      reason: "already_exists",
      id: existing.id,
    };
  }

  // Ask Gemini to classify the video
  const classification = await classifyVideo(video);

  const relevance = Number(classification.relevance);

  // Reject videos that aren't useful for JEE
  if (
    classification.relevant !== true ||
    !Number.isFinite(relevance) ||
    relevance < 0.75
  ) {
    return {
      action: "rejected",
      reason: "low_relevance",
      relevance,
    };
  }

  // Insert using the EXACT columns in our videos table
  const record = {
    youtube_id: video.youtubeId,
    title: video.title,
    description: video.description || null,
    thumbnail: video.thumbnail || null,

    channel_name: video.channelName || null,
    channel_id: video.channelId || null,

    teacher: classification.teacher || null,

    subject: classification.subject || null,
    category: classification.category || null,
    chapter: classification.chapter || null,
    topic: classification.topic || null,

    series_name: classification.series_name || null,
    video_type: classification.video_type || null,
    study_role: classification.study_role || null,
    is_short: classification.is_short === true,
    exam: classification.exam || null,
    difficulty: classification.difficulty || null,

    sequence_order:
      Number.isInteger(classification.sequence_hint)
        ? classification.sequence_hint
        : null,

    ai_relevance: relevance,
    ai_classification: classification,

    status: "active",

    published_at: video.publishedAt
      ? new Date(video.publishedAt).toISOString()
      : null,

    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("videos")
    .insert(record)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    action: "inserted",
    video: data,
  };
}