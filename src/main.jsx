import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import router from "./router";
import "./styles/settings.css";

// Global styles
import "./index.css";
import "./styles/global.css";

// Layout styles
import "./styles/navbar.css";
import "./styles/sidebar.css";

// Component styles
import "./styles/card.css";
import "./styles/home.css";
import "./styles/player.css";

// Admin Panel styles
import "./styles/admin.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);