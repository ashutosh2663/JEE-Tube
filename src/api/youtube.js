
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

/*
 * JEE-focused YouTube channels.
 *
 * Add more channel IDs here as you decide which channels
 * should appear on JEE-Tube.
 */
const JEE_CHANNELS = [
  {
    name: "PW JEE",
    id: "UC3i-aRcm8Rw16k2_vNmF-Qw",
  },

  // Add verified JEE channel IDs here.
  // Example:
  // {
  //   name: "ALLEN JEE",
  //   id: "CHANNEL_ID_HERE",
  // },
];

/*
 * Search YouTube for long-form JEE study videos.
 */
export async function searchYoutube(query) {
  if (!API_KEY) {
    throw new Error("YouTube API key is missing");
  }

  const url =
    `https://www.googleapis.com/youtube/v3/search` +
    `?part=snippet` +
    `&maxResults=50` +
    `&type=video` +
    `&q=${encodeURIComponent(query + " JEE")}` +
    `&key=${API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("YouTube API error:", errorText);

    throw new Error("Failed to fetch YouTube videos");
  }

  const data = await response.json();

  let videos = data.items || [];

  /*
   * Remove Shorts.
   *
   * YouTube Shorts normally contain "#shorts" or
   * "shorts" in the title/description.
   */
  videos = videos.filter((video) => {
    const title = video?.snippet?.title?.toLowerCase() || "";
    const description =
      video?.snippet?.description?.toLowerCase() || "";

    return (
      !title.includes("#shorts") &&
      !title.includes("shorts") &&
      !description.includes("#shorts")
    );
  });

  /*
   * If channel whitelist is configured, keep only those channels.
   */
  if (JEE_CHANNELS.length > 0) {
    const allowedChannels = new Set(
      JEE_CHANNELS.map((channel) => channel.id)
    );

    videos = videos.filter((video) =>
      allowedChannels.has(video?.snippet?.channelId)
    );
  }

  return videos;
}

