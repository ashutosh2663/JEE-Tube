import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =========================================================
// ADMIN DASHBOARD
// =========================================================

router.get("/stats", async (req, res) => {
  try {
    const [
      videosResult,
      unclassifiedResult,
      rejectedResult,
    ] = await Promise.all([
      supabase
        .from("videos")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("unclassified_videos")
        .select("id", { count: "exact", head: true }),

      supabase
        .from("videos")
        .select("id", { count: "exact", head: true })
        .eq("status", "rejected"),
    ]);

    if (videosResult.error) {
      throw videosResult.error;
    }

    if (unclassifiedResult.error) {
      throw unclassifiedResult.error;
    }

    if (rejectedResult.error) {
      throw rejectedResult.error;
    }

    res.json({
      videos: videosResult.count || 0,
      unclassified: unclassifiedResult.count || 0,
      rejected: rejectedResult.count || 0,
    });
  } catch (error) {
    console.error("Admin stats error:", error);

    res.status(500).json({
      error: "Failed to load admin statistics.",
    });
  }
});

// =========================================================
// ALL VIDEOS
// =========================================================

router.get("/videos", async (req, res) => {
  try {
    const limit = Math.min(
      Number(req.query.limit) || 50,
      100
    );

    const offset = Math.max(
      Number(req.query.offset) || 0,
      0
    );

    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .range(
        offset,
        offset + limit - 1
      );

    if (error) {
      throw error;
    }

    res.json({
      videos: data || [],
      limit,
      offset,
    });
  } catch (error) {
    console.error("Admin videos error:", error);

    res.status(500).json({
      error: "Failed to load videos.",
    });
  }
});

// =========================================================
// UNCLASSIFIED VIDEOS
// =========================================================

router.get("/unclassified", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("unclassified_videos")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    res.json({
      videos: data || [],
    });
  } catch (error) {
    console.error(
      "Admin unclassified error:",
      error
    );

    res.status(500).json({
      error:
        "Failed to load unclassified videos.",
    });
  }
});

// =========================================================
// DELETE VIDEO
// =========================================================

router.delete("/videos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("videos")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Admin delete video error:",
      error
    );

    res.status(500).json({
      error: "Failed to delete video.",
    });
  }
});

export default router;