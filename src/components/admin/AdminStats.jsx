import React from "react";
import {
  Video,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
} from "lucide-react";

const AdminStats = ({
  total = 0,
  classified = 0,
  unclassified = 0,
  subjects = 3,
}) => {
  const stats = [
    {
      label: "Total Videos",
      value: total,
      icon: Video,
    },
    {
      label: "Classified",
      value: classified,
      icon: CheckCircle2,
    },
    {
      label: "Needs Review",
      value: unclassified,
      icon: AlertTriangle,
    },
    {
      label: "Subjects",
      value: subjects,
      icon: BookOpen,
    },
  ];

  return (
    <div className="admin-stats-grid">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div className="admin-stat-card" key={stat.label}>
            <div className="admin-stat-icon">
              <Icon size={21} />
            </div>

            <div>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminStats;