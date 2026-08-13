import React from "react";
import AdminHeader from "../../components/admin/AdminHeader";

const AdminSettings = () => {
  return (
    <>
      <AdminHeader
        title="Settings"
        subtitle="Configure your JEE-Tube administration."
      />

      <div className="admin-content">
        <div className="settings-card">
          <h2>Admin settings</h2>

          <p>
            Backend authentication and database permissions
            can be connected here.
          </p>

          <div className="setting-row">
            <div>
              <strong>Manual classification</strong>
              <span>
                Admins can manually organize videos.
              </span>
            </div>

            <div className="setting-status">
              Enabled
            </div>
          </div>

          <div className="setting-row">
            <div>
              <strong>AI classification</strong>
              <span>
                Use AI as an assistant, not the final authority.
              </span>
            </div>

            <div className="setting-status">
              Ready
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSettings;