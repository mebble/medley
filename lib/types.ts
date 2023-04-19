export type TimerEvent =
    | { type: 'tick' }
    | { type: 'done' }

export type TimerEventHandler = (event: TimerEvent) => void;

export type TimeIt = (duration: number, onEvent: TimerEventHandler) => {
    stop(): void;
}

export type TimerState = 'off' | 'on';

export interface Timer {
    /**
     * Behaviours:
     * - when .start is called on a running timer, should not call the inner timer(s) start
     * - when a timer is done, it should reset its state to its configuration BEFORE calling the onEvent callback, so that we can immediately .start the timer again if we want to
     */
    readonly duration: number;
    state(): TimerState;
    start(onEvent: TimerEventHandler): void;
    stop(): void;
    pause(): void;
}
