import { TimeIt } from "./core";
import { LoopState, SequenceState, Timer, TimerEventHandler, TimerStatus, TimerState, UnitState } from "./types";

export class Unit implements Timer<UnitState> {
    public readonly duration: number;
    private readonly id: string;
    private readonly core: TimeIt;
    private status: TimerStatus;
    private remaining: number = 0;

    constructor(id: string, duration: number, core: TimeIt) {
        this.id = id;
        this.duration = duration;
        this.core = core;
        this.status = 'off';
    }

    start(callback: TimerEventHandler) {
        if (this.status === 'on') return;

        this.status = 'on'
        this.core(this.duration, e => {
            if (e.type === 'done') {
                this.status = 'off'
                this.remaining = 0;
                callback({
                    type: 'done',
                    target: { ...e, id: this.id },
                })
            } else {
                this.remaining = e.remaining;
                callback({
                    type: 'tick',
                    target: { ...e, id: this.id },
                })
            }
        })
    }

    state(): UnitState {
        return {
            type: 'unit',
            status: this.status,
            id: this.id,
            remaining: this.remaining,
        };
    }

    pause() {}
    stop() {}
}

export class Sequence implements Timer<SequenceState> {
    public readonly duration: number;
    private readonly innerTimers: Timer<TimerState>[];
    private current: number = 0;
    private status: TimerStatus;

    constructor(innerTimers: Timer<TimerState>[]) {
        this.innerTimers = innerTimers;
        this.duration = this.innerTimers.reduce((totalDuration, t) => totalDuration + t.duration, 0);
        this.status = 'off';
    }

    start(callback: TimerEventHandler): void {
        if (this.status === 'on') return;
        this.current = 0;
        this._start(callback);
    }

    private _start(callback: TimerEventHandler) {
        this.status = 'on'
        const t = this.innerTimers[this.current]
        if (!t) return;                         // base case 1

        t.start(e => {
            if (e.type === 'tick') {
                callback(e)                     // base case 2
            }
            if (e.type === 'done') {
                if (this.current === this.innerTimers.length - 1) {
                    this.status = 'off'         // base case 3
                    callback(e)
                } else {
                    callback({
                        ...e,
                        type: 'tick'
                    })
                    this.current++
                    this._start(callback)
                }
            }
        })
    }

    state(): SequenceState {
        return {
            type: 'sequence',
            status: this.status,
            current: this.current,
            inners: this.innerTimers.map(t => t.state())
        }
    }

    pause() {}
    stop() {}
}

export class Loop implements Timer<LoopState> {
    public readonly duration: number;
    private readonly times: number;
    private readonly innerTimer: Timer<TimerState>;
    private timesRemaining: number;
    private status: TimerStatus;

    constructor(times: number, innerTimer: Timer<TimerState>) {
        this.duration = innerTimer.duration * nonNegative(times);
        this.times = nonNegative(times);
        this.innerTimer = innerTimer
        this.timesRemaining = nonNegative(times);
        this.status = 'off';
    }

    start(callback: TimerEventHandler) {
        if (this.status === 'on') return;
        this.timesRemaining = this.times;
        this._start(callback)
    }

    private _start(callback: TimerEventHandler) {
        this.status = 'on'
        if (this.timesRemaining === 0) return;  // base case 1

        this.timesRemaining--;
        this.innerTimer.start(e => {
            if (e.type === 'tick') {
                callback(e)                     // base case 2
            }
            if (e.type === 'done') {
                if (this.timesRemaining === 0) {
                    this.status = 'off'         // base case 3
                    callback(e)
                } else {
                    callback({
                        ...e,
                        type: 'tick'
                    })
                    this._start(callback)
                }
            }
        })
    }

    private iteration() {
        return this.times - this.timesRemaining
    }

    state(): LoopState {
        return {
            type: 'loop',
            status: this.status,
            iteration: this.iteration(),
            inner: this.innerTimer.state(),
        }
    }

    pause() {}
    stop() {}
}

function nonNegative(x: number) {
    return x >= 0
        ? x
        : 0;
}
