import { webApiCountdown } from "./core"
import { createTimer } from "./activate"
import { MedleyConfig, MedleyHandler } from "./types"

/**
 * @param config - Your timer's configuration
 * @param callback - This callback will be called on every tick of the timer
 */
export const startTimer = (config: MedleyConfig, callback: MedleyHandler): void => {
    const timer = createTimer(config.timer, webApiCountdown);
    timer.start(e => {
        callback({
            ...e,
            state: timer.state()
        })
    });
}
