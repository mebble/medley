export type UnitConfig     = { type: 'unit',     name: string, duration: number, tags?: string[] }
export type SequenceConfig = { type: 'sequence', tags?: string[], of: TimerConfig[] }
export type LoopConfig     = { type: 'loop',     times: number, tags?: string[], of: TimerConfig }
export type TimerConfig  = UnitConfig | SequenceConfig | LoopConfig

export type TimerStatus = 'off' | 'on';

export type UnitState     = { type: 'unit',     status: TimerStatus, id: string, remaining: number }
export type SequenceState = { type: 'sequence', status: TimerStatus, current: number, of: TimerState[] }
export type LoopState     = { type: 'loop',     status: TimerStatus, iteration: number, of: TimerState }
export type TimerState = UnitState | SequenceState | LoopState

export type TargetUnit =
    | { type: 'tick', id: string, remaining: number }
    | { type: 'done', id: string }

export type TimerEvent = {
    type: 'tick' | 'done',
    target: TargetUnit
}

export type TimerEventHandler = (event: TimerEvent) => void;

export interface Timer<T extends TimerState> {
    /**
     * Behaviours:
     * - when .start is called on a running timer, should not call the inner timer(s) start
     * - when a timer is done, it should reset its state to its configuration BEFORE calling the onEvent callback, so that we can immediately .start the timer again if we want to
     */
    readonly duration: number;
    state(): T;
    start(onEvent: TimerEventHandler): void;
    stop(): void;
    pause(): void;
}

export type MedleyEvent = TimerEvent & {
    state: TimerState
}

export type MedleyConfig = {
    name: string,
    timer: TimerConfig,
}

export type MedleyHandler = (e: MedleyEvent) => void
