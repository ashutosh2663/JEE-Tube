import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="jt-app">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="jt-body">
        <Sidebar open={sidebarOpen} />

        <main className={`jt-main ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}