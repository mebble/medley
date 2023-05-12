import { TimeIt } from "./core";
import { Unit, Loop, Sequence } from "./timer";
import { TimerConfig, TimerState, Timer } from "./types";

export const createTimer = (config: TimerConfig, timeIt: TimeIt): Timer<TimerState> => {
    switch (config.type) {
        case 'unit':
            return new Unit(config.name, config.duration, timeIt);
        case 'sequence':
            return new Sequence(config.of.map(c => createTimer(c, timeIt)));
        case 'loop':
            return new Loop(config.times, createTimer(config.of, timeIt));
        default:
            const _exhaust: never = config;
            return _exhaust;
    }
}
