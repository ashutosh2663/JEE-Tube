import React from "react";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SubjectRow({
  title,
  videos = [],
  viewAllPath,
}) {
  const navigate = useNavigate();

  if (!videos.length) return null;

  return (
    <section className="subject-section">
      <div className="subject-heading">
        <div>
          <h2>{title}</h2>
          <p>Continue your preparation</p>
        </div>

        <button
          className="view-all"
          onClick={() => viewAllPath && navigate(viewAllPath)}
        >
          View all →
        </button>
      </div>

      <div className="video-row">
        {videos.map((video, index) => (
          <article
            className="video-card"
            key={video.id || index}
            onClick={() =>
              video.id && navigate(`/player/${video.id}`)
            }
          >
            <div className="thumbnail">
              <img
                src={video.thumbnail}
                alt={video.title}
                loading="lazy"
              />

              <div className="play-overlay">
                <Play size={22} fill="currentColor" />
              </div>

              {video.duration && (
                <span className="duration">
                  {video.duration}
                </span>
              )}
            </div>

            <div className="video-info">
              <h3>{video.title}</h3>

              <p>
                {video.teacher || "JEE Tube"}
                {" • "}
                {video.chapter || "JEE Preparation"}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}