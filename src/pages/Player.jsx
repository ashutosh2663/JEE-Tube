import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import "../styles/player.css";

const STORAGE_KEY = "jee-tube-study-markers";

const ACTIONS = [
  { type: "bookmark", icon: "🔖", label: "Bookmark" },
  { type: "important", icon: "⭐", label: "Important" },
  { type: "doubt", icon: "❓", label: "Doubt" },
  { type: "formula", icon: "🧮", label: "Formula" },
  { type: "concept", icon: "🧠", label: "Concept" },
];

/*
 * Sequence & Series chapter data.
 * You already extracted these timestamps from YouTube.
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
    { id: "chapter-14", time: 17367, title: "Arithmetic geometric progression" },
    { id: "chapter-15", time: 19184, title: "Properties of Sigma" },
    { id: "chapter-16", time: 19557, title: "Formulas of Sigma" },
    { id: "chapter-17", time: 20232, title: "Miscellaneous sequences" },
    { id: "chapter-18", time: 21498, title: "Shortcut method for Tn" },
    { id: "chapter-19", time: 22085, title: "Telescopic method of difference" },
    { id: "chapter-20", time: 25390, title: "AM-GM-HM Inequality" },
    { id: "chapter-21", time: 26457, title: "Exponential Series" },
    { id: "chapter-22", time: 28412, title: "Logarithmic Series" },
    { id: "chapter-23", time: 29195, title: "Thankyou bachhon" },
  ],
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

export default function Player() {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [markers, setMarkers] = useState([]);

  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");

  const [chaptersOpen, setChaptersOpen] = useState(false);

  const chapters = VIDEO_CHAPTERS[videoId] || [];

  const activeChapter = getActiveChapter(chapters, currentTime);

  // --------------------------------------------------
  // Load saved markers
  // --------------------------------------------------

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
      // Ignore storage errors
    }
  }, [markers, videoId]);

  // --------------------------------------------------
  // YouTube player
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
              startTimeTracking();
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
        const script =
          document.createElement("script");

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

  // --------------------------------------------------
  // Current timestamp
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Add marker
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
  // Jump to marker
  // --------------------------------------------------

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

  // --------------------------------------------------
  // Jump to chapter
  // --------------------------------------------------

  function jumpToChapter(chapter) {
    try {
      playerRef.current?.seekTo(
        chapter.time,
        true
      );

      playerRef.current?.playVideo();

      setCurrentTime(chapter.time);
      setChaptersOpen(false);
    } catch {
      // Ignore
    }
  }

  // --------------------------------------------------
  // Delete marker
  // --------------------------------------------------

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
      <div className="jt-player-page">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="jt-player-back"
        >
          ← Back
        </button>

        {/* Player */}
        <div className="jt-player-wrapper">
          <div id="jee-tube-player" />
        </div>

        {/* Current position */}
        <div className="jt-player-time">
          Current position:{" "}
          <strong>
            {formatTime(currentTime)}
          </strong>
        </div>

        {/* Toolbar */}
        <div className="jt-player-toolbar">

          {/* CHAPTER DROPDOWN */}
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
                            key={chapter.id}
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

          {/* Study actions */}
          {ACTIONS.map((action) => (
            <button
              key={action.type}
              onClick={() =>
                addMarker(action.type)
              }
              className="jt-study-action"
              title={`Save ${action.label} at current position`}
            >
              <span>
                {action.icon}
              </span>

              {action.label}
            </button>
          ))}

          {/* Note */}
          <button
            onClick={openNote}
            className="jt-study-action"
          >
            <span>📝</span>
            Note
          </button>
        </div>

        {/* Note box */}
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
                  setNoteOpen(false)
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
                  setNoteOpen(false)
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

        {/* Study points */}
        <section className="jt-markers-section">

          <h2>
            My Study Points
          </h2>

          {markers.length === 0 ? (
            <div className="jt-markers-empty">
              Pause the lecture and save a
              bookmark, important point,
              doubt, formula or concept.
            </div>
          ) : (
            <div className="jt-markers">

              {[...markers]
                .sort(
                  (a, b) =>
                    a.time - b.time
                )
                .map((marker) => (
                  <div
                    key={marker.id}
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
                          ]
                        }
                      </span>

                      <span>
                        <strong>
                          {formatTime(
                            marker.time
                          )}
                        </strong>

                        <span className="jt-marker-type">
                          {marker.type}
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
                ))}
            </div>
          )}
        </section>

      </div>
    </Layout>
  );
}