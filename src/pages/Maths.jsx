
import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import SubjectRow from "../components/home/SubjectRow";
import { searchYoutube } from "../api/youtube";
import { subjectRows } from "../data/subjectRows";

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
          <p style={styles.loading}>Loading Maths library...</p>
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
