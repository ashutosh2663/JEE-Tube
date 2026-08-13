import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Video,
  AlertCircle,
  Settings,
  GraduationCap,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const AdminSidebar = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();

  const menu = [
    {
      label: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
      end: true,
    },
    {
      label: "All Videos",
      path: "/admin/videos",
      icon: Video,
    },
    {
      label: "Unclassified",
      path: "/admin/videos/unclassified",
      icon: AlertCircle,
    },
  ];

  function logout() {
    localStorage.removeItem("jee_tube_admin");
    navigate("/login");
  }

  return (
    <aside className={`admin-sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="admin-brand">
        <div className="admin-brand-icon">
          <GraduationCap size={22} />
        </div>

        {!collapsed && (
          <div>
            <strong>JEE-Tube</strong>
            <span>ADMIN</span>
          </div>
        )}
      </div>

      <nav className="admin-nav">
        <div className="admin-nav-label">
          {!collapsed && "MANAGEMENT"}
        </div>

        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? "active" : ""}`
              }
              title={collapsed ? item.label : ""}
            >
              <Icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}

        <div className="admin-nav-label">
          {!collapsed && "SYSTEM"}
        </div>

        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `admin-nav-item ${isActive ? "active" : ""}`
          }
          title={collapsed ? "Settings" : ""}
        >
          <Settings size={20} />
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </nav>

      <div className="admin-sidebar-bottom">
        <button
          className="admin-nav-item admin-logout"
          onClick={logout}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>

        <button
          className="admin-collapse"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;