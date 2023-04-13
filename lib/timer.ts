import { CoreTimer, Timer, TimerEventHandler } from "./types";

export class Unit implements Timer {
    public readonly duration: number;
    private readonly core: CoreTimer;

    constructor(duration: number, core: CoreTimer) {
        this.duration = duration;
        this.core = core;
    }

    start(callback: TimerEventHandler) {
        this.core.start(e => {
            callback(e)
        })
    }

    pause() {}
    stop() {}
}

