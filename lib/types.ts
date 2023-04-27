type CoreTimerEvent =
    | { type: 'tick', remaining: number }
    | { type: 'done' }

export type CoreTimerEventHandler = (event: CoreTimerEvent) => void;

export type TimeIt = (duration: number, onEvent: CoreTimerEventHandler) => {
    stop(): void;
}

export type TimerStatus = 'off' | 'on';

export type UnitState     = { type: 'unit',     status: TimerStatus, id: string, remaining: number }
export type SequenceState = { type: 'sequence', status: TimerStatus, current: number, inners: FragmentState[] }
export type LoopState     = { type: 'loop',     status: TimerStatus, iteration: number, inner: FragmentState }
export type FragmentState = UnitState | SequenceState | LoopState

type UnitEvent =
    | { type: 'tick', id: string, remaining: number }
    | { type: 'done', id: string }

type TimerEvent = {
    type: 'tick' | 'done',
    target: UnitEvent
}

export type TimerEventHandler = (event: TimerEvent) => void;

export interface Timer<TState extends FragmentState> {
    /**
     * Behaviours:
     * - when .start is called on a running timer, should not call the inner timer(s) start
     * - when a timer is done, it should reset its state to its configuration BEFORE calling the onEvent callback, so that we can immediately .start the timer again if we want to
     */
    readonly duration: number;
    state(): TState;
    start(onEvent: TimerEventHandler): void;
    stop(): void;
    pause(): void;
}
