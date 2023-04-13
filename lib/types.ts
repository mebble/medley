export type TimerEvent =
    | { type: 'tick' }
    | { type: 'done' }
export type TimerEventHandler = (event: TimerEvent) => void;

export interface CoreTimer {
    start(onEvent: TimerEventHandler): void;
    stop(): void;
}

export interface Timer extends CoreTimer {
    readonly duration: number;
    pause(): void;
}
