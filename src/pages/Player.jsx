
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";

const PLAYER_HEIGHT = "min(62vw, 680px)";

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "00:00";

  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const secs = total % 60;

  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
    2,
    "0"
  )}`;
}

export default function Player() {
  const { videoId } = useParams();

  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  const [playerReady, setPlayerReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [markers, setMarkers] = useState([]);
  const [noteText, setNoteText] = useState("");
  const [markerType, setMarkerType] = useState("note");

  const storageKey = `jee-tube-markers-${videoId}`;

  /* Load saved markers */
  useEffect(() => {
    if (!videoId) return;

    try {
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        setMarkers(JSON.parse(saved));
      } else {
        setMarkers([]);
      }
    } catch {
      setMarkers([]);
    }
  }, [videoId, storageKey]);

  /* Save markers */
  useEffect(() => {
    if (!videoId) return;

    localStorage.setItem(storageKey, JSON.stringify(markers));
  }, [markers, videoId, storageKey]);

  /* Load YouTube IFrame API */
  useEffect(() => {
    let cancelled = false;

    function createPlayer() {
      if (
        cancelled ||
        !window.YT ||
        !window.YT.Player ||
        playerRef.current
      ) {
        return;
      }

      playerRef.current = new window.YT.Player("jee-tube-youtube-player", {
        videoId,

        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
        },

        events: {
          onReady: (event) => {
            if (cancelled) return;

            setPlayerReady(true);
            setDuration(event.target.getDuration());

            intervalRef.current = setInterval(() => {
              if (event.target && event.target.getCurrentTime) {
                setCurrentTime(event.target.getCurrentTime());
              }
            }, 500);
          },

          onStateChange: (event) => {
            if (event.target && event.target.getDuration) {
              setDuration(event.target.getDuration());
            }
          },
        },
      });
    }

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      const previousCallback = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        createPlayer();
      };

      if (!document.getElementById("youtube-iframe-api")) {
        const script = document.createElement("script");

        script.id = "youtube-iframe-api";
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;

        document.body.appendChild(script);
      }
    }

    return () => {
      cancelled = true;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (
        playerRef.current &&
        typeof playerRef.current.destroy === "function"
      ) {
        playerRef.current.destroy();
      }

      playerRef.current = null;
      setPlayerReady(false);
    };
  }, [videoId]);

  function getCurrentVideoTime() {
    if (
      playerRef.current &&
      typeof playerRef.current.getCurrentTime === "function"
    ) {
      return playerRef.current.getCurrentTime();
    }

    return currentTime;
  }

  function jumpTo(time) {
    if (
      playerRef.current &&
      typeof playerRef.current.seekTo === "function"
    ) {
      playerRef.current.seekTo(time, true);
      playerRef.current.playVideo();
    }
  }

  function addMarker() {
    const text = noteText.trim();

    if (!text) return;

    const time = getCurrentVideoTime();

    const newMarker = {
      id: Date.now(),
      time,
      type: markerType,
      text,
    };

    setMarkers((previous) =>
      [...previous, newMarker].sort((a, b) => a.time - b.time)
    );

    setNoteText("");
  }

  function addQuickMarker(type) {
    const time = getCurrentVideoTime();

    const labels = {
      important: "Important point",
      doubt: "Doubt",
      pyq: "PYQ / Question",
    };

    const newMarker = {
      id: Date.now(),
      time,
      type,
      text: labels[type],
    };

    setMarkers((previous) =>
      [...previous, newMarker].sort((a, b) => a.time - b.time)
    );
  }

  function deleteMarker(id) {
    setMarkers((previous) =>
      previous.filter((marker) => marker.id !== id)
    );
  }

  if (!videoId) {
    return (
      <Layout>
        <div style={styles.error}>
          <h2>Video not found</h2>
          <p>No YouTube video ID was provided.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.page}>
        {/* Video */}
        <section style={styles.playerSection}>
          <div style={styles.videoWrapper}>
            <div
              id="jee-tube-youtube-player"
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </div>

          <div style={styles.playerInfo}>
            <div>
              <h1 style={styles.title}>JEE Tube Study Player</h1>

              <p style={styles.subtitle}>
                {playerReady
                  ? `${formatTime(currentTime)} / ${formatTime(duration)}`
                  : "Loading video..."}
              </p>
            </div>

            <div style={styles.badge}>JEE TUBE</div>
          </div>
        </section>

        {/* Study tools */}
        <section style={styles.tools}>
          <div style={styles.toolsHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Study Tools</h2>

              <p style={styles.sectionSubtitle}>
                Add notes and markers while watching.
              </p>
            </div>

            <div style={styles.currentTime}>
              {formatTime(currentTime)}
            </div>
          </div>

          {/* Quick markers */}
          <div style={styles.quickButtons}>
            <button
              style={styles.quickButton}
              onClick={() => addQuickMarker("important")}
            >
              ⭐ Important
            </button>

            <button
              style={styles.quickButton}
              onClick={() => addQuickMarker("doubt")}
            >
              ❓ Doubt
            </button>

            <button
              style={styles.quickButton}
              onClick={() => addQuickMarker("pyq")}
            >
              🎯 PYQ
            </button>
          </div>

          {/* Note composer */}
          <div style={styles.composer}>
            <select
              value={markerType}
              onChange={(event) => setMarkerType(event.target.value)}
              style={styles.select}
            >
              <option value="note">📝 Note</option>
              <option value="important">⭐ Important</option>
              <option value="doubt">❓ Doubt</option>
              <option value="pyq">🎯 PYQ</option>
            </select>

            <input
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  addMarker();
                }
              }}
              placeholder="Write a note at the current timestamp..."
              style={styles.input}
            />

            <button
              onClick={addMarker}
              style={styles.addButton}
              disabled={!noteText.trim()}
            >
              Add at {formatTime(currentTime)}
            </button>
          </div>
        </section>

        {/* Timeline */}
        <section style={styles.timelineSection}>
          <div style={styles.timelineHeader}>
            <div>
              <h2 style={styles.sectionTitle}>My Timeline</h2>

              <p style={styles.sectionSubtitle}>
                {markers.length} saved{" "}
                {markers.length === 1 ? "marker" : "markers"}
              </p>
            </div>
          </div>

          {markers.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>📌</div>

              <h3>No markers yet</h3>

              <p>
                Add an important point, doubt, PYQ, or note while watching.
              </p>
            </div>
          ) : (
            <div style={styles.markerList}>
              {markers.map((marker) => (
                <div
                  key={marker.id}
                  style={{
                    ...styles.marker,
                    borderLeft: `4px solid ${getMarkerColor(marker.type)}`,
                  }}
                >
                  <button
                    onClick={() => jumpTo(marker.time)}
                    style={styles.timeButton}
                  >
                    {formatTime(marker.time)}
                  </button>

                  <div style={styles.markerContent}>
                    <div style={styles.markerType}>
                      {getMarkerIcon(marker.type)}{" "}
                      {getMarkerName(marker.type)}
                    </div>

                    <div style={styles.markerText}>
                      {marker.text}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteMarker(marker.id)}
                    style={styles.deleteButton}
                    title="Delete marker"
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

function getMarkerIcon(type) {
  const icons = {
    note: "📝",
    important: "⭐",
    doubt: "❓",
    pyq: "🎯",
  };

  return icons[type] || "📝";
}

function getMarkerName(type) {
  const names = {
    note: "Note",
    important: "Important",
    doubt: "Doubt",
    pyq: "PYQ",
  };

  return names[type] || "Note";
}

function getMarkerColor(type) {
  const colors = {
    note: "#4f8cff",
    important: "#ffc107",
    doubt: "#ff5c5c",
    pyq: "#9b6cff",
  };

  return colors[type] || "#4f8cff";
}

const styles = {
  page: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    paddingBottom: "60px",
  },

  playerSection: {
    width: "100%",
  },

  videoWrapper: {
    width: "100%",
    height: PLAYER_HEIGHT,
    minHeight: "240px",
    maxHeight: "680px",
    background: "#000",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
  },

  playerInfo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    padding: "18px 4px 10px",
  },

  title: {
    margin: 0,
    fontSize: "24px",
    fontWeight: 700,
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#999",
    fontSize: "14px",
  },

  badge: {
    padding: "7px 12px",
    borderRadius: "8px",
    background: "#e50914",
    color: "#fff",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "1px",
  },

  tools: {
    marginTop: "20px",
    padding: "20px",
    background: "#151515",
    border: "1px solid #292929",
    borderRadius: "16px",
  },

  toolsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "20px",
  },

  sectionSubtitle: {
    margin: "5px 0 0",
    color: "#888",
    fontSize: "13px",
  },

  currentTime: {
    padding: "8px 12px",
    borderRadius: "8px",
    background: "#222",
    color: "#ddd",
    fontFamily: "monospace",
    fontSize: "13px",
  },

  quickButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "18px",
  },

  quickButton: {
    border: "1px solid #333",
    background: "#202020",
    color: "#fff",
    padding: "9px 13px",
    borderRadius: "9px",
    cursor: "pointer",
  },

  composer: {
    display: "flex",
    gap: "10px",
    marginTop: "14px",
  },

  select: {
    background: "#202020",
    color: "#fff",
    border: "1px solid #333",
    borderRadius: "9px",
    padding: "0 10px",
  },

  input: {
    flex: 1,
    minWidth: 0,
    background: "#202020",
    color: "#fff",
    border: "1px solid #333",
    borderRadius: "9px",
    padding: "12px",
    outline: "none",
  },

  addButton: {
    background: "#e50914",
    color: "#fff",
    border: "none",
    borderRadius: "9px",
    padding: "0 16px",
    fontWeight: 700,
    cursor: "pointer",
  },

  timelineSection: {
    marginTop: "25px",
  },

  timelineHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },

  empty: {
    padding: "45px 20px",
    textAlign: "center",
    background: "#151515",
    border: "1px solid #292929",
    borderRadius: "16px",
    color: "#888",
  },

  emptyIcon: {
    fontSize: "35px",
    marginBottom: "10px",
  },

  markerList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  marker: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px",
    background: "#151515",
    borderRadius: "10px",
  },

  timeButton: {
    flexShrink: 0,
    border: "none",
    background: "#252525",
    color: "#fff",
    borderRadius: "7px",
    padding: "7px 10px",
    fontFamily: "monospace",
    cursor: "pointer",
  },

  markerContent: {
    flex: 1,
    minWidth: 0,
  },

  markerType: {
    color: "#aaa",
    fontSize: "12px",
    marginBottom: "4px",
  },

  markerText: {
    color: "#fff",
    fontSize: "14px",
    wordBreak: "break-word",
  },

  deleteButton: {
    flexShrink: 0,
    width: "30px",
    height: "30px",
    border: "none",
    background: "transparent",
    color: "#777",
    fontSize: "22px",
    cursor: "pointer",
  },

  error: {
    padding: "50px",
    textAlign: "center",
  },
};