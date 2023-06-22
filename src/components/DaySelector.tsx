import { useEffect } from "react";

import { ReactComponent as ChevronLeftIcon } from "../assets/icons/chevron-left-16.svg";
import { ReactComponent as ChevronRightIcon } from "../assets/icons/chevron-right-16.svg";
import useKey from "../hooks/useKey";

interface DaySelectorProps {
  currentDate: Date;
  setDate: (date: Date) => void;
}

const DaySelector: React.FC<DaySelectorProps> = ({ currentDate, setDate }) => {
  const today = new Date().toISOString().split("T")[0];

  const previousOrNextDate = (direction: "previous" | "next"): void => {
    const date = new Date(currentDate);
    if (direction === "previous") {
      date.setDate(date.getDate() - 1);
    } else {
      if (currentDate.toISOString().split("T")[0] === today) return
      date.setDate(date.getDate() + 1);
    }
    setDate(date);
  };

  useKey({ key: "ArrowLeft", handler: () => previousOrNextDate("previous") });
  useKey({ key: "ArrowRight", handler: () => previousOrNextDate("next") });

  return (
    <div className="container-row container-items-center container-justify-between gap-small">
      <button
        id="previous-date-icon"
        onClick={() => previousOrNextDate("previous")}
        className="btn btn-secondary"
      >
        <ChevronLeftIcon />
      </button>
      <div role={"button"} className="container-row gap-medium">
        <span>{currentDate.toLocaleDateString("en-US", { weekday: "long" })},</span>
        <span>{currentDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
      </div>
      <button
        id="next-date-icon"
        onClick={() => previousOrNextDate("next")}
        disabled={currentDate.toISOString().split("T")[0] === today}
        className="btn btn-secondary"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
};

export default DaySelector;
