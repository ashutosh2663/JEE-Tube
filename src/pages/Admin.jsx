import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Video,
  Link as LinkIcon,
  BrainCircuit,
  Database,
  Settings,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Trash2,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Activity,
  Layers3,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "";

/**
 * Safely parse API responses.
 *
 * Handles:
 * - JSON responses
 * - Empty responses
 * - Plain-text error responses
 *
 * This prevents:
 * "Unexpected end of JSON input"
 */
async function parseApiResponse(response) {
  const text = await response.text();

  if (!text.trim()) {
    return {
      data: {},
      rawText: "",
    };
  }

  try {
    return {
      data: JSON.parse(text),
      rawText: text,
    };
  } catch {
    return {
      data: {
        error: text,
      },
      rawText: text,
    };
  }
}

export default function Admin() {
  const [activeSection, setActiveSection] = useState("overview");

  const [videos, setVideos] = useState([]);
  const [queue, setQueue] = useState([]);

  const [stats, setStats] = useState({
    videos: 0,
    unclassified: 0,
    rejected: 0,
  });

  const [url, setUrl] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(false);
  const [injecting, setInjecting] = useState(false);
  const [message, setMessage] = useState("");

  const menu = [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      id: "injector",
      label: "URL Injector",
      icon: LinkIcon,
    },
    {
      id: "videos",
      label: "Video Database",
      icon: Video,
    },
    {
      id: "classification",
      label: "AI Classification",
      icon: BrainCircuit,
    },
    {
      id: "queue",
      label: "Unclassified Queue",
      icon: Clock3,
      badge: queue.length,
    },
    {
      id: "database",
      label: "Database",
      icon: Database,
    },
    {
      id: "settings",
      label: "Admin Settings",
      icon: Settings,
    },
  ];

  // =========================================================
  // LOAD ADMIN STATS
  // =========================================================

  async function loadStats() {
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/stats`
      );

      const { data } = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load statistics."
        );
      }

      setStats(data);
    } catch (error) {
      console.error("Admin stats error:", error);

      setMessage(
        `Backend error: ${error.message}`
      );
    }
  }

  // =========================================================
  // LOAD VIDEOS
  // =========================================================

  async function loadVideos() {
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/videos?limit=100`
      );

      const { data } = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load videos."
        );
      }

      setVideos(data.videos || []);
    } catch (error) {
      console.error("Admin videos error:", error);

      setMessage(
        `Failed to load videos: ${error.message}`
      );
    }
  }

  // =========================================================
  // LOAD UNCLASSIFIED
  // =========================================================

  async function loadQueue() {
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/unclassified`
      );

      const { data } = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to load unclassified videos."
        );
      }

      setQueue(data.videos || []);
    } catch (error) {
      console.error(
        "Admin queue error:",
        error
      );

      setMessage(
        `Failed to load queue: ${error.message}`
      );
    }
  }

  // =========================================================
  // LOAD EVERYTHING
  // =========================================================

  async function refreshAdmin() {
    setLoading(true);

    try {
      await Promise.all([
        loadStats(),
        loadVideos(),
        loadQueue(),
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAdmin();
  }, []);

  // =========================================================
  // FILTER VIDEOS
  // =========================================================

  const filteredVideos = useMemo(() => {
    const query = search.trim().toLowerCase();

    return videos.filter((video) => {
      const title =
        video.title?.toLowerCase() || "";

      const subject =
        video.subject?.toLowerCase() || "";

      const chapter =
        video.chapter?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        title.includes(query) ||
        subject.includes(query) ||
        chapter.includes(query);

      const matchesFilter =
        filter === "all" ||
        subject === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [videos, search, filter]);

  // =========================================================
  // URL INJECTOR
  // =========================================================

  async function injectUrl() {
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      setMessage(
        "Paste a YouTube URL first."
      );
      return;
    }

    setInjecting(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE}/api/admin/inject-url`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            url: cleanUrl,
          }),
        }
      );

      const { data, rawText } =
        await parseApiResponse(response);

      console.log(
        "Injection response:",
        response.status,
        data,
        rawText
      );

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            rawText ||
            `Video injection failed (HTTP ${response.status}).`
        );
      }

      /*
       * Backend may return:
       *
       * {
       *   action: "inserted"
       * }
       *
       * OR:
       *
       * {
       *   action: "skipped",
       *   reason: "already_exists",
       *   id: 685
       * }
       */

      if (
        data.action === "skipped" &&
        data.reason === "already_exists"
      ) {
        setMessage(
          `Video already exists in JEE-Tube. Database ID: ${
            data.id ?? "unknown"
          }`
        );
      } else {
        setMessage(
          data.message ||
            `Video processed successfully. Action: ${
              data.action || "completed"
            }`
        );
      }

      setUrl("");

      await refreshAdmin();
    } catch (error) {
      console.error(
        "URL injection error:",
        error
      );

      setMessage(
        `Injection failed: ${error.message}`
      );
    } finally {
      setInjecting(false);
    }
  }

  // =========================================================
  // DELETE VIDEO
  // =========================================================

  async function removeVideo(id) {
    const confirmed = window.confirm(
      "Delete this video from JEE-Tube?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/admin/videos/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const { data, rawText } =
        await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            rawText ||
            "Failed to delete video."
        );
      }

      setMessage(
        "Video deleted successfully."
      );

      await refreshAdmin();
    } catch (error) {
      console.error(
        "Delete video error:",
        error
      );

      setMessage(
        `Delete failed: ${error.message}`
      );
    }
  }

  // =========================================================
  // STATS
  // =========================================================

  const totalVideos =
    stats.videos ?? videos.length;

  const pendingVideos =
    stats.unclassified ??
    queue.length;

  const classifiedVideos =
    Math.max(
      totalVideos - pendingVideos,
      0
    );

  const subjects = new Set(
    videos
      .map((video) => video.subject)
      .filter(Boolean)
  ).size;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="admin-page">

      {/* SIDEBAR */}

      <aside className="admin-sidebar">

        <div className="admin-brand">

          <div className="admin-brand-icon">
            <ShieldCheck size={24} />
          </div>

          <div>
            <strong>JEE-TUBE</strong>
            <span>ADMIN CENTER</span>
          </div>

        </div>

        <nav className="admin-nav">

          <p className="admin-nav-label">
            CONTROL CENTER
          </p>

          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`admin-nav-item ${
                  activeSection === item.id
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveSection(item.id)
                }
              >

                <Icon size={19} />

                <span>
                  {item.label}
                </span>

                {item.badge > 0 && (
                  <b className="admin-nav-badge">
                    {item.badge}
                  </b>
                )}

                {activeSection ===
                  item.id && (
                  <ChevronRight
                    size={16}
                    className="admin-nav-arrow"
                  />
                )}

              </button>
            );
          })}

        </nav>

        <div className="admin-sidebar-bottom">

          <Link
            to="/"
            className="admin-back-home"
          >
            ← Back to JEE-Tube
          </Link>

        </div>

      </aside>

      {/* MAIN */}

      <main className="admin-main">

        <header className="admin-topbar">

          <div>

            <p className="admin-kicker">
              PRIVATE ADMINISTRATION
            </p>

            <h1>
              {
                menu.find(
                  (item) =>
                    item.id ===
                    activeSection
                )?.label
              }
            </h1>

          </div>

          <div className="admin-topbar-right">

            <button
              className="admin-refresh"
              onClick={refreshAdmin}
              disabled={loading}
            >
              <RefreshCw
                size={17}
                className={
                  loading ? "spin" : ""
                }
              />

              Refresh
            </button>

            <div className="admin-status">

              <span className="admin-online-dot" />

              System Online

            </div>

          </div>

        </header>

        {message && (
          <div className="admin-global-message">
            <Activity size={18} />
            {message}
          </div>
        )}

        {/* =====================================================
            OVERVIEW
        ===================================================== */}

        {activeSection === "overview" && (
          <section className="admin-content">

            <div className="admin-welcome">

              <div>

                <span className="admin-section-tag">
                  JEE-TUBE CONTROL CENTER
                </span>

                <h2>
                  Your educational database,
                  <br />
                  under your control.
                </h2>

                <p>
                  Inject videos, review AI
                  classifications and manage
                  the complete JEE-Tube
                  content pipeline.
                </p>

              </div>

              <Activity
                className="admin-welcome-icon"
                size={90}
              />

            </div>

            <div className="admin-stat-grid">

              <StatCard
                icon={<Video />}
                label="Total Videos"
                value={totalVideos}
              />

              <StatCard
                icon={<CheckCircle2 />}
                label="Classified"
                value={classifiedVideos}
              />

              <StatCard
                icon={<Clock3 />}
                label="Pending Review"
                value={pendingVideos}
              />

              <StatCard
                icon={<Layers3 />}
                label="Subjects"
                value={subjects}
              />

            </div>

            <div className="admin-grid-two">

              <AdminPanelCard
                icon={<LinkIcon />}
                title="Inject a YouTube Video"
                description="Paste a YouTube URL and send it through the JEE-Tube classification pipeline."
                action="Open Injector"
                onClick={() =>
                  setActiveSection("injector")
                }
              />

              <AdminPanelCard
                icon={<Clock3 />}
                title="Review Unclassified"
                description={`${pendingVideos} video(s) are waiting for classification or manual review.`}
                action="Open Queue"
                onClick={() =>
                  setActiveSection("queue")
                }
              />

            </div>

          </section>
        )}

        {/* =====================================================
            URL INJECTOR
        ===================================================== */}

        {activeSection === "injector" && (
          <section className="admin-content">

            <div className="admin-page-title">

              <LinkIcon size={28} />

              <div>
                <h2>
                  YouTube URL Injector
                </h2>

                <p>
                  Add one YouTube video
                  directly to JEE-Tube.
                </p>
              </div>

            </div>

            <div className="admin-inject-card">

              <div className="admin-inject-icon">
                <LinkIcon size={32} />
              </div>

              <h3>
                Paste YouTube URL
              </h3>

              <p>
                The server extracts the
                video ID, fetches metadata
                and processes the video.
              </p>

              <div className="admin-url-row">

                <input
                  value={url}
                  onChange={(e) =>
                    setUrl(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      injectUrl();
                    }
                  }}
                  placeholder="https://www.youtube.com/watch?v=..."
                />

                <button
                  onClick={injectUrl}
                  disabled={injecting}
                >
                  {injecting ? (
                    <>
                      <RefreshCw
                        size={18}
                        className="spin"
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <LinkIcon size={18} />
                      Inject Video
                    </>
                  )}
                </button>

              </div>

            </div>

            <div className="admin-info-grid">

              <InfoItem
                title="01"
                text="Extract YouTube video ID"
              />

              <InfoItem
                title="02"
                text="Fetch metadata"
              />

              <InfoItem
                title="03"
                text="Gemini classification"
              />

              <InfoItem
                title="04"
                text="Nemotron verification"
              />

              <InfoItem
                title="05"
                text="Insert or queue"
              />

            </div>

          </section>
        )}

        {/* =====================================================
            VIDEO DATABASE
        ===================================================== */}

        {activeSection === "videos" && (
          <section className="admin-content">

            <div className="admin-page-title">

              <Video size={28} />

              <div>
                <h2>
                  Video Database
                </h2>

                <p>
                  Search and manage actual
                  JEE-Tube video records.
                </p>
              </div>

            </div>

            <div className="admin-toolbar">

              <div className="admin-search">

                <Search size={18} />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search videos..."
                />

              </div>

              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value)
                }
              >
                <option value="all">
                  All Subjects
                </option>

                <option value="physics">
                  Physics
                </option>

                <option value="chemistry">
                  Chemistry
                </option>

                <option value="maths">
                  Maths
                </option>
              </select>

            </div>

            <div className="admin-video-table">

              <div className="admin-table-head">
                <span>VIDEO</span>
                <span>SUBJECT</span>
                <span>CHAPTER</span>
                <span>RELEVANCE</span>
                <span>ACTION</span>
              </div>

              {filteredVideos.map(
                (video) => (
                  <div
                    className="admin-table-row"
                    key={video.id}
                  >

                    <div className="admin-video-name">

                      <Video size={17} />

                      <div>
                        <span>
                          {video.title}
                        </span>

                        {video.youtube_id && (
                          <small>
                            {video.youtube_id}
                          </small>
                        )}
                      </div>

                    </div>

                    <span>
                      {video.subject || "—"}
                    </span>

                    <span>
                      {video.chapter || "—"}
                    </span>

                    <span className="admin-relevance">
                      {Math.round(
                        Number(
                          video.ai_relevance ??
                            video.relevance ??
                            0
                        ) * 100
                      )}
                      %
                    </span>

                    <button
                      className="admin-danger-btn"
                      onClick={() =>
                        removeVideo(video.id)
                      }
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>
                )
              )}

              {filteredVideos.length === 0 && (
                <div className="admin-empty">
                  No videos found.
                </div>
              )}

            </div>

          </section>
        )}

        {/* =====================================================
            AI CLASSIFICATION
        ===================================================== */}

        {activeSection === "classification" && (
          <section className="admin-content">

            <div className="admin-page-title">

              <BrainCircuit size={28} />

              <div>
                <h2>
                  AI Classification
                </h2>

                <p>
                  Monitor the JEE-Tube
                  classification pipeline.
                </p>
              </div>

            </div>

            <div className="admin-ai-grid">

              <AiCard
                title="Gemini"
                status="PRIMARY CLASSIFIER"
                description="Initial relevance, subject, chapter and educational classification."
              />

              <AiCard
                title="Nemotron"
                status="VERIFICATION LAYER"
                description="Independently checks Gemini's decision and can correct classification."
              />

              <AiCard
                title="Decision Engine"
                status="ACTIVE"
                description="Determines whether a video becomes active or enters the review pipeline."
              />

            </div>

            <div className="admin-warning">

              <AlertTriangle size={20} />

              <div>

                <strong>
                  Classification safety
                </strong>

                <p>
                  Videos that cannot be
                  classified because of API
                  failures or limits should
                  remain outside the active
                  database and be available
                  in the admin review queue.
                </p>

              </div>

            </div>

          </section>
        )}

        {/* =====================================================
            QUEUE
        ===================================================== */}

        {activeSection === "queue" && (
          <section className="admin-content">

            <div className="admin-page-title">

              <Clock3 size={28} />

              <div>
                <h2>
                  Unclassified Queue
                </h2>

                <p>
                  Videos that require
                  classification or review.
                </p>
              </div>

            </div>

            {queue.length === 0 ? (
              <div className="admin-empty-card">

                <CheckCircle2 size={42} />

                <h3>
                  Queue is empty
                </h3>

                <p>
                  There are currently no
                  unclassified videos.
                </p>

              </div>
            ) : (
              <div className="admin-queue">

                {queue.map((item) => (
                  <div
                    className="admin-queue-item"
                    key={item.id}
                  >

                    <div>

                      <span className="admin-section-tag">
                        UNCLASSIFIED
                      </span>

                      <h3>
                        {item.title ||
                          "Untitled video"}
                      </h3>

                      <p>
                        YouTube ID:{" "}
                        {item.youtube_id || "—"}
                      </p>

                    </div>

                    <div className="admin-queue-actions">

                      {item.youtube_id && (
                        <a
                          href={`https://www.youtube.com/watch?v=${item.youtube_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-secondary-btn"
                        >
                          <ExternalLink size={17} />
                          Open
                        </a>
                      )}

                    </div>

                  </div>
                ))}

              </div>
            )}

          </section>
        )}

        {/* =====================================================
            DATABASE
        ===================================================== */}

        {activeSection === "database" && (
          <section className="admin-content">

            <div className="admin-page-title">

              <Database size={28} />

              <div>
                <h2>
                  Database
                </h2>

                <p>
                  Overview of JEE-Tube
                  persistent storage.
                </p>
              </div>

            </div>

            <div className="admin-database-card">

              <Database size={42} />

              <div>

                <h3>
                  Supabase Database
                </h3>

                <p>
                  Videos, classifications,
                  metadata and admin data
                  are stored in Supabase.
                </p>

              </div>

              <span className="admin-db-status">
                CONNECTED
              </span>

            </div>

            <div className="admin-stat-grid">

              <StatCard
                icon={<Video />}
                label="Video Records"
                value={totalVideos}
              />

              <StatCard
                icon={<BrainCircuit />}
                label="Classified"
                value={classifiedVideos}
              />

              <StatCard
                icon={<Clock3 />}
                label="Pending"
                value={pendingVideos}
              />

            </div>

          </section>
        )}

        {/* =====================================================
            SETTINGS
        ===================================================== */}

        {activeSection === "settings" && (
          <section className="admin-content">

            <div className="admin-page-title">

              <Settings size={28} />

              <div>
                <h2>
                  Admin Settings
                </h2>

                <p>
                  Configuration for your
                  private JEE-Tube control
                  center.
                </p>
              </div>

            </div>

            <div className="admin-settings-list">

              <SettingRow
                title="Private Admin Mode"
                description="This panel is intended only for your administrator account."
                enabled
              />

              <SettingRow
                title="Gemini Classification"
                description="Gemini performs the first-stage classification."
                enabled
              />

              <SettingRow
                title="Nemotron Verification"
                description="Nemotron verifies accepted Gemini classifications."
                enabled
              />

              <SettingRow
                title="Manual Review Queue"
                description="Videos that cannot be classified remain available for review."
                enabled
              />

            </div>

          </section>
        )}

      </main>
    </div>
  );
}

// =========================================================
// COMPONENTS
// =========================================================

function StatCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="admin-stat-card">

      <div className="admin-stat-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

    </div>
  );
}

function AdminPanelCard({
  icon,
  title,
  description,
  action,
  onClick,
}) {
  return (
    <button
      className="admin-feature-card"
      onClick={onClick}
    >

      <div className="admin-feature-icon">
        {icon}
      </div>

      <div>

        <h3>{title}</h3>

        <p>{description}</p>

        <span>
          {action}
          <ChevronRight size={16} />
        </span>

      </div>

    </button>
  );
}

function InfoItem({
  title,
  text,
}) {
  return (
    <div className="admin-info-item">
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function AiCard({
  title,
  status,
  description,
}) {
  return (
    <div className="admin-ai-card">

      <div className="admin-ai-icon">
        <BrainCircuit size={25} />
      </div>

      <h3>{title}</h3>

      <span className="admin-ai-status">
        {status}
      </span>

      <p>{description}</p>

    </div>
  );
}

function SettingRow({
  title,
  description,
  enabled,
}) {
  return (
    <div className="admin-setting-row">

      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      <div
        className={`admin-toggle ${
          enabled ? "enabled" : ""
        }`}
      >
        <div />
      </div>

    </div>
  );
}