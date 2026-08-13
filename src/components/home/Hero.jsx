import React from "react";
import { Play, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-background">
        <div className="hero-glow" />
      </div>

      <div className="hero-content">
        <div className="hero-badge">
          🔥 JEE PREPARATION
        </div>

        <h1>
          Master JEE.
          <br />
          One Lecture At A Time.
        </h1>

        <p>
          Discover lectures, revision sessions, PYQs and complete
          chapter-wise preparation in one place.
        </p>

        <div className="hero-actions">
          <button
            className="hero-primary"
            onClick={() => navigate("/explore")}
          >
            <Play size={20} fill="currentColor" />
            Start Learning
          </button>

          <button
            className="hero-secondary"
            onClick={() => navigate("/subject/physics")}
          >
            <Info size={20} />
            Explore Subjects
          </button>
        </div>
      </div>
    </section>
  );
}