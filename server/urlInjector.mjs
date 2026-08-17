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

  console.log("");
  console.log("========================================");
  console.log("        JEE-TUBE URL INJECTOR");
  console.log("========================================");

  console.log("");
  console.log("URL:");
  console.log(url);

  console.log("");
  console.log("Fetching YouTube video...");

  const video = await getVideoFromUrl(url);

  console.log("");
  console.log("Video found:");
  console.log("Title:", video.title);
  console.log("Channel:", video.channelName);
  console.log("Video ID:", video.youtubeId);

  console.log("");
  console.log("Sending video to injector...");

  const result = await injectVideo(video);

  console.log("");
  console.log("========================================");
  console.log("RESULT");
  console.log("========================================");

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}
