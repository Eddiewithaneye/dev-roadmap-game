"use client";

import { useEffect, useState } from "react";

import type { InputMode } from "./types";

export function useInputMode(): InputMode {
  const [inputMode, setInputMode] = useState<InputMode>("desktop");

  useEffect(() => {
    const coarsePointerQuery = window.matchMedia("(pointer: coarse)");
    const updateInputMode = () => {
      const isTouchCapable =
        coarsePointerQuery.matches || navigator.maxTouchPoints > 0;

      if (!isTouchCapable) {
        setInputMode("desktop");
        return;
      }

      setInputMode(
        window.innerWidth >= window.innerHeight
          ? "touch-landscape"
          : "touch-portrait",
      );
    };

    updateInputMode();
    window.addEventListener("resize", updateInputMode);
    window.addEventListener("orientationchange", updateInputMode);
    coarsePointerQuery.addEventListener("change", updateInputMode);

    return () => {
      window.removeEventListener("resize", updateInputMode);
      window.removeEventListener("orientationchange", updateInputMode);
      coarsePointerQuery.removeEventListener("change", updateInputMode);
    };
  }, []);

  return inputMode;
}
