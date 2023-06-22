import { useCallback, useEffect } from "react";

interface onClickOutsideProps {
  ref: React.RefObject<HTMLElement>;
  handler: (event: MouseEvent | TouchEvent) => void;
  exclude?: string[];
  threshold?: number;
}

function useOnClickOutside({ ref, handler, exclude = ['alert'], threshold }: onClickOutsideProps) {
  const clickOutsideListener = useCallback(
    // useCallback is used to prevent the handler from being recreated on every render.
    (event: MouseEvent | TouchEvent
    ) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        // If the ref is not set or the ref contains the target, do nothing.
        return;
      }

      // If the target contains the exclude class, do nothing.
      let targetElement = event.target as HTMLElement | null;
      while (targetElement != null) {
        if (exclude.some(className => targetElement?.classList.contains(className))) {
          return;
        }
        targetElement = targetElement.parentElement;
      }

      // Otherwise, call the handler.
      handler(event);
    },
    [ref, handler, exclude]
  );


  useEffect(() => {
    // Add the event listener when the component mounts.
    // Mousedown is used to detect clicks outside the ref.
    // Touchstart is used to detect taps outside the ref.
    document.addEventListener("mousedown", clickOutsideListener);
    document.addEventListener("touchstart", clickOutsideListener);

    return () => {
      // Remove the event listener when the component unmounts.
      document.removeEventListener("mousedown", clickOutsideListener);
      document.removeEventListener("touchstart", clickOutsideListener);
    };
  }, [clickOutsideListener]);
}

export default useOnClickOutside;
