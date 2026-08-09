import "dotenv/config";
import { supabase } from "./config.mjs";

const video = {
  youtube_id: "zOdUhsMydtM",
  title:
    "SEQUENCE & SERIES in One Shot: All Concepts & PYQs Covered | JEE Main & Advanced",
  description:
    "Sequence and Series complete JEE Main and Advanced one-shot lecture with concepts and PYQs.",
  thumbnail:
    "https://i.ytimg.com/vi/zOdUhsMydtM/hqdefault.jpg",
  channel_name: null,
  channel_id: null,
  teacher: null,

  subject: "Maths",
  category: "One Shot",
  chapter: "Sequence & Series",
  topic: "Sequence & Series",

  duration_seconds: null,
  published_at: null,

  series_name: "Sequence & Series",
  video_type: "One Shot",
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
    video_type: "One Shot",
    study_role: "one_shot",
    exam: "JEE Main + Advanced",
    difficulty: "Standard",
    sequence_hint: 1
  },

  status: "active"
};

const { data, error } = await supabase
  .from("videos")
  .upsert(video, {
    onConflict: "youtube_id"
  })
  .select()
  .single();

if (error) {
  console.error("Injection failed:");
  console.error(error);
  process.exit(1);
}

console.log("Sequence & Series video inserted:");
console.log(data);