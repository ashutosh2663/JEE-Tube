import { NavLink } from "react-router-dom";
import {
  House,
  Atom,
  FlaskConical,
  Calculator,
  Search,
  Bookmark,
  BarChart3,
  Settings,
} from "lucide-react";

const menu = [
  { name: "Home", icon: House, path: "/" },
  { name: "Physics", icon: Atom, path: "/physics" },
  { name: "Chemistry", icon: FlaskConical, path: "/chemistry" },
  { name: "Maths", icon: Calculator, path: "/maths" },
  { name: "Search", icon: Search, path: "/search" },
  { name: "Bookmarks", icon: Bookmark, path: "/bookmarks" },
  { name: "Dashboard", icon: BarChart3, path: "/dashboard" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <span>JEE</span>Tube
      </div>

      <div className="menu">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className="menu-item"
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
}