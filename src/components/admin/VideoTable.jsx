import React from "react";
import {
  CheckCircle2,
  CircleAlert,
  Edit3,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const VideoTable = ({ videos = [] }) => {
  const navigate = useNavigate();

  if (!videos.length) {
    return (
      <div className="admin-empty">
        <VideoEmptyIcon />
        <h3>No videos found</h3>
        <p>Try changing your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>VIDEO</th>
            <th>SUBJECT</th>
            <th>CHAPTER</th>
            <th>TEACHER</th>
            <th>STATUS</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {videos.map((video) => {
            const classified =
              video.subject &&
              video.chapter &&
              video.topic;

            return (
              <tr key={video.id}>
                <td>
                  <div className="admin-video-cell">
                    <img
                      src={
                        video.thumbnail ||
                        `https://i.ytimg.com/vi/${video.youtube_id}/mqdefault.jpg`
                      }
                      alt=""
                    />

                    <div>
                      <strong>
                        {video.title || "Untitled video"}
                      </strong>

                      <span>
                        {video.youtube_id || "No YouTube ID"}
                      </span>
                    </div>
                  </div>
                </td>

                <td>
                  <span className="admin-subject-pill">
                    {video.subject || "—"}
                  </span>
                </td>

                <td>
                  {video.chapter || "Not classified"}
                </td>

                <td>
                  {video.teacher || "—"}
                </td>

                <td>
                  {classified ? (
                    <span className="status classified">
                      <CheckCircle2 size={14} />
                      Classified
                    </span>
                  ) : (
                    <span className="status unclassified">
                      <CircleAlert size={14} />
                      Needs review
                    </span>
                  )}
                </td>

                <td>
                  <div className="admin-row-actions">
                    <button
                      className="table-action"
                      title="Classify"
                      onClick={() =>
                        navigate(
                          `/admin/videos/${video.id}/classify`
                        )
                      }
                    >
                      <Edit3 size={16} />
                    </button>

                    {video.youtube_id && (
                      <a
                        className="table-action"
                        href={`https://www.youtube.com/watch?v=${video.youtube_id}`}
                        target="_blank"
                        rel="noreferrer"
                        title="Open YouTube"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

function VideoEmptyIcon() {
  return (
    <div className="empty-video-icon">
      <CircleAlert size={28} />
    </div>
  );
}

export default VideoTable;