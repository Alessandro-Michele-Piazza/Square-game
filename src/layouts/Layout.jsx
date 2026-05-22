import { useEffect, useState } from "react";
import { Outlet, useLoaderData } from "react-router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import { FaBars } from "react-icons/fa6";
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
      <Navbar />

      <div className="sticky top-[var(--auth-header-height)] z-40 px-3 pt-2 sm:px-5" data-aos="fade-down">
        <div className="mx-auto flex w-full max-w-[1500px] items-center">
          <button
            onClick={handleOpenDrawer}
            aria-label="Apri menu generi"
            className=" inline-flex items-center gap-2 rounded-full border border-[#7dd3fc]/30 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#7dd3fc] transition hover:border-[#fef08a]/40 hover:text-[#fef08a]"
          >
            <FaBars className="text-sm" />
            Generi
          </button>
        </div>
      </div>

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
