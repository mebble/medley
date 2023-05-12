import { webApiCountdown } from "./core"
import { createTimer } from "./activate"
import { MedleyConfig, MedleyHandler } from "./types"

export const startTimer = (config: MedleyConfig, callback: MedleyHandler): void => {
    const timer = createTimer(config.timer, webApiCountdown);
    timer.start(e => {
        callback({
            ...e,
            state: timer.state()
        })
    });
}
