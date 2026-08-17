import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import Layout from "../components/layout/Layout";
import Hero from "../components/home/Hero";
import SubjectRow from "../components/home/SubjectRow";
import ContinueWatching from "../components/home/ContinueWatching";

import { getHomeVideos } from "../lib/videoLibrary";

export default function Home() {
  const [physicsVideos, setPhysicsVideos] = useState([]);
  const [chemistryVideos, setChemistryVideos] = useState([]);
  const [mathematicsVideos, setMathematicsVideos] =
    useState([]);

  const [loading, setLoading] = useState(true);

  const loadHomeVideos = useCallback(async () => {
    try {
      setLoading(true);

      const [
        physics,
        chemistry,
        mathematics,
      ] = await Promise.all([
        getHomeVideos("Physics", 8),
        getHomeVideos("Chemistry", 8),
        getHomeVideos("Mathematics", 8),
      ]);

      setPhysicsVideos(physics);
      setChemistryVideos(chemistry);
      setMathematicsVideos(mathematics);
    } catch (error) {
      console.error(
        "Could not load Home videos:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomeVideos();
  }, [loadHomeVideos]);

  return (
    <Layout>
      <Hero />

      <div className="home-content">

        {/* =========================================
            CONTINUE WATCHING
            User-specific.
            Comes from watch_progress.
        ========================================= */}

        <ContinueWatching />

        {/* =========================================
            PHYSICS
        ========================================= */}

        {!loading &&
          physicsVideos.length > 0 && (
            <SubjectRow
              title="Physics"
              videos={physicsVideos}
              viewAllPath="/subject/physics"
            />
          )}

        {/* =========================================
            CHEMISTRY
        ========================================= */}

        {!loading &&
          chemistryVideos.length > 0 && (
            <SubjectRow
              title="Chemistry"
              videos={chemistryVideos}
              viewAllPath="/subject/chemistry"
            />
          )}

        {/* =========================================
            MATHEMATICS
        ========================================= */}

        {!loading &&
          mathematicsVideos.length > 0 && (
            <SubjectRow
              title="Mathematics"
              videos={mathematicsVideos}
              viewAllPath="/subject/mathematics"
            />
          )}

      </div>
    </Layout>
  );
}