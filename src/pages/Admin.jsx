import React from "react";
import { Link } from "react-router-dom";

export default function Admin() {
  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <p className="admin-kicker">JEE TUBE</p>
          <h1>Admin Panel</h1>
          <p>Manage and classify your educational content.</p>
        </div>

        <Link to="/" className="admin-home-btn">
          ← Back to JEE Tube
        </Link>
      </header>

      <main className="admin-content">
        <section className="admin-stats">
          <div className="admin-stat-card">
            <span>Total Videos</span>
            <strong>0</strong>
          </div>

          <div className="admin-stat-card">
            <span>Pending Review</span>
            <strong>0</strong>
          </div>

          <div className="admin-stat-card">
            <span>Classified</span>
            <strong>0</strong>
          </div>

          <div className="admin-stat-card">
            <span>Featured</span>
            <strong>0</strong>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Video Classification</h2>
              <p>
                Manually organize videos into the correct JEE-Tube categories.
              </p>
            </div>
          </div>

          <div className="admin-empty">
            <div className="admin-empty-icon">🎬</div>
            <h3>No videos to review</h3>
            <p>
              Videos fetched from your content source will appear here for
              manual classification.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}