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

        for (const row of subjectRows.Maths) {
          const videos = await searchYoutube(row.query);

          result[row.title] = Array.isArray(videos)
            ? videos.slice(0, 20)
            : [];
        }

        // Get videos that were deliberately added to the JEE-Tube library
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

        // Put library videos into the matching Maths section
        if (Array.isArray(libraryVideos)) {
          for (const video of libraryVideos) {
            const chapter = video.chapter;

            const matchingRow = subjectRows.Maths.find(
              (row) =>
                row.title
                  .toLowerCase()
                  .includes(String(chapter || "").toLowerCase()) ||
                String(chapter || "")
                  .toLowerCase()
                  .includes(row.title.toLowerCase())
            );

            if (!matchingRow) continue;

            const convertedVideo = {
              id: {
                videoId: video.youtube_id,
              },
              snippet: {
                title: video.title,
                description: video.description || "",
                channelTitle: video.channel_name || "JEE-Tube",
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