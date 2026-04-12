import { createBrowserRouter } from "react-router";
import { getAllGenres, getAllGamesLoader, getSearchedGames,getFilteredbyGenreGames } from "./loader";
import Layout from "../layouts/Layout";
import AuthLayout from "../layouts/AuthLayout";
import Homepage from "../views/Homepage";

import Login from "../views/Login";
import Register from "../views/Register";
import ProfilePage from "../views/ProfilePage";
import routes from "./routes";
import Searchpage from "../views/Searchpage";
import ProfileSettingsPage from "../views/ProfileSettingsPage";

const router = createBrowserRouter([
  {
    path: routes.home,
    Component: Layout,
    loader: getAllGenres,
    children: [
      {
        path: routes.home,
        Component: Homepage,
        loader: getAllGamesLoader,
        hydrateFallbackElement: (
          <div className=" loading_page">
            <div className="loading_spinner"></div>
          </div>
        ),
      },
      {
        path: routes.search,
        Component: Searchpage,
        loader: getSearchedGames,
        hydrateFallbackElement: (
          <div className=" loading_page ">
            <div className="loading_spinner"></div>
          </div>
        ),
      },
      {
        path: routes.genre,
        Component: Searchpage,
        loader: getFilteredbyGenreGames,
        hydrateFallbackElement: (
          <div className=" loading_page ">
            <div className="loading_spinner"></div>
          </div>
        ),
      },
    ],
  },
  {
    path: '/auth',
    Component : AuthLayout,
      children:[
        {
          path: routes.login,
          Component: Login,
        },
        {
          path: routes.register,
          Component: Register,
        },
        {
          path: routes.profile,
          Component: ProfilePage,
        },
          {
            path: routes.profile_settings,
            Component: ProfileSettingsPage,
          }
        
      ]
  }
]);

export default router;
