import "dotenv/config";
import { searchVideos } from "./services/youtube.mjs";

try {
  const videos = await searchVideos("JEE Physics", 5);

  console.log(`Found ${videos.length} candidate videos.\n`);

  for (const video of videos) {
    console.log({
      id: video.youtubeId,
      title: video.title,
      channel: video.channelName,
    });
  }
} catch (error) {
  console.error("Discovery test failed:", error.message);
}