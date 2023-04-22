import { TimeIt, Timer, TimerEventHandler, TimerState } from "./types";

export class Unit implements Timer {
    public readonly duration: number;
    private readonly id: string;
    private readonly core: TimeIt;
    private _state: TimerState;

    constructor(id: string, duration: number, core: TimeIt) {
        this.id = id;
        this.duration = duration;
        this.core = core;
        this._state = 'off';
    }

    start(callback: TimerEventHandler) {
        if (this._state === 'on') return;

        this._state = 'on'
        this.core(this.duration, e => {
            if (e.type === 'done') {
                this._state = 'off'
                callback({ ...e, id: this.id })
            } else {
                callback({ type: 'tick', target: { ...e, id: this.id } })
            }
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
        this.current = 0;
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
                    callback({ type: 'tick', target: e })
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
    private readonly times: number;
    private readonly innerTimer: Timer;
    private timesRemaining: number;
    private _state: TimerState;

    constructor(times: number, innerTimer: Timer) {
        this.duration = innerTimer.duration * nonNegative(times);
        this.times = nonNegative(times);
        this.innerTimer = innerTimer
        this.timesRemaining = nonNegative(times);
        this._state = 'off';
    }

    start(callback: TimerEventHandler) {
        if (this._state === 'on') return;
        this.timesRemaining = this.times;
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
                    callback({ type: 'tick', target: e })
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
