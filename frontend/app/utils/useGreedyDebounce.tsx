import { useCallback, useEffect, useRef } from "react";

export default function useDebounceCallbackGreedy<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
) {
    const timeoutRef = useRef<number>(null);
    const isOnCooldownRef = useRef(false);
    const lastArgsRef = useRef<Parameters<T>>(null);

    const debouncedFunc = useCallback(
        (...args: Parameters<T>) => {
            if (!isOnCooldownRef.current) {
                func(...args);
                isOnCooldownRef.current = true;
                timeoutRef.current = window.setTimeout(() => {
                    isOnCooldownRef.current = false;

                    if (lastArgsRef.current) {
                        const args = lastArgsRef.current;
                        lastArgsRef.current = null;
                        func(...args);
                    }
                }, delay);
            } else {
                lastArgsRef.current = args;
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
