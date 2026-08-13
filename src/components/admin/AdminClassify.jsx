import React from "react";
import { useParams } from "react-router-dom";
import VideoClassifyForm from "../../components/admin/VideoClassifyForm";

const AdminClassify = () => {
  const { id } = useParams();

  const video = {
    id,
    youtube_id: id,
    title: "Selected JEE Lecture",
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    channel_name: "JEE-Tube",
  };

  return <VideoClassifyForm video={video} />;
};

export default AdminClassify;