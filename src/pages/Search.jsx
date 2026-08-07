import { useState } from "react";

import SearchBar from "../components/search/SearchBar";
import VideoCard from "../components/search/VideoCard";
import { searchYoutube } from "../api/youtube";

export default function Search() {
  const [videos, setVideos] = useState([]);

  async function handleSearch(query) {
    try {
      const result = await searchYoutube(query);
      setVideos(result);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch YouTube videos.");
    }
  }

  return (
    <>
      <SearchBar onSearch={handleSearch} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "25px",
          marginTop: "20px",
        }}
      >
        {videos.map((video) => (
          <VideoCard
            key={video.id.videoId}
            video={video}
          />
        ))}
      </div>
    </>
  );
}