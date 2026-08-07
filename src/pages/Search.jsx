import { useState } from "react";

import SearchBar from "../components/search/SearchBar";
import VideoCard from "../components/cards/VideoCard";

import { searchYoutube } from "../api/youtube";

export default function Search() {
  const [videos, setVideos] = useState([]);

  async function handleSearch(query) {
    const result = await searchYoutube(query);

    setVideos(result);
  }

  return (
    <>
      <SearchBar onSearch={handleSearch} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
          gap: "25px",
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