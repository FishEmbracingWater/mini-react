import { useReducer, useRef, useEffect } from "react";
import { Tracker } from "../../demo/watch-formily";

export function useObserver(view) {
    const [, forceUpdate] = useReducer((x) => x + 1, 1);
    const trackRef = useRef(null);
    if (!trackRef.current) {
        trackRef.current = new Tracker(() => forceUpdate());
    }

    useEffect(() => {
        return () => {
            trackRef.current.dispose();
            trackRef.current = null;
        };
    }, []);
    return trackRef.current.track(view);
}
