import { useCallback } from "react";

 function useNetworkState() {
    const connection =
        (navigator as any)?.connection ||
        (navigator as any)?.mozConnection ||
        (navigator as any)?.webkitConnection;

    const subscribe = useCallback((callback: any) => {
        const handleOnline = () => callback(true);
        const handleOffline = () => callback(false);

        window.addEventListener("online", handleOnline, { passive: true });
        window.addEventListener("offline", handleOffline, { passive: true });

        if (connection) {
            connection.addEventListener("change", callback, { passive: true });
        }

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);

            if (connection) {
                connection.removeEventListener("change", callback);
            }
        };
    }, [connection]);

    return { subscribe };
}

export default useNetworkState