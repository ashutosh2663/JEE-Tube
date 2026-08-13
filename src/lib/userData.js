import { supabase } from "./supabase";


// =========================================
// GET CURRENT USER
// =========================================

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Auth error:", error);
    return null;
  }

  return user;
}


// =========================================
// BOOKMARKS
// =========================================

export async function getBookmarks(videoId) {
  const user = await getCurrentUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("video_bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .eq("video_id", videoId)
    .order("timestamp_seconds", {
      ascending: true,
    });

  if (error) {
    console.error("Could not load bookmarks:", error);
    return [];
  }

  return data || [];
}


export async function createBookmark({
  videoId,
  type = "bookmark",
  timestamp = 0,
  note = "",
}) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { data, error } = await supabase
    .from("video_bookmarks")
    .insert({
      user_id: user.id,
      video_id: videoId,
      marker_type: type,
      timestamp_seconds: timestamp,
      note: note || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Could not create bookmark:", error);
    throw error;
  }

  return data;
}


export async function deleteBookmark(id) {
  const user = await getCurrentUser();

  if (!user) return;

  const { error } = await supabase
    .from("video_bookmarks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Could not delete bookmark:", error);
    throw error;
  }
}


// =========================================
// VIDEO PROGRESS
// =========================================

export async function getVideoProgress(videoId) {
  const user = await getCurrentUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("video_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("video_id", videoId)
    .maybeSingle();

  if (error) {
    console.error("Could not load progress:", error);
    return null;
  }

  return data;
}


export async function saveVideoProgress({
  videoId,
  position,
  duration,
}) {
  const user = await getCurrentUser();

  if (!user) return;

  const safePosition = Math.max(
    0,
    Number(position) || 0
  );

  const safeDuration = Math.max(
    0,
    Number(duration) || 0
  );

  const completed =
    safeDuration > 0 &&
    safePosition >= safeDuration * 0.95;

  const { error } = await supabase
    .from("video_progress")
    .upsert(
      {
        user_id: user.id,
        video_id: videoId,
        position_seconds: safePosition,
        duration_seconds: safeDuration,
        completed,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,video_id",
      }
    );

  if (error) {
    console.error("Could not save progress:", error);
  }
}


// =========================================
// HISTORY
// =========================================

export async function addToHistory(videoId) {
  const user = await getCurrentUser();

  if (!user) return;

  const { error } = await supabase
    .from("watch_history")
    .insert({
      user_id: user.id,
      video_id: videoId,
    });

  if (error) {
    console.error("Could not save history:", error);
  }
}


export async function getHistory(limit = 50) {
  const user = await getCurrentUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("watch_history")
    .select("*")
    .eq("user_id", user.id)
    .order("watched_at", {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    console.error("Could not load history:", error);
    return [];
  }

  return data || [];
}


// =========================================
// WATCH LATER
// =========================================

export async function addToWatchLater(videoId) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { error } = await supabase
    .from("watch_later")
    .upsert(
      {
        user_id: user.id,
        video_id: videoId,
      },
      {
        onConflict: "user_id,video_id",
      }
    );

  if (error) {
    console.error(
      "Could not add to Watch Later:",
      error
    );

    throw error;
  }
}


export async function removeFromWatchLater(videoId) {
  const user = await getCurrentUser();

  if (!user) return;

  const { error } = await supabase
    .from("watch_later")
    .delete()
    .eq("user_id", user.id)
    .eq("video_id", videoId);

  if (error) {
    console.error(
      "Could not remove Watch Later:",
      error
    );

    throw error;
  }
}


export async function getWatchLater() {
  const user = await getCurrentUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("watch_later")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Could not load Watch Later:",
      error
    );

    return [];
  }

  return data || [];
}