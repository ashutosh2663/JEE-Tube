import {
  getVideoFromUrl,
} from "./services/youtube.mjs";

import {
  injectVideo,
} from "./services/videoInjector.mjs";

export async function injectYoutubeUrl(url) {
  if (!url || typeof url !== "string") {
    throw new Error("YouTube URL is required.");
  }

  console.log("\n========================================");
  console.log("        JEE-TUBE URL INJECTOR");
  console.log("========================================");

  console.log("\nURL:");
  console.log(url);

  console.log("\nFetching YouTube video...");

  const video = await getVideoFromUrl(url);

  console.log("\nVideo found:");
  console.log("Title:", video.title);
  console.log("Channel:", video.channelName);
  console.log("Video ID:", video.youtubeId);

  console.log("\nSending video to injector...");

  const result = await injectVideo(video);

  console.log("\n========================================");
  console.log("RESULT");
  console.log("========================================");

  console.log(JSON.stringify(result, null, 2));

  return result;
}