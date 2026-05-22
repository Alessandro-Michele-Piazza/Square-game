import { useEffect } from "react";
import { useLocation } from "react-router";
import AOS from "aos";

const AOS_OPTIONS = {
  duration: 650,
  easing: "ease-out-cubic",
  once: true,
  offset: 48,
};

export default function useAos() {
  const { pathname } = useLocation();

  useEffect(() => {
    AOS.init(AOS_OPTIONS);
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
