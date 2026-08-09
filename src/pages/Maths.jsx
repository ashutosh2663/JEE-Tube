import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import SubjectRow from "../components/home/SubjectRow";
import { searchYoutube } from "../api/youtube";
import { subjectRows } from "../data/subjectRows";
import { supabase } from "../lib/supabase";

export default function Maths() {
  const [rows, setRows] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMaths() {
      try {
        const result = {};

        // Load normal YouTube results
        for (const row of subjectRows.Maths) {
          const videos = await searchYoutube(row.query);

          result[row.title] = Array.isArray(videos)
            ? videos.slice(0, 20)
            : [];
        }

        // Load videos deliberately added to the JEE-Tube library
        const { data: libraryVideos, error } = await supabase
          .from("videos")
          .select("*")
          .eq("subject", "Maths")
          .eq("status", "active")
          .order("sequence_order", {
            ascending: true,
            nullsFirst: false,
          });

        if (error) {
          console.error("Maths library error:", error);
        }

        if (Array.isArray(libraryVideos)) {
          for (const video of libraryVideos) {
            const chapter = String(video.chapter || "").toLowerCase();
            const series = String(video.series_name || "").toLowerCase();

            let matchingRow = null;

            // Sequence & Series belongs to the Manzil Series section
            if (
              chapter.includes("sequence & series") ||
              chapter.includes("sequence and series") ||
              series.includes("sequence & series") ||
              series.includes("sequence and series")
            ) {
              matchingRow = subjectRows.Maths.find((row) =>
                row.title.toLowerCase().includes("manzil")
              );
            }

            // Fallback for other library videos
            if (!matchingRow) {
              matchingRow = subjectRows.Maths.find((row) => {
                const title = row.title.toLowerCase();

                return (
                  title.includes(chapter) ||
                  chapter.includes(title)
                );
              });
            }

            if (!matchingRow) continue;

            // Convert Supabase video into the format VideoCard expects
            const convertedVideo = {
              id: {
                videoId: video.youtube_id,
              },

              snippet: {
                title: video.title,
                description: video.description || "",
                channelTitle:
                  video.channel_name || "JEE-Tube",

                thumbnails: {
                  medium: {
                    url: video.thumbnail,
                  },
                  default: {
                    url: video.thumbnail,
                  },
                },
              },
            };

            // Put the library video at the beginning
            result[matchingRow.title] = [
              convertedVideo,

              ...(result[matchingRow.title] || []).filter(
                (existing) =>
                  existing?.id?.videoId !== video.youtube_id
              ),
            ];
          }
        }

        setRows(result);
      } catch (error) {
        console.error("Maths loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadMaths();
  }, []);

  return (
    <Layout>
      <div style={styles.page}>
        <h1 style={styles.heading}>Maths</h1>

        <p style={styles.subtitle}>
          JEE Maths lectures, teachers, series and advanced problems
        </p>

        {loading && (
          <p style={styles.loading}>
            Loading Maths library...
          </p>
        )}

        {!loading &&
          subjectRows.Maths.map((row) => (
            <SubjectRow
              key={row.title}
              title={row.title}
              videos={rows[row.title] || []}
            />
          ))}
      </div>
    </Layout>
  );
}

const styles = {
  page: {
    width: "100%",
  },

  heading: {
    margin: 0,
    fontSize: "36px",
    color: "#fff",
  },

  subtitle: {
    color: "#888",
    marginTop: "8px",
  },

  loading: {
    color: "#aaa",
    marginTop: "30px",
  },
};