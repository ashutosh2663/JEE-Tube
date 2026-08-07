export default function VideoCard({ video }) {
  const { snippet, id } = video;

  return (
    <div
      style={{
        background: "#181818",
        borderRadius: "12px",
        overflow: "hidden",
        color: "white",
      }}
    >
      <img
        src={snippet.thumbnails.high.url}
        alt={snippet.title}
        style={{
          width: "100%",
          display: "block",
        }}
      />

      <div style={{ padding: "15px" }}>
        <h3>{snippet.title}</h3>

        <p>{snippet.channelTitle}</p>

        <a
          href={`https://www.youtube.com/watch?v=${id.videoId}`}
          target="_blank"
          rel="noreferrer"
        >
          ▶ Watch
        </a>
      </div>
    </div>
  );
}