import React from "react";

export const useCountdown = (
    initialTimeInSeconds: number,
    refreshEveryXMilliseconds: number = 1000,
    onEnd: () => void = () => {}
) => {

    const [value, setValue] = React.useState(initialTimeInSeconds);
    const running = React.useRef(false);
    const interval = React.useRef<NodeJS.Timeout | null>(null);

    const value_when_paused = React.useRef<number | null>(null);

    const start = () => {
        running.current = true;
        interval.current = setInterval(() => {
            setValue((prev) => {
                if (prev <= 0) {
                    clearInterval(interval.current!);
                    running.current = false;
                    onEnd();
                    return 0;
                }
                return prev - 1;
            });
        }, refreshEveryXMilliseconds);
    };

    const pause = () => {
        if (interval.current) {
            clearInterval(interval.current);
            interval.current = null;
            running.current = false;
        }
    };

    const reset = () => {
        if (interval.current) {
            clearInterval(interval.current);
            interval.current = null;
        }
        running.current = false;
        setValue(initialTimeInSeconds);
    };

    const isRunning = () => running.current;

    return {
        value,
        start,
        pause,
        reset,
        isRunning
    } as const;

}
