import React, { useState, useEffect } from "react";
import { ReactComponent as ChevronDownIcon } from "../assets/icons/chevron-down-16.svg";

interface CollapseProps {
  children: React.ReactNode;
  title: React.ReactNode | string;
  open?: boolean;
  className?: string;
  hideChevron?: boolean;
  locked?: boolean;
}

function Collapse({ children, title, open = false, className, hideChevron = false, locked = false, ...props }: CollapseProps) {
  const [isOpen, setOpen] = useState(open);
  // Adding a key to the details element forces it to re-render when the open prop changes
  const key = isOpen ? "open" : "closed";

  useEffect(() => {
    setOpen(open);
    return () => {
      setOpen(open);
    }
  }, [open]);

  const toggleOpen = () => {
    if (!locked) {
      setOpen(!isOpen);
    }
  };

  return (
    <details key={key} open={isOpen} className={`collapse ${className} ${hideChevron ? "details-reset" : ""}`} {...props}>
      <summary
        aria-disabled={locked}
        className="collapse-title"
        onClick={locked ? () =>{} : toggleOpen}
      >
        {!hideChevron ? <ChevronDownIcon className={`collapse-icon icon transition ${isOpen ? "rotate-180" : "-rotate-90"}`} /> : null}
        {title}
      </summary>
      {children}
    </details>
  );
}



export default Collapse;
