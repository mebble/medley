import { TimeIt, TimerEventHandler } from "./types";

export const webApiCountdown: TimeIt = (duration: number, onEvent: TimerEventHandler) => {
    let timeoutId: ReturnType<typeof setInterval> | undefined;
    let elapsed = 0;

    timeoutId = setInterval(() => {
        elapsed++;
        if (elapsed < duration) {
            onEvent({ type: 'tick' })
        } else {
            clearTimeout(timeoutId)
            onEvent({ type: 'done' })
        }
    }, 1000)

    return {
        stop() {
            clearInterval(timeoutId);
        }
    }
}
