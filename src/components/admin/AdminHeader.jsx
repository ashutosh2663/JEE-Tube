import React from "react";
import { Bell, Search, ShieldCheck } from "lucide-react";

const AdminHeader = ({ title, subtitle }) => {
  return (
    <header className="admin-header">
      <div>
        <h1>{title}</h1>

        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="admin-header-actions">
        <div className="admin-search-mini">
          <Search size={17} />
          <input placeholder="Quick search..." />
        </div>

        <button className="admin-icon-button">
          <Bell size={19} />
        </button>

        <div className="admin-profile">
          <div className="admin-avatar">
            A
          </div>

          <div className="admin-profile-info">
            <strong>Administrator</strong>
            <span>
              <ShieldCheck size={12} />
              Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
