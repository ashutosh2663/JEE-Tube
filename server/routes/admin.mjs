import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { injectYoutubeUrl } from "../urlInjector.mjs";

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =========================================================
// ADMIN STATS
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

    if (videosResult.error) throw videosResult.error;
    if (unclassifiedResult.error) throw unclassifiedResult.error;
    if (rejectedResult.error) throw rejectedResult.error;

    res.json({
      videos: videosResult.count || 0,
      unclassified: unclassifiedResult.count || 0,
      rejected: rejectedResult.count || 0,
    });
  } catch (error) {
    console.error("Admin stats error:", error);

    res.status(500).json({
      error: "Failed to load admin statistics.",
      details: error?.message || "Unknown error",
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

    if (error) throw error;

    res.json({
      videos: data || [],
      limit,
      offset,
    });
  } catch (error) {
    console.error("Admin videos error:", error);

    res.status(500).json({
      error: "Failed to load videos.",
      details: error?.message || "Unknown error",
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

    if (error) throw error;

    res.json({
      videos: data || [],
    });
  } catch (error) {
    console.error(
      "Admin unclassified error:",
      error
    );

    res.status(500).json({
      error: "Failed to load unclassified videos.",
      details: error?.message || "Unknown error",
    });
  }
});

// =========================================================
// YOUTUBE URL INJECTOR
// POST /api/admin/inject-url
// =========================================================

router.post("/inject-url", async (req, res) => {
  try {
    const { url } = req.body || {};

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        success: false,
        error: "YouTube URL is required.",
      });
    }

    const cleanUrl = url.trim();

    if (!cleanUrl) {
      return res.status(400).json({
        success: false,
        error: "YouTube URL is required.",
      });
    }

    console.log("");
    console.log("========================================");
    console.log("      ADMIN VIDEO INJECTION REQUEST");
    console.log("========================================");
    console.log("URL:", cleanUrl);

    const result = await injectYoutubeUrl(cleanUrl);

    console.log("");
    console.log("Admin injection result:");
    console.log(
      JSON.stringify(result, null, 2)
    );

    if (!result) {
      return res.status(500).json({
        success: false,
        error: "Injector returned no result.",
      });
    }

    // Already exists
    if (
      result.action === "skipped" &&
      result.reason === "already_exists"
    ) {
      return res.status(200).json({
        success: true,
        action: "skipped",
        reason: "already_exists",
        id: result.id ?? null,
        ...result,
        message:
          "Video already exists in JEE-Tube.",
      });
    }

    // Normal result
    return res.status(200).json({
      success: true,
      action:
        result.action ||
        result.status ||
        "completed",
      ...result,
      message:
        result.message ||
        "Video processed successfully.",
    });

  } catch (error) {
    console.error(
      "Admin URL injection error:"
    );

    console.error(error);

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Video injection failed.",
    });
  }
});

// =========================================================
// DELETE VIDEO
// =========================================================

router.delete("/videos/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Video ID is required.",
      });
    }

    const { error } = await supabase
      .from("videos")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.json({
      success: true,
      message: "Video deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Admin delete video error:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Failed to delete video.",
      details: error?.message || "Unknown error",
    });
  }
});

export default router;