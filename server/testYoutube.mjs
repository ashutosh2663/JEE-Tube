import "dotenv/config";
import { getChannelVideos } from "./services/youtube.mjs";

const channelId = "UC_x5XG1OV2P6uZZ5FSM9Ttw";

try {
  const videos = await getChannelVideos(channelId, 5);

  console.log(`Found ${videos.length} videos.`);

  for (const video of videos) {
    console.log({
      id: video.youtubeId,
      title: video.title,
      channel: video.channelName,
    });
  }
} catch (error) {
  console.error("YouTube test failed:", error.message);
}