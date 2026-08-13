import React from "react";
import { Link } from "react-router-dom";
import {
  Video,
  AlertCircle,
  ArrowRight,
  Database,
} from "lucide-react";
import AdminHeader from "../../components/admin/AdminHeader";
import AdminStats from "../../components/admin/AdminStats";

const AdminDashboard = () => {
  const total = 0;
  const classified = 0;
  const unclassified = 0;

  return (
    <>
      <AdminHeader
        title="Dashboard"
        subtitle="Manage and organize the JEE-Tube learning library."
      />

      <div className="admin-content">
        <AdminStats
          total={total}
          classified={classified}
          unclassified={unclassified}
        />

        <section className="admin-welcome">
          <div className="welcome-icon">
            <Database size={28} />
          </div>

          <div>
            <span>CONTENT MANAGEMENT</span>
            <h2>Build a better JEE library.</h2>
            <p>
              Classify lectures by subject, chapter, topic,
              teacher and exam so students can find exactly
              what they need.
            </p>
          </div>
        </section>

        <div className="admin-quick-grid">
          <Link
            to="/admin/videos/unclassified"
            className="admin-quick-card"
          >
            <div className="quick-card-icon warning">
              <AlertCircle size={22} />
            </div>

            <div>
              <h3>Review unclassified videos</h3>
              <p>
                Manually categorize videos that haven't
                been organized yet.
              </p>
            </div>

            <ArrowRight size={20} />
          </Link>

          <Link
            to="/admin/videos"
            className="admin-quick-card"
          >
            <div className="quick-card-icon">
              <Video size={22} />
            </div>

            <div>
              <h3>Manage video library</h3>
              <p>
                Search, inspect and edit your entire
                JEE-Tube catalogue.
              </p>
            </div>

            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;