const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export async function searchVideos(query) {
  const url =
    `https://www.googleapis.com/youtube/v3/search` +
    `?part=snippet` +
    `&maxResults=20` +
    `&type=video` +
    `&q=${encodeURIComponent(query + " JEE")}` +
    `&key=${API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch YouTube videos");
  }

  const data = await response.json();

  return data.items;
}