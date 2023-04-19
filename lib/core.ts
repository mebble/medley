import { TimeIt, TimerEventHandler } from "./types";

export const webApiCountdown: TimeIt = (duration: number, onEvent: TimerEventHandler) => {
    /**
     * https://gist.github.com/jakearchibald/cb03f15670817001b1157e62a076fe95
     */

    const ms = 1000;
    const start = performance.now();
    let timeoutId: ReturnType<typeof setInterval> | undefined;
    let elapsed = 0;

    function frame() {
        elapsed++;
        if (elapsed < duration) {
            onEvent({ type: 'tick' });
            scheduleFrame(performance.now());
        } else {
            clearTimeout(timeoutId)
            onEvent({ type: 'done' });
        }
    }

    function scheduleFrame(now: number) {
        const elapsed = now - start;
        const elapsedRounded = Math.round(elapsed / ms) * ms;
        const targetNext = start + elapsedRounded + ms;
        const delay = targetNext - now;
        timeoutId = setTimeout(() => frame(), delay);
    }

    scheduleFrame(start);

    return {
        stop() {
            clearTimeout(timeoutId);
        }
    }
}
