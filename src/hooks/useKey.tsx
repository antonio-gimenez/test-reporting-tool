import { useCallback, useEffect } from "react";

interface KeyProps {
  key: string;
  handler: (event: KeyboardEvent) => void;
}

const useKey = ({ key, handler }: KeyProps) => {
  // A callback is used to prevent the handler from being recreated on every render.
  const keyDownListener = useCallback(
    (event: KeyboardEvent) => {
      // If the key pressed is the same as the key prop, call the handler.
      if (event.key === key) {
        handler(event);
      }
    },
    // The handler is included in the dependency array so that it is recreated if it changes.
    [key, handler]
  );

  useEffect(() => {
    if (typeof handler === "function") {
      // Add the event listener when the component mounts.
      document.addEventListener("keydown", keyDownListener);
    }
    return () => {
      // Remove the event listener when the component unmounts.
      document.removeEventListener("keydown", keyDownListener);
    };
  }, [keyDownListener]);
};

export default useKey;
