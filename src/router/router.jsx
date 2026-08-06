import { createBrowserRouter } from "react-router";
import {
  getAllGenres,
  getAllGamesLoader,
  getAuthHeroImageLoader,
  getSearchedGames,
  getFilteredbyGenreGames,
  getFilteredByDeveloperGames,
  getFilteredByPublisherGames,
  getFilteredByPlatformGames,
  getGameFullDetails,
} from "./loader";
import Layout from "../layouts/Layout";
import AuthLayout from "../layouts/AuthLayout";
import RouterErrorBoundary from "../components/RouterErrorBoundary";
import routes from "./routes";

const loadingFallback = (
  <div className="loading_page">
    <div className="loading_spinner"></div>
  </div>
);

const router = createBrowserRouter([
  {
    path: routes.landing,
    Component: Layout,
    loader: getAllGenres,
    errorElement: <RouterErrorBoundary />,
    children: [
      {
        index: true,
        lazy: () => import("../views/LandingPage").then((m) => ({ Component: m.default })),
      },
      {
        path: routes.home,
        loader: getAllGamesLoader,
        lazy: () => import("../views/Homepage").then((m) => ({ Component: m.default })),
        hydrateFallbackElement: loadingFallback,
      },
      {
        path: routes.search,
        loader: getSearchedGames,
        lazy: () => import("../views/Searchpage").then((m) => ({ Component: m.default })),
        hydrateFallbackElement: loadingFallback,
      },
      {
        path: routes.genre,
        loader: getFilteredbyGenreGames,
        lazy: () => import("../views/Searchpage").then((m) => ({ Component: m.default })),
        hydrateFallbackElement: loadingFallback,
      },
      {
        path: routes.developer,
        loader: getFilteredByDeveloperGames,
        lazy: () => import("../views/Searchpage").then((m) => ({ Component: m.default })),
        hydrateFallbackElement: loadingFallback,
      },
      {
        path: routes.publisher,
        loader: getFilteredByPublisherGames,
        lazy: () => import("../views/Searchpage").then((m) => ({ Component: m.default })),
        hydrateFallbackElement: loadingFallback,
      },
      {
        path: routes.platform,
        loader: getFilteredByPlatformGames,
        lazy: () => import("../views/Searchpage").then((m) => ({ Component: m.default })),
        hydrateFallbackElement: loadingFallback,
      },
    ],
  },
  {
    path: "/auth",
    Component: AuthLayout,
    errorElement: <RouterErrorBoundary />,
    children: [
      {
        path: routes.login,
        loader: getAuthHeroImageLoader,
        lazy: () => import("../views/Login").then((m) => ({ Component: m.default })),
      },
      {
        path: routes.register,
        loader: getAuthHeroImageLoader,
        lazy: () => import("../views/Register").then((m) => ({ Component: m.default })),
      },
      {
        path: routes.profile,
        lazy: () => import("../views/ProfilePage").then((m) => ({ Component: m.default })),
      },
      {
        path: routes.profile_settings,
        lazy: () => import("../views/ProfileSettingsPage").then((m) => ({ Component: m.default })),
      },
    ],
  },
  {
    path: routes.detail,
    loader: getGameFullDetails,
    errorElement: <RouterErrorBoundary />,
    lazy: () => import("../views/DetailPage").then((m) => ({ Component: m.default })),
    hydrateFallbackElement: loadingFallback,
  },
]);

export default router;
