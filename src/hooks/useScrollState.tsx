import React, { useState, useEffect } from "react";

type Axis = "x" | "y";

type UseScrollStateOptions = {
  initialState: boolean;
  offset?: number | null;
  axis?: Axis;
  onScrollChange?: (isScrolled: boolean) => void;
};

type ScrollStateTuple = [boolean];

function useScrollState({
  initialState,
  offset = 50,
  axis = "y",
  onScrollChange,
}: UseScrollStateOptions): ScrollStateTuple {
  const [isScrolled, setIsScrolled] = useState(initialState);

  useEffect(() => {
    function handleScroll() {
      const scrollOffset = axis === "y" ? window.scrollY : window.scrollX;
      if (offset === null || offset === undefined || offset < 0) {
        setIsScrolled(true);
        return;
        }

      if (scrollOffset > offset) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [axis, offset]);

  useEffect(() => {
    if (onScrollChange) {
      onScrollChange(isScrolled);
    }
  }, [isScrolled, onScrollChange]);

  return [isScrolled];
}

export default useScrollState;
