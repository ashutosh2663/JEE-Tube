import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";

const STORAGE_KEY = "jee-tube-study-markers";

const ACTIONS = [
  { type: "bookmark", icon: "🔖", label: "Bookmark" },
  { type: "important", icon: "⭐", label: "Important" },
  { type: "doubt", icon: "❓", label: "Doubt" },
  { type: "formula", icon: "🧮", label: "Formula" },
  { type: "concept", icon: "🧠", label: "Concept" },
];

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

export default function Player() {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [markers, setMarkers] = useState([]);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  // Load saved markers for this video
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      setMarkers(
        saved.filter((marker) => marker.videoId === videoId)
      );
    } catch {
      setMarkers([]);
    }
  }, [videoId]);

  // Save markers
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
        JSON.stringify([...otherVideos, ...markers])
      );
    } catch {
      // Ignore localStorage errors
    }
  }, [markers, videoId]);

  // YouTube IFrame API
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

      // Destroy old player if one exists
      try {
        playerRef.current?.destroy();
      } catch {
        // Ignore
      }

      playerRef.current = new window.YT.Player(
        "jee-tube-player",
        {
          width: "100%",
          height: "100%",

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
              startTimeTracking();
            },

            onStateChange: () => {
              try {
                setCurrentTime(
                  playerRef.current?.getCurrentTime?.() || 0
                );
              } catch {
                // Ignore
              }
            },
          },
        }
      );
    }

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;

      if (
        !document.getElementById(
          "youtube-iframe-api"
        )
      ) {
        const script = document.createElement("script");

        script.id = "youtube-iframe-api";
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
    };
  }, [videoId]);

  function getCurrentTimestamp() {
    try {
      if (playerRef.current?.getCurrentTime) {
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

  function addMarker(type) {
    const timestamp = getCurrentTimestamp();

    const marker = {
      id: crypto.randomUUID(),
      videoId,
      type,
      time: timestamp,
      createdAt: new Date().toISOString(),
      text: "",
    };

    setMarkers((previous) => [
      ...previous,
      marker,
    ]);
  }

  function openNote() {
    getCurrentTimestamp();
    setNoteText("");
    setNoteOpen(true);
  }

  function saveNote() {
    if (!noteText.trim()) return;

    const timestamp = getCurrentTimestamp();

    const marker = {
      id: crypto.randomUUID(),
      videoId,
      type: "note",
      time: timestamp,
      text: noteText.trim(),
      createdAt: new Date().toISOString(),
    };

    setMarkers((previous) => [
      ...previous,
      marker,
    ]);

    setNoteOpen(false);
    setNoteText("");
  }

  function jumpToMarker(marker) {
    try {
      playerRef.current?.seekTo(
        marker.time,
        true
      );

      playerRef.current?.playVideo();
    } catch {
      // Ignore
    }
  }

  function deleteMarker(id) {
    setMarkers((previous) =>
      previous.filter(
        (marker) => marker.id !== id
      )
    );
  }

  const iconFor = {
    bookmark: "🔖",
    important: "⭐",
    doubt: "❓",
    formula: "🧮",
    concept: "🧠",
    note: "📝",
  };

  return (
    <Layout>
      <div style={styles.page}>

        <button
          onClick={() => navigate(-1)}
          style={styles.back}
        >
          ← Back
        </button>

        {/* VIDEO PLAYER */}
        <div style={styles.playerWrapper}>
          <div
            id="jee-tube-player"
            style={styles.youtubePlayer}
          />
        </div>

        <div style={styles.timeBar}>
          Current position:{" "}
          <strong>
            {formatTime(currentTime)}
          </strong>
        </div>

        {/* STUDY ACTIONS */}
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
            <div style={styles.noteHeader}>
              <strong>
                Note at{" "}
                {formatTime(currentTime)}
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
                setNoteText(e.target.value)
              }
              placeholder="Write your note..."
              style={styles.textarea}
            />

            <div style={styles.noteActions}>
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
        <section style={styles.markersSection}>
          <h2 style={styles.heading}>
            My Study Points
          </h2>

          {markers.length === 0 ? (
            <div style={styles.empty}>
              Pause the lecture and save a
              bookmark, important point, doubt,
              formula or concept.
            </div>
          ) : (
            <div style={styles.markers}>
              {[...markers]
                .sort(
                  (a, b) => a.time - b.time
                )
                .map((marker) => (
                  <div
                    key={marker.id}
                    style={styles.marker}
                  >
                    <button
                      onClick={() =>
                        jumpToMarker(marker)
                      }
                      style={styles.markerMain}
                    >
                      <span
                        style={
                          styles.markerIcon
                        }
                      >
                        {iconFor[marker.type]}
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
                      style={styles.delete}
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
    maxWidth: "1250px",
    margin: "0 auto",
    paddingBottom: "50px",
  },

  back: {
    background: "transparent",
    border: "none",
    color: "#aaa",
    fontSize: "15px",
    cursor: "pointer",
    marginBottom: "15px",
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