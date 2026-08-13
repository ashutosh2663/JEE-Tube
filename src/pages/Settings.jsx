import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings as SettingsIcon,
  ShieldCheck,
  ChevronRight,
  User,
  Monitor,
} from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();

  const isAdmin =
    localStorage.getItem("jee_tube_admin") === "true";

  return (
    <main className="settings-page">
      {/* HEADER */}
      <div className="settings-header">
        <div className="settings-header-icon">
          <SettingsIcon size={28} />
        </div>

        <div>
          <h1>General Settings</h1>
          <p>
            Manage your JEE-Tube experience and account preferences.
          </p>
        </div>
      </div>

      {/* ACCOUNT */}
      <section className="settings-section">
        <h2>Account</h2>

        <div className="settings-card">
          <div className="settings-card-icon">
            <User size={21} />
          </div>

          <div className="settings-card-content">
            <h3>Account</h3>
            <p>
              Manage your JEE-Tube account and login settings.
            </p>
          </div>

          <ChevronRight size={20} />
        </div>
      </section>

      {/* APPEARANCE */}
      <section className="settings-section">
        <h2>Appearance</h2>

        <div className="settings-card">
          <div className="settings-card-icon">
            <Monitor size={21} />
          </div>

          <div className="settings-card-content">
            <h3>Playback & Appearance</h3>
            <p>
              Customize how JEE-Tube looks and behaves while studying.
            </p>
          </div>

          <ChevronRight size={20} />
        </div>
      </section>

      {/* ADMIN */}
      {isAdmin && (
        <section className="settings-section">
          <h2>Administration</h2>

          <button
            type="button"
            className="admin-panel-card"
            onClick={() => navigate("/admin")}
          >
            <div className="admin-panel-icon">
              <ShieldCheck size={24} />
            </div>

            <div className="settings-card-content">
              <h3>Admin Panel</h3>
              <p>
                Manage videos, classifications, subjects and
                JEE-Tube content.
              </p>
            </div>

            <ChevronRight size={22} />
          </button>
        </section>
      )}
    </main>
  );
}