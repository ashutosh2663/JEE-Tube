import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const video = {
  youtube_id: "zOdUhsMydtM",
  title:
    "SEQUENCE & SERIES in One Shot: All Concepts & PYQs Covered | JEE Main & Advanced",
  description:
    "Sequence & Series complete JEE Main and Advanced one-shot with concepts and PYQs.",
  thumbnail:
    "https://i.ytimg.com/vi/zOdUhsMydtM/hqdefault.jpg",

  subject: "Maths",
  category: "One Shot",
  chapter: "Sequence & Series",
  topic: "Sequence & Series",

  series_name: "Sequence & Series",
  video_type: "Lecture",
  study_role: "one_shot",

  exam: "JEE Main + Advanced",
  difficulty: "Standard",

  sequence_order: 1,

  ai_relevance: 1,
  ai_classification: {
    relevant: true,
    relevance: 1,
    subject: "Maths",
    category: "One Shot",
    chapter: "Sequence & Series",
    topic: "Sequence & Series",
    series_name: "Sequence & Series",
    video_type: "Lecture",
    study_role: "one_shot",
    exam: "JEE Main + Advanced",
    difficulty: "Standard"
  },

  status: "active",
  updated_at: new Date().toISOString()
};

const { data, error } = await supabase
  .from("videos")
  .upsert(video, {
    onConflict: "youtube_id"
  })
  .select()
  .single();

if (error) {
  console.error("❌ Insert failed:");
  console.error(error);
  process.exit(1);
}

console.log("✅ Sequence & Series added successfully!");
console.log(data);