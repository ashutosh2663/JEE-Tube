import { Play, Clock } from "lucide-react";

export default function Card({
  title,
  teacher,
  duration,
  color,
}) {
  return (
    <div className="lecture-card">

      <div
        className="card-banner"
        style={{ background: color }}
      >
        <Play size={40} />
      </div>

      <div className="card-content">

        <h3>{title}</h3>

        <p>{teacher}</p>

        <span>
          <Clock size={15} />
          {duration}
        </span>

      </div>

    </div>
  );
}