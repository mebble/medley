import { CoreTimer, Timer, TimerEventHandler, TimerState } from "./types";

export class Unit implements Timer {
    public readonly duration: number;
    private readonly core: CoreTimer;
    private _state: TimerState;

    constructor(duration: number, core: CoreTimer) {
        this.duration = duration;
        this.core = core;
        this._state = 'off';
    }

    start(callback: TimerEventHandler) {
        if (this._state === 'on') return;

        this._state = 'on'
        this.core.start(e => {
            if (e.type === 'done') {
                this._state = 'off'
            }
            callback(e)
        })
    }

    state() {
        return this._state;
    }

    pause() {}
    stop() {}
}

export class Sequence implements Timer {
    public readonly duration: number;
    private readonly innerTimers: Timer[];
    private current: number = 0;
    private _state: TimerState;

    constructor(innerTimers: Timer[]) {
        this.innerTimers = innerTimers;
        this.duration = this.innerTimers.reduce((totalDuration, t) => totalDuration + t.duration, 0);
        this._state = 'off';
    }

    start(callback: TimerEventHandler): void {
        if (this._state === 'on') return;
        this._start(callback);
    }

    private _start(callback: TimerEventHandler) {
        this._state = 'on'
        const t = this.innerTimers[this.current]
        if (!t) return;                         // base case 1

        t.start(e => {
            if (e.type === 'tick') callback(e)  // base case 2
            if (e.type === 'done') {
                if (this.current === this.innerTimers.length - 1) {
                    this._state = 'off'
                    callback(e)                 // base case 3
                } else {
                    callback({ type: 'tick' })
                    this.current++
                    this._start(callback)
                }
            }
        })
    }

    state() {
        return this._state;
    }

    pause() {}
    stop() {}
}

export class Loop implements Timer {
    public readonly duration: number;
    private readonly innerTimer: Timer;
    private timesRemaining: number;
    private _state: TimerState;

    constructor(times: number, innerTimer: Timer) {
        this.duration = innerTimer.duration * nonNegative(times);
        this.innerTimer = innerTimer
        this.timesRemaining = nonNegative(times);
        this._state = 'off';
    }

    start(callback: TimerEventHandler) {
        if (this._state === 'on') return;
        this._start(callback)
    }

    private _start(callback: TimerEventHandler) {
        this._state = 'on'
        if (this.timesRemaining === 0) return;  // base case 1

        this.timesRemaining--;
        this.innerTimer.start(e => {
            if (e.type === 'tick') callback(e)  // base case 2
            if (e.type === 'done') {
                if (this.timesRemaining === 0) {
                    this._state = 'off'
                    callback(e)                 // base case 3
                } else {
                    callback({ type: 'tick' })
                    this._start(callback)
                }
            }
        })
    }

    state() {
        return this._state;
    }

    pause() {}
    stop() {}
}

function nonNegative(x: number) {
    return x >= 0
        ? x
        : 0;
}
