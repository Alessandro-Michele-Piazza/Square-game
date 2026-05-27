import { useEffect } from "react";
import { useLocation } from "react-router";
import AOS from "aos";

let hasAosInitialized = false;

const AOS_OPTIONS = {
  duration: 650,
  easing: "ease-out-cubic",
  once: true,
  mirror: false,
  offset: 48,
};

export default function useAos() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!hasAosInitialized) {
      AOS.init(AOS_OPTIONS);
      hasAosInitialized = true;
      return;
    }

    AOS.refreshHard();
  }, []);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      AOS.refreshHard();
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [pathname]);
}
