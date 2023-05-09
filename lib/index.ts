import { createTimer } from "./activate"
import { TimeIt } from "./core"
import { TimerConfig, TimerEvent, TimerState } from "./types"

export type MedleyEvent = TimerEvent & {
    state: TimerState
}

export type MedleyConfig = {
    name: string,
    timer: TimerConfig,
}

type MedleyHandler = (e: MedleyEvent) => void

export const startTimer = (config: MedleyConfig, timeIt: TimeIt, callback: MedleyHandler): void => {
    const timer = createTimer(config.timer, timeIt);
    timer.start(e => {
        callback({
            ...e,
            state: timer.state()
        })
    });
}
