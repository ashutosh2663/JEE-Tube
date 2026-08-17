import { createClient } from "@supabase/supabase-js";
import { askNemotron } from "./nemotron.mjs";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function getRecommendations(userId) {

  // Get recent history
  const { data: history } = await supabase
    .from("watch_history")
    .select(`
      video_id,
      videos (
        title,
        subject,
        chapter,
        topic,
        teacher,
        difficulty,
        sequence_order
      )
    `)
    .eq("user_id", userId)
    .order("watched_at", {
      ascending: false
    })
    .limit(20);

  if (!history || history.length === 0) {
    return [];
  }

  const watchedText = history
    .map(h => {
      const v = h.videos;

      return `
Subject: ${v.subject}
Chapter: ${v.chapter}
Topic: ${v.topic}
Teacher: ${v.teacher}
Difficulty: ${v.difficulty}
`;
    })
    .join("\n");

  // AI decides next topics
  const aiResult = await askNemotron({
    system: `
You are JEE-Tube AI.

Your job:
1. Understand what student studied.
2. Predict next chapters.
3. Suggest only JEE topics.
4. Return only JSON.

Format:

[
  {
    "subject":"Physics",
    "chapter":"Motion in a Plane"
  }
]
`,
    user: watchedText
  });

  let recommendations;

  try {
    recommendations = JSON.parse(aiResult);
  } catch {
    return [];
  }

  const finalVideos = [];

  for (const rec of recommendations) {

    const { data } = await supabase
      .from("videos")
      .select("*")
      .eq("subject", rec.subject)
      .ilike("chapter", `%${rec.chapter}%`)
      .limit(10);

    if (data) {
      finalVideos.push(...data);
    }
  }

  return finalVideos;
}