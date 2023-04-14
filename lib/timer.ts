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

export class Sequence implements Timer {
    public readonly duration: number;
    private readonly innerTimers: Timer[];
    private current: number = 0;

    constructor(innerTimers: Timer[]) {
        this.innerTimers = innerTimers;
        this.duration = this.innerTimers.reduce((totalDuration, t) => totalDuration + t.duration, 0);
    }

    start(callback: TimerEventHandler): void {
        const t = this.innerTimers[this.current]
        t.start(e => {
            if (e.type === 'tick') callback(e)  // base case 1
            if (e.type === 'done') {
                if (this.current === this.innerTimers.length - 1) {
                    callback(e)                 // base case 2
                } else {
                    callback({ type: 'tick' })
                    this.current++
                    this.start(callback)
                }
            }
        })
    }

    pause() {}
    stop() {}
}

