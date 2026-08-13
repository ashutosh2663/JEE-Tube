import { useNavigate } from "react-router-dom";
import { Play, BookOpen } from "lucide-react";
import "../../styles/card.css";

export default function VideoCard({ video }) {
  const navigate = useNavigate();

  const videoId =
    video?.youtube_id ||
    video?.id?.videoId ||
    video?.videoId ||
    video?.id;

  const title =
    video?.title ||
    video?.snippet?.title ||
    "Untitled video";

  const thumbnail =
    video?.thumbnail ||
    video?.snippet?.thumbnails?.high?.url ||
    video?.snippet?.thumbnails?.medium?.url ||
    video?.snippet?.thumbnails?.default?.url ||
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  const channel =
    video?.channel_name ||
    video?.channelName ||
    video?.snippet?.channelTitle ||
    video?.teacher ||
    "JEE Tube";

  const chapter =
    video?.chapter ||
    video?.topic ||
    video?.subject ||
    "JEE Preparation";

  const duration = video?.duration;

  if (!videoId) return null;

  const openVideo = () => {
    navigate(`/player/${videoId}`);
  };

  return (
    <article className="video-card" onClick={openVideo}>
      <div className="video-thumbnail">
        <img
          src={thumbnail}
          alt={title}
          loading="lazy"
        />

        <div className="thumbnail-gradient" />

        <div className="play-overlay">
          <div className="play-button">
            <Play size={22} fill="currentColor" />
          </div>
        </div>

        <span className="subject-badge">
          <BookOpen size={12} />
          JEE
        </span>

        {duration && (
          <span className="duration">
            {duration}
          </span>
        )}
      </div>

      <div className="video-info">
        <h3>{title}</h3>

        <p className="video-channel">
          {channel}
        </p>

        <p className="video-meta">
          {chapter}
        </p>
      </div>
    </article>
  );
}