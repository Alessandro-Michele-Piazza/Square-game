import { useEffect, useState } from "react";
import { Outlet, useLoaderData } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import useAos from "../hooks/useAos";

export default function Layout() {
  const data = useLoaderData();
  const genres = Array.isArray(data) ? data : [];
  const [drawerOpen, setDrawerOpen] = useState(false);
  useAos();

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

      <section className="mx-auto flex w-full max-w-[1500px] gap-0 px-3 sm:px-5">
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </section>
      <Footer />
    </>
  );
}
