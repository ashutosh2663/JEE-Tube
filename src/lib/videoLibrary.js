import { supabase } from "./supabase";

const SUBJECTS = {
  Physics: ["Physics"],
  Chemistry: ["Chemistry"],
  Mathematics: ["Mathematics", "Maths"],
};

export async function getHomeVideos(subject, limit = 8) {
  const subjects = SUBJECTS[subject] || [subject];

  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("status", "active")
    .in("subject", subjects)
    .order("sequence_order", {
      ascending: true,
      nullsFirst: false,
    })
    .order("published_at", {
      ascending: false,
      nullsFirst: false,
    })
    .limit(limit);

  if (error) {
    console.error(
      `Could not load ${subject} videos:`,
      error
    );

    return [];
  }

  return data || [];
}