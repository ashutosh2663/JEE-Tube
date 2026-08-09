import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "jee-tube-study-markers";

const ACTIONS = [
  { type: "bookmark", icon: "🔖", label: "Bookmark" },
  { type: "important", icon: "⭐", label: "Important" },
  { type: "doubt", icon: "❓", label: "Doubt" },
  { type: "formula", icon: "🧮", label: "Formula" },
  { type: "concept", icon: "🧠", label: "Concept" },
];

const ICONS = {
  bookmark: "🔖",
  important: "⭐",
  doubt: "❓",
  formula: "🧮",
  concept: "🧠",
  note: "📝",
};

function formatTime(seconds) {
  const s = Math.floor(seconds || 0);
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

/*
  Converts timestamps from a video description into chapters.

  Examples supported:

  0:00 Introduction
  12:35 Arithmetic Progression
  1:04:20 Geometric Progression
*/
function extractChapters(description = "") {
  const lines = description.split(/\r?\n/);

  const chapters = [];

  const timestampRegex =
    /(?:^|\s)(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+?)(?=\s*$)/;

  for (const line of lines) {
    const match = line.trim().match(timestampRegex);

    if (!match) continue;

    const timeText = match[1];
    const title = match[2].trim();

    const parts = timeText.split(":").map(Number);

    let seconds = 0;

    if (parts.length === 2) {
      seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      seconds =
        parts[0] * 3600 +
        parts[1] * 60 +
        parts[2];
    }

    if (!title) continue;

    chapters.push({
      time: seconds,
      title,
    });
  }

  return chapters.sort((a, b) => a.time - b.time);
}

export default function Player() {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [markers, setMarkers] = useState([]);

  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  const [videoInfo, setVideoInfo] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [playerReady, setPlayerReady] = useState(false);

  // --------------------------------------------------
  // Load saved markers
  // --------------------------------------------------

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      setMarkers(
        saved.filter(
          (marker) => marker.videoId === videoId
        )
      );
    } catch {
      setMarkers([]);
    }
  }, [videoId]);

  // --------------------------------------------------
  // Save markers
  // --------------------------------------------------

  useEffect(() => {
    try {
      const all = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      const otherVideos = all.filter(
        (marker) => marker.videoId !== videoId
      );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([
          ...otherVideos,
          ...markers,
        ])
      );
    } catch {
      // Ignore localStorage errors
    }
  }, [markers, videoId]);

  // --------------------------------------------------
  // Load video information + chapters from Supabase
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadVideoInfo() {
      const { data, error } = await supabase
        .from("videos")
        .select(
          "youtube_id,title,description,thumbnail,teacher,subject,chapter,series_name"
        )
        .eq("youtube_id", videoId)
        .maybeSingle();

      if (error) {
        console.error(
          "Player video lookup failed:",
          error
        );
        return;
      }

      if (cancelled) return;

      if (data) {
        setVideoInfo(data);

        const extracted =
          extractChapters(data.description || "");

        setChapters(extracted);
      }
    }

    loadVideoInfo();

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  // --------------------------------------------------
  // YouTube IFrame Player
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    function startTimeTracking() {
      clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        try {
          if (playerRef.current?.getCurrentTime) {
            setCurrentTime(
              playerRef.current.getCurrentTime()
            );
          }
        } catch {
          // Player not ready
        }
      }, 500);
    }

    function createPlayer() {
      if (
        cancelled ||
        !window.YT ||
        !window.YT.Player
      ) {
        return;
      }

      playerRef.current = new window.YT.Player(
        "jee-tube-player",
        {
          videoId,

          playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
          },

          events: {
            onReady: () => {
              if (cancelled) return;

              setPlayerReady(true);
              startTimeTracking();
            },

            onStateChange: () => {
              try {
                if (
                  playerRef.current?.getCurrentTime
                ) {
                  setCurrentTime(
                    playerRef.current.getCurrentTime()
                  );
                }
              } catch {
                // Ignore
              }
            },
          },
        }
      );
    }

    if (
      window.YT &&
      window.YT.Player
    ) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady =
        createPlayer;

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

        document.body.appendChild(script);
      }
    }

    return () => {
      cancelled = true;

      clearInterval(intervalRef.current);

      try {
        playerRef.current?.destroy();
      } catch {
        // Ignore
      }

      playerRef.current = null;
      setPlayerReady(false);
    };
  }, [videoId]);

  // --------------------------------------------------
  // Current timestamp
  // --------------------------------------------------

  function getCurrentTimestamp() {
    try {
      if (
        playerRef.current?.getCurrentTime
      ) {
        const time =
          playerRef.current.getCurrentTime();

        setCurrentTime(time);

        return time;
      }
    } catch {
      // fallback
    }

    return currentTime;
  }

  // --------------------------------------------------
  // Add study marker
  // --------------------------------------------------

  function addMarker(type) {
    const timestamp =
      getCurrentTimestamp();

    const marker = {
      id: crypto.randomUUID(),
      videoId,
      type,
      time: timestamp,
      createdAt:
        new Date().toISOString(),
      text: "",
    };

    setMarkers((previous) => [
      ...previous,
      marker,
    ]);
  }

  // --------------------------------------------------
  // Notes
  // --------------------------------------------------

  function openNote() {
    getCurrentTimestamp();
    setNoteText("");
    setNoteOpen(true);
  }

  function saveNote() {
    if (!noteText.trim()) return;

    const timestamp =
      getCurrentTimestamp();

    const marker = {
      id: crypto.randomUUID(),
      videoId,
      type: "note",
      time: timestamp,
      text: noteText.trim(),
      createdAt:
        new Date().toISOString(),
    };

    setMarkers((previous) => [
      ...previous,
      marker,
    ]);

    setNoteOpen(false);
    setNoteText("");
  }

  // --------------------------------------------------
  // Jump to timestamp
  // --------------------------------------------------

  function jumpToTime(time) {
    try {
      if (
        playerRef.current?.seekTo
      ) {
        playerRef.current.seekTo(
          time,
          true
        );

        playerRef.current.playVideo();

        setCurrentTime(time);
      }
    } catch {
      // Ignore
    }
  }

  function jumpToMarker(marker) {
    jumpToTime(marker.time);
  }

  function deleteMarker(id) {
    setMarkers((previous) =>
      previous.filter(
        (marker) =>
          marker.id !== id
      )
    );
  }

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <Layout>
      <div style={styles.page}>

        <button
          onClick={() => navigate(-1)}
          style={styles.back}
        >
          ← Back
        </button>

        {videoInfo?.title && (
          <div style={styles.videoTitle}>
            {videoInfo.title}
          </div>
        )}

        <div style={styles.playerArea}>

          <div style={styles.playerWrapper}>
            <div
              id="jee-tube-player"
              style={styles.youtubePlayer}
            />
          </div>

          {chapters.length > 0 && (
            <aside style={styles.chapterPanel}>

              <div style={styles.chapterHeader}>
                <strong>Chapters</strong>
                <span>
                  {chapters.length}
                </span>
              </div>

              <div style={styles.chapterList}>
                {chapters.map(
                  (chapter, index) => {
                    const nextChapter =
                      chapters[index + 1];

                    const active =
                      currentTime >=
                        chapter.time &&
                      (!nextChapter ||
                        currentTime <
                          nextChapter.time);

                    return (
                      <button
                        key={`${chapter.time}-${index}`}
                        onClick={() =>
                          jumpToTime(
                            chapter.time
                          )
                        }
                        style={{
                          ...styles.chapter,
                          ...(active
                            ? styles.chapterActive
                            : {}),
                        }}
                      >
                        <span
                          style={
                            styles.chapterTime
                          }
                        >
                          {formatTime(
                            chapter.time
                          )}
                        </span>

                        <span
                          style={
                            styles.chapterTitle
                          }
                        >
                          {chapter.title}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>

            </aside>
          )}

        </div>

        <div style={styles.timeBar}>
          {playerReady
            ? `Current position: ${formatTime(
                currentTime
              )}`
            : "Loading player..."}
        </div>

        {/* STUDY TOOLBAR */}

        <div style={styles.toolbar}>
          {ACTIONS.map((action) => (
            <button
              key={action.type}
              onClick={() =>
                addMarker(action.type)
              }
              style={styles.action}
              title={`Save ${action.label} at current position`}
            >
              <span>{action.icon}</span>
              {action.label}
            </button>
          ))}

          <button
            onClick={openNote}
            style={styles.action}
          >
            <span>📝</span>
            Note
          </button>
        </div>

        {/* NOTE BOX */}

        {noteOpen && (
          <div style={styles.noteBox}>
            <div
              style={styles.noteHeader}
            >
              <strong>
                Note at{" "}
                {formatTime(
                  currentTime
                )}
              </strong>

              <button
                onClick={() =>
                  setNoteOpen(false)
                }
                style={styles.close}
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
              style={styles.textarea}
            />

            <div
              style={
                styles.noteActions
              }
            >
              <button
                onClick={() =>
                  setNoteOpen(false)
                }
                style={styles.cancel}
              >
                Cancel
              </button>

              <button
                onClick={saveNote}
                style={styles.save}
              >
                Save Note
              </button>
            </div>
          </div>
        )}

        {/* STUDY POINTS */}

        <section
          style={styles.markersSection}
        >
          <h2 style={styles.heading}>
            My Study Points
          </h2>

          {markers.length === 0 ? (
            <div style={styles.empty}>
              Pause the lecture and save
              a bookmark, important point,
              doubt, formula or concept.
            </div>
          ) : (
            <div style={styles.markers}>
              {[...markers]
                .sort(
                  (a, b) =>
                    a.time - b.time
                )
                .map((marker) => (
                  <div
                    key={marker.id}
                    style={styles.marker}
                  >
                    <button
                      onClick={() =>
                        jumpToMarker(
                          marker
                        )
                      }
                      style={
                        styles.markerMain
                      }
                    >
                      <span
                        style={
                          styles.markerIcon
                        }
                      >
                        {
                          ICONS[
                            marker.type
                          ]
                        }
                      </span>

                      <span>
                        <strong>
                          {formatTime(
                            marker.time
                          )}
                        </strong>

                        <span
                          style={
                            styles.markerType
                          }
                        >
                          {marker.type}
                        </span>

                        {marker.text && (
                          <span
                            style={
                              styles.markerText
                            }
                          >
                            {marker.text}
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
                      style={
                        styles.delete
                      }
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          )}
        </section>

      </div>
    </Layout>
  );
}

const styles = {
  page: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    paddingBottom: "60px",
  },

  back: {
    background: "transparent",
    border: "none",
    color: "#aaa",
    fontSize: "15px",
    cursor: "pointer",
    marginBottom: "12px",
  },

  videoTitle: {
    color: "#fff",
    fontSize: "20px",
    fontWeight: 700,
    marginBottom: "15px",
  },

  playerArea: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 1fr) 300px",
    gap: "15px",
    alignItems: "start",
  },

  playerWrapper: {
    width: "100%",
    aspectRatio: "16 / 9",
    background: "#000",
    borderRadius: "12px",
    overflow: "hidden",
    position: "relative",
  },

  youtubePlayer: {
    width: "100%",
    height: "100%",
  },

  chapterPanel: {
    background: "#151515",
    border: "1px solid #292929",
    borderRadius: "12px",
    overflow: "hidden",
    maxHeight: "calc(100vh - 160px)",
    minHeight: "200px",
  },

  chapterHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: "1px solid #292929",
    color: "#fff",
    fontSize: "15px",
  },

  chapterList: {
    overflowY: "auto",
    maxHeight: "calc(100vh - 220px)",
  },

  chapter: {
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    textAlign: "left",
    padding: "11px 14px",
    border: "none",
    borderBottom: "1px solid #222",
    background: "transparent",
    color: "#aaa",
    cursor: "pointer",
  },

  chapterActive: {
    background: "#241010",
    color: "#fff",
    borderLeft: "3px solid #e50914",
  },

  chapterTime: {
    minWidth: "48px",
    color: "#e50914",
    fontSize: "12px",
    fontWeight: 700,
  },

  chapterTitle: {
    fontSize: "13px",
    lineHeight: 1.35,
  },

  timeBar: {
    padding: "10px 2px",
    color: "#888",
    fontSize: "13px",
  },

  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "10px",
  },

  action: {
    border: "1px solid #333",
    background: "#181818",
    color: "#eee",
    borderRadius: "9px",
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
  },

  noteBox: {
    marginTop: "18px",
    background: "#181818",
    border: "1px solid #333",
    borderRadius: "12px",
    padding: "16px",
  },

  noteHeader: {
    display: "flex",
    justifyContent: "space-between",
    color: "#eee",
    marginBottom: "12px",
  },

  close: {
    background: "transparent",
    border: "none",
    color: "#aaa",
    fontSize: "22px",
    cursor: "pointer",
  },

  textarea: {
    width: "100%",
    minHeight: "100px",
    boxSizing: "border-box",
    resize: "vertical",
    background: "#101010",
    border: "1px solid #333",
    borderRadius: "8px",
    color: "#fff",
    padding: "12px",
    outline: "none",
  },

  noteActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "10px",
  },

  cancel: {
    background: "#292929",
    border: "none",
    color: "#ddd",
    padding: "9px 14px",
    borderRadius: "7px",
    cursor: "pointer",
  },

  save: {
    background: "#e50914",
    border: "none",
    color: "#fff",
    padding: "9px 14px",
    borderRadius: "7px",
    cursor: "pointer",
  },

  markersSection: {
    marginTop: "30px",
  },

  heading: {
    color: "#fff",
    fontSize: "21px",
  },

  empty: {
    color: "#777",
    background: "#151515",
    padding: "18px",
    borderRadius: "10px",
  },

  markers: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  marker: {
    display: "flex",
    alignItems: "center",
    background: "#171717",
    borderRadius: "9px",
    overflow: "hidden",
  },

  markerMain: {
    flex: 1,
    border: "none",
    background: "transparent",
    color: "#eee",
    textAlign: "left",
    padding: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  markerIcon: {
    fontSize: "20px",
  },

  markerType: {
    marginLeft: "10px",
    color: "#888",
    fontSize: "12px",
  },

  markerText: {
    display: "block",
    color: "#aaa",
    marginTop: "4px",
    fontSize: "13px",
  },

  delete: {
    background: "transparent",
    border: "none",
    color: "#666",
    fontSize: "20px",
    padding: "12px",
    cursor: "pointer",
  },
};