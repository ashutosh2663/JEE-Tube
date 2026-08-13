import React from "react";
import {
  Home,
  Compass,
  Flame,
  Clock3,
  PlaySquare,
  History,
  Bookmark,
  ListVideo,
  Heart,
  Atom,
  FlaskConical,
  Calculator,
  GraduationCap,
  Target,
  FileQuestion,
  ClipboardList,
  Settings,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";

const mainItems = [
  {
    label: "Home",
    icon: Home,
    path: "/",
  },
  {
    label: "Explore",
    icon: Compass,
    path: "/explore",
  },
  {
    label: "Trending",
    icon: Flame,
    path: "/trending",
  },
  {
    label: "Latest Lectures",
    icon: Clock3,
    path: "/latest",
  },
];

const studyItems = [
  {
    label: "Physics",
    icon: Atom,
    path: "/physics",
  },
  {
    label: "Chemistry",
    icon: FlaskConical,
    path: "/chemistry",
  },
  {
    label: "Mathematics",
    icon: Calculator,
    path: "/maths",
  },
];

const learningItems = [
  {
    label: "Continue Watching",
    icon: PlaySquare,
    path: "/continue-watching",
  },
  {
    label: "History",
    icon: History,
    path: "/history",
  },
  {
    label: "Watch Later",
    icon: Bookmark,
    path: "/watch-later",
  },
  {
    label: "Playlists",
    icon: ListVideo,
    path: "/playlists",
  },
  {
    label: "Liked Lectures",
    icon: Heart,
    path: "/liked",
  },
];

const examItems = [
  {
    label: "JEE Main",
    icon: GraduationCap,
    path: "/jee-main",
  },
  {
    label: "JEE Advanced",
    icon: Target,
    path: "/jee-advanced",
  },
  {
    label: "PYQs",
    icon: FileQuestion,
    path: "/pyqs",
  },
  {
    label: "DPP & Practice",
    icon: ClipboardList,
    path: "/practice",
  },
];

export default function Sidebar({ open }) {
  const navigate = useNavigate();
  const location = useLocation();

  const renderItems = (items) =>
    items.map((item) => {
      const Icon = item.icon;

      const active =
        location.pathname === item.path ||
        location.pathname.startsWith(`${item.path}/`);

      return (
        <button
          key={item.label}
          className={`sidebar-item ${active ? "active" : ""}`}
          onClick={() => navigate(item.path)}
          title={!open ? item.label : ""}
        >
          <Icon size={20} />
          <span>{item.label}</span>
        </button>
      );
    });

  return (
    <aside className={`jt-sidebar ${open ? "" : "closed"}`}>

      {/* MAIN */}
      <div className="sidebar-section">
        {renderItems(mainItems)}
      </div>

      <div className="sidebar-divider" />

      {/* STUDY */}
      <div className="sidebar-title">
        {open && "STUDY"}
      </div>

      <div className="sidebar-section">
        {renderItems(studyItems)}
      </div>

      <div className="sidebar-divider" />

      {/* YOUR LEARNING */}
      <div className="sidebar-title">
        {open && "YOUR LEARNING"}
      </div>

      <div className="sidebar-section">
        {renderItems(learningItems)}
      </div>

      <div className="sidebar-divider" />

      {/* EXAM PREP */}
      <div className="sidebar-title">
        {open && "EXAM PREP"}
      </div>

      <div className="sidebar-section">
        {renderItems(examItems)}
      </div>

      <div className="sidebar-divider" />

      {/* SETTINGS */}
      <button
        className={`sidebar-item ${
          location.pathname === "/settings" ? "active" : ""
        }`}
        onClick={() => navigate("/settings")}
        title={!open ? "Settings" : ""}
      >
        <Settings size={20} />
        <span>Settings</span>
      </button>

      {/* FOOTER */}
      {open && (
        <div className="sidebar-footer">
          <strong>JEE-Tube</strong>
          <p>
            Built for serious JEE preparation.
          </p>
        </div>
      )}

    </aside>
  );
}