import React, { useState } from "react";
import { Menu, Search, Bell, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onMenuClick }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();

    if (!query.trim()) return;

    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="jt-navbar">
      <div className="jt-navbar-left">
        <button className="icon-button" onClick={onMenuClick}>
          <Menu size={23} />
        </button>

        <div
          className="jt-logo"
          onClick={() => navigate("/")}
        >
          <span className="jt-logo-mark">▶</span>
          <span>JEE<span>TUBE</span></span>
        </div>
      </div>

      <form className="jt-search" onSubmit={handleSearch}>
        <Search size={20} />

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search lectures, chapters, topics..."
          aria-label="Search JEE-Tube"
        />

        <button type="submit">Search</button>
      </form>

      <div className="jt-navbar-right">
        <button className="icon-button">
          <Bell size={21} />
        </button>

        <button className="jt-profile">
          <UserRound size={19} />
        </button>
      </div>
    </header>
  );
}