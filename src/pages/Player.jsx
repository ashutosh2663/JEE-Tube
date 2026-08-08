
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import "../styles/player.css";

const STORAGE_KEY = "jee-tube-player-notes";

const MARKER_TYPES = {
  bookmark: {
    label: "Bookmark",
    icon: "🔖",
  },
  note: {
    label: "Note",
    icon: "📝",
  },
  doubt: {
    label: "Doubt",
    icon: "❓",
  },
  pyq: {
    label: "PYQ",
    icon: "🎯",
  },
};

function formatTime(seconds) {
  const value = Math.max(0, Number(seconds) || 0);

  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  const secs = Math.floor(value % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function loadSavedMarkers(videoId) {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );

    return saved[videoId] || [];
  } catch {
    return [];
  }
}

function saveMarkers(videoId, markers) {
  try {
    const saved = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );

    saved[videoId] = markers;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(saved)
    );
  } catch (error) {
    console.error("Could not save player markers:", error);
  }
}

export default function Player() {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [markers, setMarkers] = useState([]);
  const [activeType, setActiveType] = useState("bookmark");
  const [noteText, setNoteText] = useState("");
  const [showNotes, setShowNotes] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  /*
   * In the current version we use the video's current timestamp
   * as supplied by the player API in the future.
   *
   * Until the IFrame Player API is connected, this starts at 0.
   */
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!videoId) return;

    setMarkers(loadSavedMarkers(videoId));
    setCurrentTime(0);
  }, [videoId]);

  useEffect(() => {
    if (!videoId) return;

    saveMarkers(videoId, markers);
  }, [markers, videoId]);

  const sortedMarkers = useMemo(
    () =>
      [...markers].sort(
        (a, b) => Number(a.time) - Number(b.time)
      ),
    [markers]
  );

  function addMarker(type = activeType) {
    const marker = {
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,
      type,
      time: currentTime,
      note: noteText.trim(),
      createdAt: Date.now(),
    };

    setMarkers((previous) => [...previous, marker]);

    setNoteText("");
  }

  function deleteMarker(markerId) {
    setMarkers((previous) =>
      previous.filter((marker) => marker.id !== markerId)
    );
  }

  function jumpToMarker(time) {
    /*
     * This becomes connected to the YouTube IFrame Player API
     * when the advanced player controller is added.
     */
    setCurrentTime(time);
  }

  if (!videoId) {
    return (
      <Layout>
        <div className="player-error">
          <div className="player-error-icon">🎬</div>
          <h1>Video not found</h1>
          <p>
            Select a lecture from JEE-Tube to start learning.
          </p>

          <button
            className="player-primary-button"
            onClick={() => navigate("/")}
          >
            Go to Home
          </button>
        </div>
      </Layout>
    );
  }

  const embedUrl =
    `https://www.youtube-nocookie.com/embed/${videoId}` +
    `?rel=0&modestbranding=1`;

  return (
    <Layout>
      <main className="player-page">
        {/* Top navigation */}
        <div className="player-topbar">
          <button
            className="player-back-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            ←
          </button>

          <div className="player-brand">
            <span className="player-brand-mark">J</span>

            <div>
              <strong>JEE-Tube</strong>
              <span>Learning Player</span>
            </div>
          </div>

          <div className="player-top-actions">
            <button
              className="icon-action"
              onClick={() => setShowNotes((value) => !value)}
              title="Toggle notes"
            >
              📝
            </button>
          </div>
        </div>

        <div
          className={`player-layout ${
            showNotes ? "with-notes" : "full-width"
          }`}
        >
          {/* Main player column */}
          <section className="player-main">
            <div className="cinema-player">
              <div className="video-frame">
                <iframe
                  src={embedUrl}
                  title="JEE-Tube Lecture Player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              <div className="player-overlay-brand">
                JEE-TUBE
              </div>
            </div>

            {/* Custom study timeline */}
            <div className="study-timeline">
              <div className="timeline-track">
                <div
                  className="timeline-progress"
                  style={{ width: "0%" }}
                />

                {sortedMarkers.map((marker) => (
                  <button
                    key={marker.id}
                    className={`timeline-marker marker-${marker.type}`}
                    style={{
                      left: `${Math.min(
                        100,
                        Math.max(0, marker.time / 3600 * 100)
                      )}%`,
                    }}
                    title={`${MARKER_TYPES[marker.type]?.label || "Marker"} — ${formatTime(
                      marker.time
                    )}`}
                    onClick={() => jumpToMarker(marker.time)}
                  >
                    {MARKER_TYPES[marker.type]?.icon || "•"}
                  </button>
                ))}
              </div>

              <div className="timeline-meta">
                <span>{formatTime(currentTime)}</span>
                <span>Lecture timeline</span>
              </div>
            </div>

            {/* Study controls */}
            <div className="study-toolbar">
              <div className="toolbar-group">
                <button
                  className={
                    activeType === "bookmark"
                      ? "study-button active"
                      : "study-button"
                  }
                  onClick={() => {
                    setActiveType("bookmark");
                    addMarker("bookmark");
                  }}
                >
                  🔖
                  <span>Bookmark</span>
                </button>

                <button
                  className={
                    activeType === "note"
                      ? "study-button active"
                      : "study-button"
                  }
                  onClick={() => {
                    setActiveType("note");
                    addMarker("note");
                  }}
                >
                  📝
                  <span>Note</span>
                </button>

                <button
                  className={
                    activeType === "doubt"
                      ? "study-button active"
                      : "study-button"
                  }
                  onClick={() => {
                    setActiveType("doubt");
                    addMarker("doubt");
                  }}
                >
                  ❓
                  <span>Doubt</span>
                </button>

                <button
                  className={
                    activeType === "pyq"
                      ? "study-button active"
                      : "study-button"
                  }
                  onClick={() => {
                    setActiveType("pyq");
                    addMarker("pyq");
                  }}
                >
                  🎯
                  <span>PYQ</span>
                </button>
              </div>

              <button
                className="save-note-button"
                onClick={() => addMarker("note")}
              >
                + Save timestamp
              </button>
            </div>

            {/* Lecture information */}
            <article className="lecture-info">
              <div className="lecture-heading">
                <div>
                  <div className="lecture-category">
                    PHYSICS • JEE PREPARATION
                  </div>

                  <h1>
                    JEE-Tube Lecture
                  </h1>

                  <p>
                    Continue your preparation with your
                    personal lecture timeline.
                  </p>
                </div>

                <div className="lecture-status">
                  <span className="status-dot" />
                  {isPlaying ? "Playing" : "Ready"}
                </div>
              </div>

              <div className="lecture-stats">
                <div>
                  <span>Subject</span>
                  <strong>Physics</strong>
                </div>

                <div>
                  <span>Markers</span>
                  <strong>{markers.length}</strong>
                </div>

                <div>
                  <span>Saved locally</span>
                  <strong>✓</strong>
                </div>
              </div>
            </article>
          </section>

          {/* Notes / timeline panel */}
          {showNotes && (
            <aside className="notes-panel">
              <div className="notes-header">
                <div>
                  <span className="notes-eyebrow">
                    STUDY TOOLS
                  </span>

                  <h2>Lecture Notes</h2>
                </div>

                <span className="notes-count">
                  {markers.length}
                </span>
              </div>

              {/* Add note */}
              <div className="note-composer">
                <div className="composer-time">
                  {formatTime(currentTime)}
                </div>

                <textarea
                  value={noteText}
                  onChange={(event) =>
                    setNoteText(event.target.value)
                  }
                  placeholder="Write something about this moment..."
                  rows={4}
                />

                <div className="composer-footer">
                  <select
                    value={activeType}
                    onChange={(event) =>
                      setActiveType(event.target.value)
                    }
                  >
                    {Object.entries(MARKER_TYPES).map(
                      ([key, value]) => (
                        <option key={key} value={key}>
                          {value.icon} {value.label}
                        </option>
                      )
                    )}
                  </select>

                  <button
                    onClick={() => addMarker(activeType)}
                    disabled={!noteText.trim()}
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Marker list */}
              <div className="marker-list">
                {sortedMarkers.length === 0 ? (
                  <div className="empty-notes">
                    <div>📝</div>

                    <strong>
                      Your lecture timeline is empty
                    </strong>

                    <p>
                      Add bookmarks, doubts, PYQs or notes
                      while studying.
                    </p>
                  </div>
                ) : (
                  sortedMarkers.map((marker) => {
                    const type =
                      MARKER_TYPES[marker.type] ||
                      MARKER_TYPES.bookmark;

                    return (
                      <article
                        className={`marker-card marker-card-${marker.type}`}
                        key={marker.id}
                      >
                        <button
                          className="marker-time"
                          onClick={() =>
                            jumpToMarker(marker.time)
                          }
                        >
                          {type.icon}{" "}
                          {formatTime(marker.time)}
                        </button>

                        <div className="marker-content">
                          <div className="marker-label">
                            {type.label}
                          </div>

                          {marker.note && (
                            <p>{marker.note}</p>
                          )}
                        </div>

                        <button
                          className="delete-marker"
                          onClick={() =>
                            deleteMarker(marker.id)
                          }
                          aria-label="Delete marker"
                        >
                          ×
                        </button>
                      </article>
                    );
                  })
                )}
              </div>
            </aside>
          )}
        </div>

        {/* Related section */}
        <section className="player-related">
          <div className="related-heading">
            <div>
              <span>KEEP LEARNING</span>
              <h2>More from JEE-Tube</h2>
            </div>

            <button onClick={() => navigate("/physics")}>
              Explore Physics →
            </button>
          </div>

          <div className="related-placeholder">
            <div>▶</div>

            <div>
              <strong>Related lectures</strong>
              <p>
                Your recommended lectures will appear here.
              </p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
