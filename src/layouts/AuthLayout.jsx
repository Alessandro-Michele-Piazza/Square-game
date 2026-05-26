import { Outlet, useLocation } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useAos from "../hooks/useAos";
import useRouteScrollReset from "../hooks/useRouteScrollReset";
import routes from "../router/routes";

export default function AuthLayout() {
  const { pathname } = useLocation();
  const isAuthFormRoute = pathname === routes.login || pathname === routes.register;

  useAos();
  useRouteScrollReset();

  return (
    <>
      <Navbar sticky={!isAuthFormRoute} hideOnMobile={isAuthFormRoute} />
      <Outlet />
      <Footer />
    </>
  );
}
