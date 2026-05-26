import { useEffect, useState } from "react";
import { Outlet, useLoaderData } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import useAos from "../hooks/useAos";
import useRouteScrollReset from "../hooks/useRouteScrollReset";
import "../css/layouts/Layout.css";

export default function Layout() {
  const data = useLoaderData();
  const genres = Array.isArray(data) ? data : [];
  const [drawerOpen, setDrawerOpen] = useState(false);
  useAos();
  useRouteScrollReset();

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  const handleOpenDrawer = () => setDrawerOpen(true);
  const handleCloseDrawer = () => setDrawerOpen(false);

  return (
    <>
      <Navbar onOpenGenres={handleOpenDrawer} />

      <Sidebar genres={genres} isOpen={drawerOpen} onClose={handleCloseDrawer} />

      <section className="layout-shell">
        <div className="layout-content">
          <Outlet />
        </div>
      </section>
      <Footer />
    </>
  );
}
