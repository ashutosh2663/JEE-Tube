import { createBrowserRouter } from "react-router-dom";

import Home from "./pages/Home";
import Physics from "./pages/Physics";
import Chemistry from "./pages/Chemistry";
import Maths from "./pages/Maths";
import Search from "./pages/Search";
import Player from "./pages/Player";
import Dashboard from "./pages/Dashboard";

const router = createBrowserRouter([
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
    path: "/player",
    element: <Player />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
]);

export default router;