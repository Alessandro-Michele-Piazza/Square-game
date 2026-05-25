import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useAos from "../hooks/useAos";
import useRouteScrollReset from "../hooks/useRouteScrollReset";

export default function AuthLayout() {
  useAos();
  useRouteScrollReset();

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}
