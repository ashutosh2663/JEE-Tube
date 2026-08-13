import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="admin-shell">
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main
        className={`admin-main ${
          collapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;