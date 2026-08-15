
import React, { useCallback, useEffect, useState } from "react";
import {
  Play,
  ChevronRight,
  History,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function ContinueWatching() {
  const navigate = useNavigate();

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formatTime = (seconds) => {
    const total = Math.max(
      0,
      Math.floor(Number(seconds) || 0)
    );

    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const secs = total % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(
        2,
        "0"
      )}:${String(secs).padStart(2, "0")}`;
    }

    return `${minutes}:${String(secs).padStart(2, "0")}`;
  };

  // =========================================================
  // PARSE DURATION
  // Supports:
  // 1234
  // "1234"
  // "20:34"
  // "1:20:34"
  // =========================================================

  const parseDuration = (value) => {
    if (value === null || value === undefined) {
      return 0;
    }

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : 0;
    }

    const stringValue = String(value).trim();

    if (!stringValue) {
      return 0;
    }

    // Plain seconds
    if (/^\d+(\.\d+)?$/.test(stringValue)) {
      return Number(stringValue);
    }

    // HH:MM:SS or MM:SS
    const parts = stringValue.split(":").map(Number);

    if (parts.some((part) => !Number.isFinite(part))) {
      return 0;
    }

    if (parts.length === 3) {
      return (
        parts[0] * 3600 +
        parts[1] * 60 +
        parts[2]
      );
    }

    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }

    return 0;
  };

  // =========================================================
  // LOAD CONTINUE WATCHING
  // =========================================================

  const loadContinueWatching = useCallback(
    async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }

        // ---------------------------------------------------
        // 1. GET CURRENT USER
        // ---------------------------------------------------

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error(
            "Continue Watching auth error:",
            authError
          );

          setVideos([]);
          setLoading(false);
          return;
        }

        if (!user) {
          setVideos([]);
          setLoading(false);
          return;
        }

        // ---------------------------------------------------
        // 2. GET WATCH PROGRESS
        //
        // IMPORTANT:
        //
        // watch_progress.video_id
        //        ↓
        // videos.id
        //
        // NOT videos.youtube_id
        // ---------------------------------------------------

        const {
          data: progress,
          error: progressError,
        } = await supabase
          .from("watch_progress")
          .select(
            `
              video_id,
              current_time_seconds,
              completed,
              updated_at
            `
          )
          .eq("user_id", user.id)
          .eq("completed", false)
          .gt("current_time_seconds", 0)
          .order("updated_at", {
            ascending: false,
          })
          .limit(12);

        if (progressError) {
          console.error(
            "Continue Watching progress error:",
            progressError
          );

          setVideos([]);
          setLoading(false);
          return;
        }

        if (!progress || progress.length === 0) {
          setVideos([]);
          setLoading(false);
          return;
        }

        // ---------------------------------------------------
        // 3. GET DATABASE VIDEO IDs
        // ---------------------------------------------------

        const videoIds = progress
          .map((item) => item.video_id)
          .filter(Boolean);

        if (videoIds.length === 0) {
          setVideos([]);
          setLoading(false);
          return;
        }

        // ---------------------------------------------------
        // 4. GET VIDEO INFORMATION
        //
        // IMPORTANT:
        //
        // We match against videos.id.
        // ---------------------------------------------------

        const {
          data: videoData,
          error: videoError,
        } = await supabase
          .from("videos")
          .select("*")
          .in("id", videoIds);

        if (videoError) {
          console.error(
            "Continue Watching video error:",
            videoError
          );

          setVideos([]);
          setLoading(false);
          return;
        }

        if (!videoData || videoData.length === 0) {
          setVideos([]);
          setLoading(false);
          return;
        }

        // ---------------------------------------------------
        // 5. COMBINE VIDEO + PROGRESS
        // ---------------------------------------------------

        const combined = progress
          .map((item) => {
            const video = videoData.find(
              (v) => String(v.id) === String(item.video_id)
            );

            if (!video) {
              return null;
            }

            return {
              ...video,

              currentTime: Math.max(
                0,
                Number(item.current_time_seconds) || 0
              ),

              updatedAt: item.updated_at,
            };
          })
          .filter(Boolean);

        // Keep progress order:
        // newest watched first
        combined.sort((a, b) => {
          const dateA = new Date(
            a.updatedAt || 0
          ).getTime();

          const dateB = new Date(
            b.updatedAt || 0
          ).getTime();

          return dateB - dateA;
        });

        setVideos(combined);
        setLoading(false);
      } catch (error) {
        console.error(
          "Continue Watching error:",
          error
        );

        setVideos([]);
        setLoading(false);
      }
    },
    []
  );

  // =========================================================
  // INITIAL LOAD + AUTH LISTENER
  // =========================================================

  useEffect(() => {
    let active = true;

    const initialLoad = async () => {
      if (!active) return;

      await loadContinueWatching(true);
    };

    initialLoad();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async () => {
        if (!active) return;

        // Small delay prevents auth refresh events
        // from causing overlapping requests.
        setTimeout(() => {
          if (active) {
            loadContinueWatching(false);
          }
        }, 100);
      }
    );

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, [loadContinueWatching]);

  // =========================================================
  // GET VIDEO PROGRESS %
  // =========================================================

  const getProgress = (video) => {
    const current = Math.max(
      0,
      Number(video.currentTime) || 0
    );

    const duration = parseDuration(
      video.duration
    );

    if (
      !duration ||
      duration <= 0 ||
      current <= 0
    ) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (current / duration) * 100
      )
    );
  };

  // =========================================================
  // OPEN PLAYER
  // =========================================================

  const openVideo = (video) => {
    if (!video?.youtube_id) {
      console.error(
        "Cannot open video: missing youtube_id",
        video
      );
      return;
    }

    navigate(
      `/player/${video.youtube_id}`
    );
  };

  // =========================================================
  // KEYBOARD SUPPORT
  // =========================================================

  const handleKeyDown = (event, video) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      openVideo(video);
    }
  };

  // =========================================================
  // DON'T SHOW EMPTY SECTION
  // =========================================================

  if (
    !loading &&
    videos.length === 0
  ) {
    return null;
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <section className="continue-watching">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="continue-watching-header">

        <div className="continue-watching-title">

          <div className="continue-watching-icon">
            <History size={18} />
          </div>

          <div>
            <h2>
              Continue Watching
            </h2>

            <p>
              Pick up where you left off
            </p>
          </div>

        </div>

        {videos.length > 0 && (
          <button
            type="button"
            className="continue-watching-view-all"
            onClick={() =>
              navigate("/history")
            }
          >
            <span>
              View history
            </span>

            <ChevronRight size={18} />
          </button>
        )}

      </div>

      {/* =================================================
          LOADING SKELETON
      ================================================= */}

      {loading && (
        <div className="continue-watching-row">

          {[1, 2, 3, 4].map(
            (item) => (
              <div
                className="continue-card continue-card-loading"
                key={item}
              >
                <div className="continue-thumbnail skeleton" />

                <div className="continue-info">

                  <div className="skeleton-text skeleton-title" />

                  <div className="skeleton-text skeleton-meta" />

                  <div className="skeleton-text skeleton-small" />

                </div>
              </div>
            )
          )}

        </div>
      )}

      {/* =================================================
          VIDEO CARDS
      ================================================= */}

      {!loading &&
        videos.length > 0 && (
          <div className="continue-watching-row">

            {videos.map((video) => {

              const progress =
                getProgress(video);

              const thumbnail =
                video.thumbnail_url ||
                `https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`;

              return (
                <article
                  key={video.id}
                  className="continue-card"
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    openVideo(video)
                  }
                  onKeyDown={(event) =>
                    handleKeyDown(
                      event,
                      video
                    )
                  }
                >

                  {/* =================================
                      THUMBNAIL
                  ================================= */}

                  <div className="continue-thumbnail">

                    <img
                      src={thumbnail}
                      alt={
                        video.title ||
                        "JEE Lecture"
                      }
                      loading="lazy"
                    />

                    <div className="continue-thumbnail-gradient" />

                    <div className="continue-play-wrapper">

                      <div className="continue-play">

                        <Play
                          size={22}
                          fill="currentColor"
                        />

                      </div>

                    </div>

                    {/* Duration */}

                    {video.duration && (
                      <span className="continue-duration">
                        {formatTime(
                          parseDuration(
                            video.duration
                          )
                        )}
                      </span>
                    )}

                    {/* Current position */}

                    <span className="continue-position">
                      {formatTime(
                        video.currentTime
                      )}
                    </span>

                    {/* Progress */}

                    <div className="continue-progress">

                      <div
                        className="continue-progress-fill"
                        style={{
                          width: `${progress}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* =================================
                      VIDEO INFORMATION
                  ================================= */}

                  <div className="continue-info">

                    <h3
                      title={
                        video.title ||
                        "Untitled Lecture"
                      }
                    >
                      {video.title ||
                        "Untitled Lecture"}
                    </h3>

                    <div className="continue-meta">

                      {video.teacher && (
                        <span>
                          {video.teacher}
                        </span>
                      )}

                      {video.teacher &&
                        video.subject && (
                          <span className="continue-dot">
                            •
                          </span>
                        )}

                      {video.subject && (
                        <span>
                          {video.subject}
                        </span>
                      )}

                    </div>

                    <div className="continue-resume">

                      <Play
                        size={13}
                        fill="currentColor"
                      />

                      <span>
                        Continue from{" "}
                        {formatTime(
                          video.currentTime
                        )}
                      </span>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>
        )}

    </section>
  );
}
