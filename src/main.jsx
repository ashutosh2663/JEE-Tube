import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./styles/navbar.css";
import "./styles/card.css";
import "./styles/sidebar.css";

import router from "./router";

import "./index.css";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);