const API_KEY = process.env.YOUTUBE_API_KEY;

if (!API_KEY) {
  throw new Error("YOUTUBE_API_KEY is missing.");
}

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
    throw new Error(`YouTube API error: ${errorText}`);
  }

  return response.json();
}

export async function searchVideos(query, maxResults = 25) {
  const data = await youtubeRequest("search", {
    part: "snippet",
    q: query,
    maxResults: String(Math.min(maxResults, 50)),
    order: "relevance",
    type: "video",
  });

  return (data.items || [])
    .filter((item) => item.id?.videoId)
    .map((item) => ({
      youtubeId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description || "",
      thumbnail:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url ||
        null,
      channelName: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
    }));
}

export async function getChannelVideos(channelId, maxResults = 50) {
  const data = await youtubeRequest("search", {
    part: "snippet",
    channelId,
    maxResults: String(Math.min(maxResults, 50)),
    order: "date",
    type: "video",
  });

  return (data.items || [])
    .filter((item) => item.id?.videoId)
    .map((item) => ({
      youtubeId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description || "",
      thumbnail:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url ||
        null,
      channelName: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
    }));
}