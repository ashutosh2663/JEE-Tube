import React, { useMemo, useState } from "react";
import {
  Search,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import AdminHeader from "../../components/admin/AdminHeader";
import VideoTable from "../../components/admin/VideoTable";

const demoVideos = [
  {
    id: "demo-1",
    youtube_id: "dQw4w9WgXcQ",
    title: "Kinematics Introduction",
    thumbnail:
      "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    subject: "Physics",
    chapter: "Kinematics",
    topic: "Introduction",
    teacher: "JEE Tube",
  },
  {
    id: "demo-2",
    youtube_id: "demo-2",
    title: "Quadratic Equations — Complete Concepts",
    thumbnail:
      "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    subject: "Mathematics",
    chapter: "Quadratic Equations",
    topic: "Basics",
    teacher: "JEE Tube",
  },
  {
    id: "demo-3",
    youtube_id: "demo-3",
    title: "Mole Concept",
    thumbnail:
      "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    subject: "Chemistry",
    chapter: "",
    topic: "",
    teacher: "",
  },
];

const AdminVideos = () => {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All");

  const videos = useMemo(() => {
    return demoVideos.filter((video) => {
      const matchesSearch =
        video.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        video.chapter
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesSubject =
        subject === "All" ||
        video.subject === subject;

      return matchesSearch && matchesSubject;
    });
  }, [search, subject]);

  return (
    <>
      <AdminHeader
        title="Video Library"
        subtitle="Search and manage all JEE-Tube videos."
      />

      <div className="admin-content">
        <div className="admin-toolbar">
          <div className="admin-large-search">
            <Search size={19} />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search videos, chapters or topics..."
            />
          </div>

          <div className="admin-filter">
            <Filter size={17} />

            <select
              value={subject}
              onChange={(e) =>
                setSubject(e.target.value)
              }
            >
              <option>All</option>
              <option>Physics</option>
              <option>Chemistry</option>
              <option>Mathematics</option>
            </select>
          </div>

          <button className="admin-filter-button">
            <SlidersHorizontal size={18} />
            Filters
          </button>
        </div>

        <div className="admin-section-header">
          <div>
            <h2>Videos</h2>
            <p>{videos.length} videos shown</p>
          </div>
        </div>

        <VideoTable videos={videos} />
      </div>
    </>
  );
};

export default AdminVideos;