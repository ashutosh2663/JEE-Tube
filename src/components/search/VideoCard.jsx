import { useNavigate } from "react-router-dom";

export default function VideoCard({ video }) {
  const navigate = useNavigate();

  const videoId = video?.id?.videoId;
  const snippet = video?.snippet;

  if (!videoId || !snippet) return null;

  function openVideo() {
    navigate(`/player/${videoId}`);
  }

  return (
    <article
      className="jt-row-card"
      onClick={openVideo}
      style={{
        background: "#171717",
        borderRadius: "12px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s ease, background 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.04)";
        e.currentTarget.style.background = "#202020";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.background = "#171717";
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 9",
          background: "#222",
        }}
      >
        <img
          src={
            snippet.thumbnails?.medium?.url ||
            snippet.thumbnails?.default?.url
          }
          alt={snippet.title}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.25)",
            opacity: 0,
            transition: "opacity 0.2s",
          }}
          className="jt-play-overlay"
        >
          <span style={{ fontSize: "42px" }}>▶</span>
        </div>
      </div>

      <div style={{ padding: "12px" }}>
        <h3
          style={{
            margin: "0 0 7px",
            fontSize: "15px",
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {snippet.title}
        </h3>

        <p
          style={{
            margin: 0,
            color: "#aaa",
            fontSize: "13px",
          }}
        >
          {snippet.channelTitle}
        </p>
      </div>
    </article>
  );
}