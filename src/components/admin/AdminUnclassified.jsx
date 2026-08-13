import React from "react";
import AdminHeader from "../../components/admin/AdminHeader";
import VideoTable from "../../components/admin/VideoTable";

const videos = [
  {
    id: "demo-3",
    youtube_id: "demo-3",
    title: "Mole Concept — Full Lecture",
    thumbnail:
      "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    subject: "Chemistry",
    chapter: "",
    topic: "",
    teacher: "",
  },
];

const AdminUnclassified = () => {
  return (
    <>
      <AdminHeader
        title="Unclassified Videos"
        subtitle="These videos need manual organization."
      />

      <div className="admin-content">
        <div className="review-banner">
          <div>
            <span>NEEDS YOUR ATTENTION</span>
            <h2>Keep the library organized.</h2>
            <p>
              Review each video and assign the correct
              subject, chapter and topic.
            </p>
          </div>
        </div>

        <VideoTable videos={videos} />
      </div>
    </>
  );
};

export default AdminUnclassified;