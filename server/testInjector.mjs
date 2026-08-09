import "dotenv/config";

import { searchVideos } from "./services/youtube.mjs";
import { injectVideo } from "./services/videoInjector.mjs";

try {
  console.log("Searching for a JEE Physics video...\n");

  const videos = await searchVideos("JEE Physics", 5);

  if (!videos.length) {
    throw new Error("No JEE videos found.");
  }

  for (const video of videos) {
    console.log("Testing:");
    console.log(video.title);
    console.log("Channel:", video.channelName);
    console.log("");

    const result = await injectVideo(video);

    console.log("Result:");
    console.log(JSON.stringify(result, null, 2));
    console.log("\n-----------------------------\n");

    // Stop after the first successfully inserted video.
    if (result.action === "inserted") {
      break;
    }
  }
} catch (error) {
  console.error("Injector test failed:");
  console.error(error.message);
}