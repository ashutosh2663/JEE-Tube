
import VideoCard from "../search/VideoCard";

export default function SubjectRow({ title, videos = [] }) {
  if (!videos.length) return null;

  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <h2 style={styles.title}>{title}</h2>

        <button style={styles.seeAll}>
          See all →
        </button>
      </div>

      <div className="subject-row">
        {videos.map((video, index) => {
          const videoId =
            video?.id?.videoId ||
            video?.id ||
            video?.videoId;

          if (!videoId) return null;

          return (
            <div className="subject-row-card" key={videoId || index}>
              <VideoCard video={video} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

const styles = {
  section: {
    marginTop: "32px",
    width: "100%",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "14px",
  },

  title: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
    color: "#fff",
  },

  seeAll: {
    background: "transparent",
    border: "none",
    color: "#999",
    cursor: "pointer",
    fontSize: "13px",
  },
};

