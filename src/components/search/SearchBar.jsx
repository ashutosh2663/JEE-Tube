import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  const submit = (e) => {
    e.preventDefault();

    if (!query.trim()) return;

    onSearch(query);
  };

  return (
    <form
      onSubmit={submit}
      style={{
        display: "flex",
        gap: "15px",
        marginBottom: "35px",
      }}
    >
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search JEE Topic..."
        style={{
          flex: 1,
          padding: "16px",
          borderRadius: "12px",
          border: "none",
          fontSize: "18px",
        }}
      />

      <button
        style={{
          background: "#E50914",
          color: "white",
          border: "none",
          padding: "16px 28px",
          borderRadius: "12px",
          cursor: "pointer",
        }}
      >
        Search
      </button>
    </form>
  );
}