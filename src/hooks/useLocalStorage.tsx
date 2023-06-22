import { useCallback, useEffect, useState } from "react";

interface localStorageProps {
  key: string;
  initialValue?: any;
}

function useLocalStorage({ key, initialValue }: localStorageProps): [any, (value: any) => void, () => void, () => boolean] {

  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === "undefined") {
      // If window is undefined, we're on the server and localStorage is not available.
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      // If the item is not in localStorage, return the initialValue.
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // A callback is used to prevent the handler from being recreated on every render.
  const storageEventListener = useCallback(() => {
    const item = window.localStorage.getItem(key);
    setStoredValue(item ? JSON.parse(item) : initialValue);
  }, [key, initialValue]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Add the event listener `storage` for update the state when the value is changed
    window.addEventListener("storage", storageEventListener);

    return () => {
      // Remove the event listener when the component unmounts.
      window.removeEventListener("storage", storageEventListener);
    };
  }, [storageEventListener]);

  const setValue = useCallback((value: any) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Prevent the value from being stored if it is the same as the current value.
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        // If window is undefined, we're on the server and localStorage is not available.
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        window.dispatchEvent(new Event("storage"));
        // Dispatch the event to update the state.
      }
    } catch (error) {
      console.error(error);
    }
    // The handler is included in the dependency array so that it is recreated if it changes.
  }, [storedValue]);


  const itemExistsInLocalStorage = useCallback(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem(key) ? true : false;
      // returns true if the item exists in localStorage, false otherwise.
    }
    return false
  }, [key]);

  const removeItemFromLocalStorage = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(key);
        // Remove the item from localStorage.
        window.dispatchEvent(new Event("storage"));
        // Dispatch the event to update the state.
      }
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  return [storedValue, setValue, removeItemFromLocalStorage, itemExistsInLocalStorage];
  // Return the stored value, a function to update it, a function to remove it, and a boolean indicating whether the value exists in localStorage.
}

export default useLocalStorage;
