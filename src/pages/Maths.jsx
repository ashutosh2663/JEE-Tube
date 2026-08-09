import { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import SubjectRow from "../components/home/SubjectRow";
import { searchYoutube } from "../api/youtube";
import { subjectRows } from "../data/subjectRows";
import { supabase } from "../lib/supabase";

function convertLibraryVideo(video) {
  return {
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
}

function addUniqueVideos(existing = [], incoming = []) {
  const result = [...existing];

  for (const video of incoming) {
    const id =
      video?.id?.videoId ||
      video?.id ||
      video?.videoId;

    if (!id) continue;

    const alreadyExists = result.some(
      (item) =>
        (item?.id?.videoId ||
          item?.id ||
          item?.videoId) === id
    );

    if (!alreadyExists) {
      result.push(video);
    }
  }

  return result;
}

export default function Maths() {
  const [rows, setRows] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadMaths() {
      setLoading(true);

      // Start with every Maths section so the page
      // always renders even if YouTube search fails.
      const result = {};

      subjectRows.Maths.forEach((row) => {
        result[row.title] = [];
      });

      // --------------------------------------------------
      // 1. Load YouTube results independently
      // --------------------------------------------------

      const youtubeResults = await Promise.allSettled(
        subjectRows.Maths.map(async (row) => {
          try {
            const videos = await searchYoutube(
              row.query
            );

            return {
              title: row.title,
              videos: Array.isArray(videos)
                ? videos.slice(0, 20)
                : [],
            };
          } catch (error) {
            console.error(
              `Maths YouTube search failed: ${row.title}`,
              error
            );

            return {
              title: row.title,
              videos: [],
            };
          }
        })
      );

      youtubeResults.forEach((item) => {
        if (
          item.status === "fulfilled" &&
          item.value
        ) {
          result[item.value.title] =
            item.value.videos;
        }
      });

      // --------------------------------------------------
      // 2. Load JEE-Tube library videos
      // --------------------------------------------------

      const { data: libraryVideos, error } =
        await supabase
          .from("videos")
          .select("*")
          .eq("subject", "Maths")
          .eq("status", "active")
          .order("sequence_order", {
            ascending: true,
            nullsFirst: false,
          });

      if (error) {
        console.error(
          "Maths library error:",
          error
        );
      }

      // --------------------------------------------------
      // 3. Put library videos into the correct sections
      // --------------------------------------------------

      if (Array.isArray(libraryVideos)) {
        for (const video of libraryVideos) {
          const chapter = String(
            video.chapter || ""
          ).toLowerCase();

          const category = String(
            video.category || ""
          ).toLowerCase();

          const seriesName = String(
            video.series_name || ""
          ).toLowerCase();

          const title = String(
            video.title || ""
          ).toLowerCase();

          const converted =
            convertLibraryVideo(video);

          // ----------------------------------------------
          // MANZIL SERIES
          // ----------------------------------------------
          //
          // Sequence & Series belongs to Manzil,
          // so deliberately place it in the Manzil row.

          if (
            seriesName.includes("manzil") ||
            title.includes("manzil") ||
            category.includes("manzil")
          ) {
            const manzilRow =
              subjectRows.Maths.find((row) =>
                row.title
                  .toLowerCase()
                  .includes("manzil")
              );

            if (manzilRow) {
              result[manzilRow.title] =
                addUniqueVideos(
                  result[manzilRow.title],
                  [converted]
                );
            }

            continue;
          }

          // ----------------------------------------------
          // SEQUENCE & SERIES
          // ----------------------------------------------

          if (
            chapter.includes(
              "sequence"
            ) ||
            chapter.includes("series") ||
            title.includes(
              "sequence & series"
            ) ||
            title.includes(
              "sequence and series"
            )
          ) {
            const manzilRow =
              subjectRows.Maths.find((row) =>
                row.title
                  .toLowerCase()
                  .includes("manzil")
              );

            if (manzilRow) {
              result[manzilRow.title] =
                addUniqueVideos(
                  result[manzilRow.title],
                  [converted]
                );
            }

            continue;
          }

          // ----------------------------------------------
          // Other library videos
          // ----------------------------------------------

          const matchingRow =
            subjectRows.Maths.find((row) => {
              const rowTitle =
                row.title.toLowerCase();

              return (
                rowTitle.includes(chapter) ||
                chapter.includes(rowTitle)
              );
            });

          if (matchingRow) {
            result[matchingRow.title] =
              addUniqueVideos(
                result[matchingRow.title],
                [converted]
              );
          }
        }
      }

      if (!cancelled) {
        setRows(result);
        setLoading(false);
      }
    }

    loadMaths();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Layout>
      <div style={styles.page}>
        <h1 style={styles.heading}>
          Maths
        </h1>

        <p style={styles.subtitle}>
          JEE Maths lectures, teachers,
          series and advanced problems
        </p>

        {loading && (
          <p style={styles.loading}>
            Loading Maths library...
          </p>
        )}

        {subjectRows.Maths.map((row) => (
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

  loading: {
    color: "#aaa",
    marginTop: "30px",
  },
};