
import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import SubjectRow from "../components/home/SubjectRow";
import { supabase } from "../lib/supabase";

export default function Physics() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPhysicsVideos() {
      try {
        const { data, error } = await supabase
          .from("videos")
          .select("*")
          .eq("subject", "Physics")
          .eq("status", "active")
          .order("chapter", { ascending: true })
          .order("series_name", { ascending: true })
          .order("sequence_order", { ascending: true, nullsFirst: false });

        if (error) {
          throw error;
        }

        const videos = Array.isArray(data) ? data : [];

        // Group videos by Chapter + Series
        const grouped = {};

        videos.forEach((video) => {
          const chapter = video.chapter || "Other Physics";
          const series = video.series_name || "JEE Physics";

          const key = `${chapter} — ${series}`;

          if (!grouped[key]) {
            grouped[key] = [];
          }

          grouped[key].push(video);
        });

        const formattedRows = Object.entries(grouped).map(
          ([title, videos]) => ({
            title,
            videos,
          })
        );

        setRows(formattedRows);
      } catch (error) {
        console.error("Physics videos loading error:", error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    }

    loadPhysicsVideos();
  }, []);

  return (
    <Layout>
      <div style={styles.page}>
        <h1 style={styles.heading}>Physics</h1>

        <p style={styles.subtitle}>
          JEE Physics lectures, series, teachers and problem solving
        </p>

        {loading ? (
          <SubjectRow
            title="Loading Physics..."
            videos={[]}
            loading={true}
          />
        ) : rows.length === 0 ? (
          <div style={styles.empty}>
            No Physics videos found in the library.
          </div>
        ) : (
          rows.map((row) => (
            <SubjectRow
              key={row.title}
              title={row.title}
              videos={row.videos}
              loading={false}
            />
          ))
        )}
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

  empty: {
    color: "#777",
    padding: "40px 0",
    fontSize: "16px",
  },
};