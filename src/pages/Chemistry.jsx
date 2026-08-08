
import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import SubjectRow from "../components/home/SubjectRow";
import { searchYoutube } from "../api/youtube";
import { subjectRows } from "../data/subjectRows";

export default function Chemistry() {
  const [rows, setRows] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChemistry() {
      try {
        const result = {};

        for (const row of subjectRows.Chemistry) {
          const videos = await searchYoutube(row.query);

          result[row.title] = Array.isArray(videos)
            ? videos.slice(0, 20)
            : [];
        }

        setRows(result);
      } catch (error) {
        console.error("Chemistry loading error:", error);
      } finally {
        setLoading(false);
      }
    }

    loadChemistry();
  }, []);

  return (
    <Layout>
      <div style={styles.page}>
        <h1 style={styles.heading}>Chemistry</h1>

        <p style={styles.subtitle}>
          JEE Chemistry lectures, teachers, series and PYQs
        </p>

        {loading && (
          <p style={styles.loading}>Loading Chemistry library...</p>
        )}

        {!loading &&
          subjectRows.Chemistry.map((row) => (
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
