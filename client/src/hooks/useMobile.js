import { atom, useAtom } from "jotai";
import { useEffect } from "react";

export const isMobileAtom = atom(
  typeof window !== "undefined" &&
    (window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0)
);

export const useMobile = () => {
  const [isMobile, setIsMobile] = useAtom(isMobileAtom);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => {
      setIsMobile(
        mq.matches || "ontouchstart" in window || navigator.maxTouchPoints > 0
      );
    };
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [setIsMobile]);

  return isMobile;
};
