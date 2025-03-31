import { useCallback, useEffect, useRef } from "react";

export default function useDebounceCallbackGreedy<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
) {
    const timeoutRef = useRef<number>(null);
    const isCooldownRef = useRef(false);

    const debouncedFunc = useCallback(
        (...args: Parameters<T>) => {
            if (!isCooldownRef.current) {
                func(...args);
                isCooldownRef.current = true;
                timeoutRef.current = window.setTimeout(() => {
                    isCooldownRef.current = false;
                }, delay);
            }
        },
        [func, delay],
    );

    useEffect(() => {
        return () => {
            if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        };
    }, []);

    return debouncedFunc;
}
