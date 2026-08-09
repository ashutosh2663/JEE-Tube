
import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import SubjectRow from "../components/home/SubjectRow";
import { searchYoutube } from "../api/youtube";
import { subjectRows } from "../data/subjectRows";

export default function Physics() {
  const [rows, setRows] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPhysics() {
      try {
        const results = await Promise.all(
          subjectRows.Physics.map(async (row) => {
            try {
              const videos = await searchYoutube(row.query);

              return {
                title: row.title,
                videos: Array.isArray(videos)
                  ? videos.slice(0, 20)
                  : [],
              };
            } catch (error) {
              console.error(`Physics row failed: ${row.title}`, error);

              return {
                title: row.title,
                videos: [],
              };
            }
          })
        );

        const formattedRows = {};

        results.forEach((row) => {
          formattedRows[row.title] = row.videos;
        });

        setRows(formattedRows);
      } catch (error) {
        console.error("Physics loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPhysics();
  }, []);

  return (
    <Layout>
      <div style={styles.page}>
        <h1 style={styles.heading}>Physics</h1>

        <p style={styles.subtitle}>
          JEE Physics lectures, series, teachers and problem solving
        </p>

        {subjectRows.Physics.map((row) => (
          <SubjectRow
            key={row.title}
            title={row.title}
            videos={rows[row.title] || []}
            loading={loading}
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
};
