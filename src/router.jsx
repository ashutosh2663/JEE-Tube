import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Physics from "./pages/Physics";
import Chemistry from "./pages/Chemistry";
import Maths from "./pages/Maths";
import Search from "./pages/Search";
import Player from "./pages/Player";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

const router = createBrowserRouter([
  // Public route
  {
    path: "/login",
    element: <Login />,
  },

  // Everything inside here requires authentication
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
    ],
  },
]);

export default router;