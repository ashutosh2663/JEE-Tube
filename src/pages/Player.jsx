import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { supabase } from "../lib/supabase";
import "../styles/player.css";

/*
 * =========================================================
 * STUDY ACTIONS
 * =========================================================
 */

const ACTIONS = [
  { type: "bookmark", icon: "🔖", label: "Bookmark" },
  { type: "important", icon: "⭐", label: "Important" },
  { type: "doubt", icon: "❓", label: "Doubt" },
  { type: "formula", icon: "🧮", label: "Formula" },
  { type: "concept", icon: "🧠", label: "Concept" },
];

/*
 * =========================================================
 * FALLBACK CHAPTER DATA
 * =========================================================
 */

const VIDEO_CHAPTERS = {
  zOdUhsMydtM: [
    { id: "chapter-1", time: 0, title: "Introduction" },
    { id: "chapter-2", time: 96, title: "Topics to be covered" },
    { id: "chapter-3", time: 285, title: "Arithmetic progression" },
    { id: "chapter-4", time: 544, title: "Properties of AP" },
    { id: "chapter-5", time: 6748, title: "Common term problems" },
    { id: "chapter-6", time: 8204, title: "Geometric progression" },
    { id: "chapter-7", time: 8334, title: "Properties of GP" },
    { id: "chapter-8", time: 8675, title: "Important format for GP" },
    { id: "chapter-9", time: 10151, title: "Special type GP problems" },
    { id: "chapter-10", time: 12208, title: "Harmonic progression" },
    { id: "chapter-11", time: 14542, title: "Means" },
    { id: "chapter-12", time: 14834, title: "Inserting Means" },
    { id: "chapter-13", time: 16770, title: "Important Concepts" },
    {
      id: "chapter-14",
      time: 17367,
      title: "Arithmetic geometric progression",
    },
    { id: "chapter-15", time: 19184, title: "Properties of Sigma" },
    { id: "chapter-16", time: 19557, title: "Formulas of Sigma" },
    { id: "chapter-17", time: 20232, title: "Miscellaneous sequences" },
    { id: "chapter-18", time: 21498, title: "Shortcut method for Tn" },
    {
      id: "chapter-19",
      time: 22085,
      title: "Telescopic method of difference",
    },
    { id: "chapter-20", time: 25390, title: "AM-GM-HM Inequality" },
    { id: "chapter-21", time: 26457, title: "Exponential Series" },
    { id: "chapter-22", time: 28412, title: "Logarithmic Series" },
    { id: "chapter-23", time: 29195, title: "Thankyou bachhon" },
  ],
};

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function formatTime(seconds) {
  const s = Math.floor(Number(seconds) || 0);

  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(
      2,
      "0"
    )}`;
  }

  return `${m}:${String(sec).padStart(2, "0")}`;
}

function getActiveChapter(chapters, currentTime) {
  if (!chapters.length) return null;

  let active = chapters[0];

  for (const chapter of chapters) {
    if (currentTime >= chapter.time) {
      active = chapter;
    } else {
      break;
    }
  }

  return active;
}

function isValidYouTubeId(id) {
  return /^[a-zA-Z0-9_-]{11}$/.test(id || "");
}

function normalizeChapters(chapters) {
  if (!Array.isArray(chapters)) return [];

  return chapters
    .map((chapter, index) => ({
      id:
        chapter?.id ||
        chapter?.chapter_id ||
        `chapter-${index + 1}`,

      time: Number(
        chapter?.time ??
          chapter?.start_time ??
          chapter?.timestamp ??
          0
      ),

      title:
        chapter?.title ||
        chapter?.name ||
        `Chapter ${index + 1}`,
    }))
    .filter(
      (chapter) =>
        Number.isFinite(chapter.time) &&
        chapter.time >= 0
    )
    .sort((a, b) => a.time - b.time);
}

/*
 * =========================================================
 * PLAYER
 * =========================================================
 */

export default function Player() {
  const { videoId: routeVideoId } = useParams();
  const navigate = useNavigate();

  const playerRef = useRef(null);
  const intervalRef = useRef(null);
  const progressSaveRef = useRef(null);

  /*
   * =========================================================
   * VIDEO
   * =========================================================
   */

  const [video, setVideo] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [videoError, setVideoError] = useState("");

  /*
   * =========================================================
   * PLAYER STATE
   * =========================================================
   */

  const [currentTime, setCurrentTime] = useState(0);
  const [playerError, setPlayerError] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);

  /*
   * =========================================================
   * MARKERS
   * =========================================================
   */

  const [markers, setMarkers] = useState([]);
  const [loadingMarkers, setLoadingMarkers] = useState(true);

  /*
   * =========================================================
   * NOTES
   * =========================================================
   */

  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  /*
   * =========================================================
   * CHAPTERS
   * =========================================================
   */

  const [chaptersOpen, setChaptersOpen] = useState(false);

  /*
   * =========================================================
   * AUTH
   * =========================================================
   */

  const [user, setUser] = useState(null);

  /*
   * =========================================================
   * DERIVED VIDEO IDS
   * =========================================================
   *
   * databaseVideoId:
   *     videos.id
   *
   * youtubeId:
   *     videos.youtube_id
   */

  const databaseVideoId = video?.id ?? null;
  const youtubeId = video?.youtube_id || "";
  const validYouTubeId = isValidYouTubeId(youtubeId);

  /*
   * =========================================================
   * AUTH
   * =========================================================
   */

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (mounted) {
        setUser(user || null);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setUser(session?.user || null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
   * =========================================================
   * LOAD VIDEO
   * =========================================================
   *
   * PRIMARY:
   *     /player/672
   *     -> videos.id = 672
   *
   * FALLBACK:
   *     /player/zOdUhsMydtM
   *     -> videos.youtube_id = zOdUhsMydtM
   */

  useEffect(() => {
    let cancelled = false;

    async function loadVideo() {
      setLoadingVideo(true);
      setVideoError("");
      setVideo(null);
      setCurrentTime(0);
      setResumeTime(0);
      setPlayerError(false);

      if (!routeVideoId) {
        setVideoError("No video ID was provided.");
        setLoadingVideo(false);
        return;
      }

      let data = null;
      let error = null;

      /*
       * -------------------------------------------------------
       * FIRST: DATABASE ID
       * -------------------------------------------------------
       */

      const numericId = Number(routeVideoId);

      if (
        Number.isInteger(numericId) &&
        numericId > 0
      ) {
        const result = await supabase
          .from("videos")
          .select("*")
          .eq("id", numericId)
          .maybeSingle();

        data = result.data;
        error = result.error;
      }

      /*
       * -------------------------------------------------------
       * SECOND: YOUTUBE ID FALLBACK
       * -------------------------------------------------------
       */

      if (!data && !error) {
        const result = await supabase
          .from("videos")
          .select("*")
          .eq("youtube_id", routeVideoId)
          .maybeSingle();

        data = result.data;
        error = result.error;
      }

      if (cancelled) return;

      if (error) {
        console.error(
          "Failed to load video:",
          error
        );

        setVideoError(
          "Could not load this video from the database."
        );

        setLoadingVideo(false);
        return;
      }

      if (!data) {
        setVideoError(
          "This video could not be found in the JEE-Tube database."
        );

        setLoadingVideo(false);
        return;
      }

      /*
       * -------------------------------------------------------
       * VALIDATE YOUTUBE ID
       * -------------------------------------------------------
       */

      if (!isValidYouTubeId(data.youtube_id)) {
        console.error(
          "Invalid youtube_id in database:",
          data.youtube_id
        );

        setVideoError(
          "This video has an invalid YouTube ID in the database."
        );

        setLoadingVideo(false);
        return;
      }

      console.log("JEE-Tube video loaded:", {
        databaseId: data.id,
        youtubeId: data.youtube_id,
        title: data.title,
      });

      setVideo(data);
      setLoadingVideo(false);
    }

    loadVideo();

    return () => {
      cancelled = true;
    };
  }, [routeVideoId]);

  /*
   * =========================================================
   * CHAPTERS
   * =========================================================
   *
   * Priority:
   *
   * 1. videos.chapters
   * 2. fallback chapters
   */

  const chapters = useMemo(() => {
    const databaseChapters =
      normalizeChapters(video?.chapters);

    if (databaseChapters.length > 0) {
      return databaseChapters;
    }

    return VIDEO_CHAPTERS[youtubeId] || [];
  }, [video, youtubeId]);

  const activeChapter = getActiveChapter(
    chapters,
    currentTime
  );

  /*
   * =========================================================
   * LOAD WATCH PROGRESS
   * =========================================================
   *
   * IMPORTANT:
   *
   * watch_progress.video_id
   * references videos.id.
   */

  useEffect(() => {
    let cancelled = false;

    async function loadWatchProgress() {
      if (!user || !databaseVideoId) {
        setResumeTime(0);
        return;
      }

      const { data, error } = await supabase
        .from("watch_progress")
        .select(
          "current_time_seconds, completed"
        )
        .eq("user_id", user.id)
        .eq("video_id", databaseVideoId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error(
          "Failed to load watch progress:",
          error
        );

        setResumeTime(0);
        return;
      }

      if (data) {
        const savedTime = Number(
          data.current_time_seconds || 0
        );

        setResumeTime(
          data.completed ? 0 : savedTime
        );
      } else {
        setResumeTime(0);
      }
    }

    loadWatchProgress();

    return () => {
      cancelled = true;
    };
  }, [user, databaseVideoId]);

  /*
   * =========================================================
   * LOAD STUDY MARKERS
   * =========================================================
   *
   * IMPORTANT:
   *
   * Your current study_markers setup uses the YouTube ID.
   * Therefore this intentionally uses youtubeId.
   */

  useEffect(() => {
    let cancelled = false;

    async function loadMarkers() {
      setLoadingMarkers(true);

      if (!user || !validYouTubeId) {
        setMarkers([]);
        setLoadingMarkers(false);
        return;
      }

      const { data, error } = await supabase
        .from("study_markers")
        .select("*")
        .eq("user_id", user.id)
        .eq("video_id", youtubeId)
        .order("time", {
          ascending: true,
        });

      if (cancelled) return;

      if (error) {
        console.error(
          "Failed to load study markers:",
          error
        );

        setMarkers([]);
      } else {
        setMarkers(
          (data || []).map((marker) => ({
            id: marker.id,
            videoId: marker.video_id,
            type: marker.type,
            time: Number(marker.time || 0),
            text: marker.text || "",
            createdAt: marker.created_at,
          }))
        );
      }

      setLoadingMarkers(false);
    }

    loadMarkers();

    return () => {
      cancelled = true;
    };
  }, [user, youtubeId, validYouTubeId]);

  /*
   * =========================================================
   * SAVE WATCH PROGRESS
   * =========================================================
   */

  async function saveWatchProgress(time) {
    if (!user || !databaseVideoId) {
      return;
    }

    const seconds = Math.max(
      0,
      Math.floor(Number(time) || 0)
    );

    if (progressSaveRef.current) {
      clearTimeout(progressSaveRef.current);
    }

    progressSaveRef.current = setTimeout(
      async () => {
        const { error } = await supabase
          .from("watch_progress")
          .upsert(
            {
              user_id: user.id,
              video_id: databaseVideoId,
              current_time_seconds: seconds,
              completed: false,
            },
            {
              onConflict: "user_id,video_id",
            }
          );

        if (error) {
          console.error(
            "Failed to save watch progress:",
            error
          );
        }
      },
      800
    );
  }

  /*
   * =========================================================
   * SAVE COMPLETED VIDEO
   * =========================================================
   */

  async function saveCompletedProgress() {
    if (!user || !databaseVideoId) {
      return;
    }

    const { error } = await supabase
      .from("watch_progress")
      .upsert(
        {
          user_id: user.id,
          video_id: databaseVideoId,
          current_time_seconds: 0,
          completed: true,
        },
        {
          onConflict: "user_id,video_id",
        }
      );

    if (error) {
      console.error(
        "Failed to save completed status:",
        error
      );
    }
  }

  /*
   * =========================================================
   * YOUTUBE PLAYER
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    clearInterval(intervalRef.current);

    if (
      loadingVideo ||
      !video ||
      !validYouTubeId
    ) {
      return;
    }

    setPlayerError(false);

    function startTimeTracking() {
      clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        try {
          if (
            playerRef.current &&
            typeof playerRef.current.getCurrentTime ===
              "function"
          ) {
            const time =
              playerRef.current.getCurrentTime();

            if (Number.isFinite(time)) {
              setCurrentTime(time);
              saveWatchProgress(time);
            }
          }
        } catch {
          // Player not ready.
        }
      }, 5000);
    }

    function createPlayer() {
      if (
        cancelled ||
        !window.YT ||
        !window.YT.Player ||
        !validYouTubeId
      ) {
        return;
      }

      try {
        playerRef.current?.destroy();
      } catch {
        // Ignore.
      }

      playerRef.current = new window.YT.Player(
        "jee-tube-player",
        {
          videoId: youtubeId,

          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
          },

          events: {
            onReady: (event) => {
              startTimeTracking();

              /*
               * Resume previous position.
               */

              if (resumeTime > 5) {
                event.target.seekTo(
                  resumeTime,
                  true
                );

                setCurrentTime(
                  resumeTime
                );
              }
            },

            onStateChange: (event) => {
              /*
               * 0 = ended
               * 1 = playing
               * 2 = paused
               */

              if (event.data === 0) {
                saveCompletedProgress();
              }

              if (
                event.data === 1 ||
                event.data === 2
              ) {
                try {
                  const time =
                    event.target.getCurrentTime();

                  if (Number.isFinite(time)) {
                    setCurrentTime(time);
                    saveWatchProgress(time);
                  }
                } catch {
                  // Ignore.
                }
              }
            },

            onError: (event) => {
              console.error(
                "YouTube player error:",
                event.data
              );

              setPlayerError(true);
            },
          },
        }
      );
    }

    /*
     * YouTube API already loaded.
     */

    if (
      window.YT &&
      window.YT.Player
    ) {
      createPlayer();
    } else {
      /*
       * YouTube API not loaded yet.
       */

      const previousCallback =
        window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        previousCallback?.();

        if (!cancelled) {
          createPlayer();
        }
      };

      if (
        !document.getElementById(
          "youtube-iframe-api"
        )
      ) {
        const script =
          document.createElement("script");

        script.id =
          "youtube-iframe-api";

        script.src =
          "https://www.youtube.com/iframe_api";

        script.async = true;

        document.body.appendChild(script);
      }
    }

    return () => {
      cancelled = true;

      clearInterval(
        intervalRef.current
      );

      if (progressSaveRef.current) {
        clearTimeout(
          progressSaveRef.current
        );
      }

      try {
        playerRef.current?.destroy();
      } catch {
        // Ignore.
      }

      playerRef.current = null;
    };
  }, [
    video,
    youtubeId,
    validYouTubeId,
    loadingVideo,
    resumeTime,
  ]);

  /*
   * =========================================================
   * CURRENT TIME
   * =========================================================
   */

  function getCurrentTimestamp() {
    try {
      if (
        playerRef.current &&
        typeof playerRef.current.getCurrentTime ===
          "function"
      ) {
        const time =
          playerRef.current.getCurrentTime();

        if (Number.isFinite(time)) {
          setCurrentTime(time);
          return time;
        }
      }
    } catch {
      // Fallback.
    }

    return currentTime;
  }

  /*
   * =========================================================
   * ADD STUDY MARKER
   * =========================================================
   */

  async function addMarker(type) {
    if (!user) {
      alert(
        "Please sign in to save your study points."
      );

      navigate("/login");
      return;
    }

    if (!validYouTubeId) {
      alert("Invalid YouTube video.");
      return;
    }

    const timestamp =
      getCurrentTimestamp();

    const marker = {
      id: crypto.randomUUID(),
      videoId: youtubeId,
      type,
      time: timestamp,
      createdAt:
        new Date().toISOString(),
      text: "",
    };

    /*
     * Optimistic UI.
     */

    setMarkers((previous) =>
      [...previous, marker].sort(
        (a, b) => a.time - b.time
      )
    );

    const { error } = await supabase
      .from("study_markers")
      .insert({
        id: marker.id,
        user_id: user.id,
        video_id: youtubeId,
        type: marker.type,
        time: Math.floor(marker.time),
        text: marker.text,
        created_at: marker.createdAt,
      });

    if (error) {
      console.error(
        "Failed to save marker:",
        error
      );

      setMarkers((previous) =>
        previous.filter(
          (item) =>
            item.id !== marker.id
        )
      );

      alert(
        "Could not save this study point."
      );
    }
  }

  /*
   * =========================================================
   * NOTES
   * =========================================================
   */

  function openNote() {
    if (!user) {
      alert(
        "Please sign in to save notes."
      );

      navigate("/login");
      return;
    }

    getCurrentTimestamp();

    setNoteText("");
    setNoteOpen(true);
  }

  async function saveNote() {
    if (!noteText.trim()) return;

    if (!user) {
      alert(
        "Please sign in to save notes."
      );

      navigate("/login");
      return;
    }

    const timestamp =
      getCurrentTimestamp();

    const marker = {
      id: crypto.randomUUID(),
      videoId: youtubeId,
      type: "note",
      time: timestamp,
      text: noteText.trim(),
      createdAt:
        new Date().toISOString(),
    };

    setMarkers((previous) =>
      [...previous, marker].sort(
        (a, b) => a.time - b.time
      )
    );

    setNoteOpen(false);
    setNoteText("");

    const { error } = await supabase
      .from("study_markers")
      .insert({
        id: marker.id,
        user_id: user.id,
        video_id: youtubeId,
        type: "note",
        time: Math.floor(timestamp),
        text: marker.text,
        created_at: marker.createdAt,
      });

    if (error) {
      console.error(
        "Failed to save note:",
        error
      );

      setMarkers((previous) =>
        previous.filter(
          (item) =>
            item.id !== marker.id
        )
      );

      alert(
        "Could not save your note."
      );
    }
  }

  /*
   * =========================================================
   * JUMP TO MARKER
   * =========================================================
   */

  function jumpToMarker(marker) {
    try {
      if (
        playerRef.current?.seekTo
      ) {
        playerRef.current.seekTo(
          marker.time,
          true
        );

        playerRef.current.playVideo?.();

        setCurrentTime(marker.time);
      }
    } catch {
      // Ignore.
    }
  }

  /*
   * =========================================================
   * JUMP TO CHAPTER
   * =========================================================
   */

  function jumpToChapter(chapter) {
    try {
      if (
        playerRef.current?.seekTo
      ) {
        playerRef.current.seekTo(
          chapter.time,
          true
        );

        playerRef.current.playVideo?.();
      }

      setCurrentTime(chapter.time);
      setChaptersOpen(false);
    } catch {
      // Ignore.
    }
  }

  /*
   * =========================================================
   * DELETE MARKER
   * =========================================================
   */

  async function deleteMarker(id) {
    if (!user) return;

    const oldMarker =
      markers.find(
        (marker) =>
          marker.id === id
      );

    setMarkers((previous) =>
      previous.filter(
        (marker) =>
          marker.id !== id
      )
    );

    const { error } = await supabase
      .from("study_markers")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "Failed to delete marker:",
        error
      );

      if (oldMarker) {
        setMarkers((previous) =>
          [
            ...previous,
            oldMarker,
          ].sort(
            (a, b) =>
              a.time - b.time
          )
        );
      }

      alert(
        "Could not delete this study point."
      );
    }
  }

  /*
   * =========================================================
   * ICONS
   * =========================================================
   */

  const iconFor = {
    bookmark: "🔖",
    important: "⭐",
    doubt: "❓",
    formula: "🧮",
    concept: "🧠",
    note: "📝",
  };

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loadingVideo) {
    return (
      <Layout>
        <main className="jt-player-page">
          <button
            onClick={() => navigate(-1)}
            className="jt-player-back"
          >
            ← Back
          </button>

          <div className="jt-player-loading">
            Loading video...
          </div>
        </main>
      </Layout>
    );
  }

  /*
   * =========================================================
   * DATABASE ERROR
   * =========================================================
   */

  if (videoError || !video) {
    return (
      <Layout>
        <main className="jt-player-page">
          <button
            onClick={() => navigate(-1)}
            className="jt-player-back"
          >
            ← Back
          </button>

          <div className="jt-player-error">
            <div className="jt-player-error-icon">
              ⚠️
            </div>

            <h2>
              Video unavailable
            </h2>

            <p>
              {videoError ||
                "This video could not be loaded."}
            </p>

            <small>
              Requested ID:{" "}
              {routeVideoId}
            </small>

            <button
              onClick={() =>
                navigate("/")
              }
              className="jt-player-error-button"
            >
              Go Home
            </button>
          </div>
        </main>
      </Layout>
    );
  }

  /*
   * =========================================================
   * MAIN PLAYER
   * =========================================================
   */

  return (
    <Layout>
      <div className="jt-player-page">

        <button
          onClick={() => navigate(-1)}
          className="jt-player-back"
        >
          ← Back
        </button>

        {/* VIDEO */}

        <div className="jt-player-wrapper">
          <div id="jee-tube-player" />
        </div>

        {playerError && (
          <div className="jt-player-error">
            <div className="jt-player-error-icon">
              ⚠️
            </div>

            <h2>
              Unable to play this video
            </h2>

            <p>
              YouTube could not play this
              video.
            </p>

            <small>
              YouTube ID:{" "}
              {youtubeId}
            </small>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="jt-player-error-button"
            >
              Retry
            </button>
          </div>
        )}

        {/* VIDEO INFORMATION */}

        <section className="jt-video-info">
          <h1>{video.title}</h1>

          <div className="jt-video-meta">
            {video.teacher && (
              <span>
                👨‍🏫 {video.teacher}
              </span>
            )}

            {video.subject && (
              <span>
                📚 {video.subject}
              </span>
            )}

            {video.chapter && (
              <span>
                📖 {video.chapter}
              </span>
            )}

            {video.exam && (
              <span>
                🎯 {video.exam}
              </span>
            )}

            {video.difficulty && (
              <span>
                ⚡ {video.difficulty}
              </span>
            )}
          </div>
        </section>

        {/* CURRENT TIME */}

        <div className="jt-player-time">
          Current position:{" "}
          <strong>
            {formatTime(currentTime)}
          </strong>

          {resumeTime > 5 &&
            Math.abs(
              currentTime - resumeTime
            ) < 1 && (
              <span className="jt-resume-label">
                Resumed from{" "}
                {formatTime(resumeTime)}
              </span>
            )}
        </div>

        {/* TOOLBAR */}

        <div className="jt-player-toolbar">

          {/* CHAPTERS */}

          {chapters.length > 0 && (
            <div className="jt-chapters">

              <button
                className={`jt-chapters-button ${
                  chaptersOpen
                    ? "open"
                    : ""
                }`}
                onClick={() =>
                  setChaptersOpen(
                    (previous) =>
                      !previous
                  )
                }
              >
                <span>📑</span>

                <span className="jt-current-chapter">
                  {activeChapter
                    ? activeChapter.title
                    : "Chapters"}
                </span>

                <span className="jt-chapters-arrow">
                  {chaptersOpen
                    ? "▲"
                    : "▼"}
                </span>
              </button>

              {chaptersOpen && (
                <div className="jt-chapters-dropdown">

                  <div className="jt-chapters-header">
                    <strong>
                      Chapters
                    </strong>

                    <span>
                      {chapters.length}
                    </span>
                  </div>

                  <div className="jt-chapters-list">
                    {chapters.map(
                      (chapter) => {
                        const isActive =
                          activeChapter?.id ===
                          chapter.id;

                        return (
                          <button
                            key={
                              chapter.id
                            }
                            className={`jt-chapter-item ${
                              isActive
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              jumpToChapter(
                                chapter
                              )
                            }
                          >
                            <span className="jt-chapter-play">
                              {isActive
                                ? "▶"
                                : ""}
                            </span>

                            <span className="jt-chapter-title">
                              {
                                chapter.title
                              }
                            </span>

                            <span className="jt-chapter-time">
                              {formatTime(
                                chapter.time
                              )}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STUDY ACTIONS */}

          {ACTIONS.map(
            (action) => (
              <button
                key={
                  action.type
                }
                onClick={() =>
                  addMarker(
                    action.type
                  )
                }
                className="jt-study-action"
                title={`Save ${action.label} at current position`}
              >
                <span>
                  {action.icon}
                </span>

                {action.label}
              </button>
            )
          )}

          {/* NOTE */}

          <button
            onClick={openNote}
            className="jt-study-action"
          >
            <span>📝</span>
            Note
          </button>
        </div>

        {/* LOGIN HINT */}

        {!user && (
          <div className="jt-login-hint">
            <span>🔐</span>

            <span>
              Sign in to save
              bookmarks, notes
              and study points
              across all your
              devices.
            </span>

            <button
              onClick={() =>
                navigate("/login")
              }
            >
              Sign in
            </button>
          </div>
        )}

        {/* MARKER LOADING */}

        {loadingMarkers &&
          user && (
            <div className="jt-markers-loading">
              Loading your study
              points...
            </div>
          )}

        {/* NOTE BOX */}

        {noteOpen && (
          <div className="jt-note-box">

            <div className="jt-note-header">
              <strong>
                Note at{" "}
                {formatTime(
                  currentTime
                )}
              </strong>

              <button
                onClick={() =>
                  setNoteOpen(
                    false
                  )
                }
                className="jt-note-close"
              >
                ×
              </button>
            </div>

            <textarea
              autoFocus
              value={noteText}
              onChange={(e) =>
                setNoteText(
                  e.target.value
                )
              }
              placeholder="Write your note..."
              className="jt-note-textarea"
            />

            <div className="jt-note-actions">

              <button
                onClick={() =>
                  setNoteOpen(
                    false
                  )
                }
                className="jt-note-cancel"
              >
                Cancel
              </button>

              <button
                onClick={saveNote}
                className="jt-note-save"
              >
                Save Note
              </button>

            </div>
          </div>
        )}

        {/* STUDY POINTS */}

        <section className="jt-markers-section">

          <h2>
            My Study Points
          </h2>

          {!user ? (
            <div className="jt-markers-empty">
              Sign in to see your
              saved study points.
            </div>
          ) : loadingMarkers ? (
            <div className="jt-markers-empty">
              Loading your study
              points...
            </div>
          ) : markers.length === 0 ? (
            <div className="jt-markers-empty">
              Pause the lecture
              and save a bookmark,
              important point,
              doubt, formula or
              concept.
            </div>
          ) : (
            <div className="jt-markers">

              {[...markers]
                .sort(
                  (a, b) =>
                    a.time - b.time
                )
                .map(
                  (marker) => (
                    <div
                      key={
                        marker.id
                      }
                      className="jt-marker"
                    >

                      <button
                        onClick={() =>
                          jumpToMarker(
                            marker
                          )
                        }
                        className="jt-marker-main"
                      >
                        <span className="jt-marker-icon">
                          {
                            iconFor[
                              marker.type
                            ] ||
                            "📍"
                          }
                        </span>

                        <span>
                          <strong>
                            {formatTime(
                              marker.time
                            )}
                          </strong>

                          <span className="jt-marker-type">
                            {
                              marker.type
                            }
                          </span>

                          {marker.text && (
                            <span className="jt-marker-text">
                              {
                                marker.text
                              }
                            </span>
                          )}
                        </span>
                      </button>

                      <button
                        onClick={() =>
                          deleteMarker(
                            marker.id
                          )
                        }
                        className="jt-marker-delete"
                        title="Delete"
                      >
                        ×
                      </button>

                    </div>
                  )
                )}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}