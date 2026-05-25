import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router";

export default function useRouteScrollReset() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP" || hash) {
      return;
    }

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [pathname, hash, navigationType]);
}