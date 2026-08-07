export default function VideoCard({ video }) {
  const id = video.id.videoId;
  const s = video.snippet;

  return (
    <div
      style={{
        background: "#181818",
        borderRadius: "14px",
        overflow: "hidden",
      }}
    >
      <img
        src={s.thumbnails.high.url}
        alt={s.title}
        style={{
          width: "100%",
        }}
      />

      <div style={{ padding: "15px" }}>
        <h3>{s.title}</h3>

        <p>{s.channelTitle}</p>

        <a
          href={`https://youtube.com/watch?v=${id}`}
          target="_blank"
          rel="noreferrer"
        >
          Watch
        </a>
      </div>
    </div>
  );
}