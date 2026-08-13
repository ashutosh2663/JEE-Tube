import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Physics from "./pages/Physics";
import Chemistry from "./pages/Chemistry";
import Maths from "./pages/Maths";
import Search from "./pages/Search";
import Player from "./pages/Player";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Admin from "./pages/Admin";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/physics",
        element: <Physics />,
      },
      {
        path: "/chemistry",
        element: <Chemistry />,
      },
      {
        path: "/maths",
        element: <Maths />,
      },
      {
        path: "/search",
        element: <Search />,
      },
      {
        path: "/player/:videoId",
        element: <Player />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/admin",
        element: <Admin />,
      },
    ],
  },
]);

export default router;