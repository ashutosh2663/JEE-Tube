import React from "react";
import { Play, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ContinueWatching from "./ContinueWatching";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <>
      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section className="hero">
        {/* Background */}
        <div className="hero-background">
          <div className="hero-glow" />
        </div>

        {/* Content */}
        <div className="hero-content">
          {/* Badge */}
          <div className="hero-badge">
            🔥 JEE PREPARATION
          </div>

          {/* Heading */}
          <h1>
            Master JEE.
            <br />
            One Lecture At A Time.
          </h1>

          {/* Description */}
          <p>
            Discover lectures, revision sessions, PYQs and
            complete chapter-wise preparation in one place.
          </p>

          {/* Buttons */}
          <div className="hero-actions">
            <button
              className="hero-primary"
              onClick={() => navigate("/explore")}
            >
              <Play size={20} fill="currentColor" />
              <span>Start Learning</span>
            </button>

            <button
              className="hero-secondary"
              onClick={() => navigate("/subject/physics")}
            >
              <Info size={20} />
              <span>Explore Subjects</span>
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTINUE WATCHING
          Shows the user's previously watched lectures.
      ===================================================== */}
      <ContinueWatching />
    </>
  );
}