
const API_KEY = process.env.YOUTUBE_API_KEY;

if (!API_KEY) {
  throw new Error("YOUTUBE_API_KEY is missing.");
}


// =========================================================
// YOUTUBE API REQUEST
// =========================================================

async function youtubeRequest(endpoint, params) {
  const searchParams = new URLSearchParams({
    ...params,
    key: API_KEY,
  });

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/${endpoint}?${searchParams}`
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `YouTube API error: ${errorText}`
    );
  }

  return response.json();
}


// =========================================================
// EXTRACT YOUTUBE VIDEO ID
// =========================================================

export function extractYoutubeVideoId(url) {
  if (!url || typeof url !== "string") {
    throw new Error("YouTube URL is required.");
  }

  const value = url.trim();

  // -------------------------------------------------------
  // RAW VIDEO ID
  // -------------------------------------------------------

  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error("Invalid YouTube URL.");
  }

  const hostname = parsedUrl.hostname
    .toLowerCase()
    .replace(/^www\./, "")
    .replace(/^m\./, "");

  // -------------------------------------------------------
  // YOUTUBE.COM
  // -------------------------------------------------------

  if (
    hostname === "youtube.com" ||
    hostname === "youtube-nocookie.com"
  ) {
    // youtube.com/watch?v=VIDEO_ID
    const watchId =
      parsedUrl.searchParams.get("v");

    if (
      watchId &&
      /^[a-zA-Z0-9_-]{11}$/.test(watchId)
    ) {
      return watchId;
    }

    // youtube.com/live/VIDEO_ID
    const liveMatch =
      parsedUrl.pathname.match(
        /^\/live\/([a-zA-Z0-9_-]{11})/
      );

    if (liveMatch) {
      return liveMatch[1];
    }

    // youtube.com/shorts/VIDEO_ID
    const shortsMatch =
      parsedUrl.pathname.match(
        /^\/shorts\/([a-zA-Z0-9_-]{11})/
      );

    if (shortsMatch) {
      return shortsMatch[1];
    }

    // youtube.com/embed/VIDEO_ID
    const embedMatch =
      parsedUrl.pathname.match(
        /^\/embed\/([a-zA-Z0-9_-]{11})/
      );

    if (embedMatch) {
      return embedMatch[1];
    }
  }

  // -------------------------------------------------------
  // YOUTU.BE
  // -------------------------------------------------------

  if (hostname === "youtu.be") {
    const videoId =
      parsedUrl.pathname
        .split("/")
        .filter(Boolean)[0];

    if (
      videoId &&
      /^[a-zA-Z0-9_-]{11}$/.test(videoId)
    ) {
      return videoId;
    }
  }

  throw new Error(
    "Could not extract a valid YouTube video ID from the URL."
  );
}


// =========================================================
// SEARCH VIDEOS
// =========================================================

export async function searchVideos(
  query,
  maxResults = 25
) {
  const data = await youtubeRequest("search", {
    part: "snippet",
    q: query,
    maxResults: String(
      Math.min(maxResults, 50)
    ),
    order: "relevance",
    type: "video",
  });

  return (data.items || [])
    .filter((item) => item.id?.videoId)
    .map((item) => ({
      youtubeId: item.id.videoId,

      title:
        item.snippet?.title || "",

      description:
        item.snippet?.description || "",

      thumbnail:
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        null,

      channelName:
        item.snippet?.channelTitle || null,

      channelId:
        item.snippet?.channelId || null,

      publishedAt:
        item.snippet?.publishedAt || null,
    }));
}


// =========================================================
// CHANNEL VIDEOS
// =========================================================

export async function getChannelVideos(
  channelId,
  maxResults = 50
) {
  const data = await youtubeRequest("search", {
    part: "snippet",
    channelId,
    maxResults: String(
      Math.min(maxResults, 50)
    ),
    order: "date",
    type: "video",
  });

  return (data.items || [])
    .filter((item) => item.id?.videoId)
    .map((item) => ({
      youtubeId: item.id.videoId,

      title:
        item.snippet?.title || "",

      description:
        item.snippet?.description || "",

      thumbnail:
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        null,

      channelName:
        item.snippet?.channelTitle || null,

      channelId:
        item.snippet?.channelId || null,

      publishedAt:
        item.snippet?.publishedAt || null,
    }));
}


// =========================================================
// VIDEO DETAILS
// =========================================================

export async function getVideoDetails(videoId) {
  if (
    !videoId ||
    !/^[a-zA-Z0-9_-]{11}$/.test(videoId)
  ) {
    throw new Error(
      `Invalid YouTube video ID: ${videoId}`
    );
  }

  const data = await youtubeRequest("videos", {
    part: "snippet,contentDetails",
    id: videoId,
  });

  const video = data.items?.[0];

  if (!video) {
    throw new Error(
      `YouTube video not found: ${videoId}`
    );
  }

  return {
    youtubeId:
      video.id,

    title:
      video.snippet?.title || "",

    description:
      video.snippet?.description || "",

    thumbnail:
      video.snippet?.thumbnails?.high?.url ||
      video.snippet?.thumbnails?.medium?.url ||
      video.snippet?.thumbnails?.default?.url ||
      null,

    channelName:
      video.snippet?.channelTitle || null,

    channelId:
      video.snippet?.channelId || null,

    publishedAt:
      video.snippet?.publishedAt || null,

    duration:
      video.contentDetails?.duration || null,
  };
}


// =========================================================
// GET VIDEO FROM URL
// =========================================================

export async function getVideoFromUrl(url) {
  const videoId =
    extractYoutubeVideoId(url);

  console.log(
    `Extracted YouTube video ID: ${videoId}`
  );

  return getVideoDetails(videoId);
}
