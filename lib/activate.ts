import { Unit, Loop, Sequence } from "./timer";
import { SegmentConfig, FragmentState, Timer, TimeIt } from "./types";

export const createTimer = (config: SegmentConfig, timeIt: TimeIt): Timer<FragmentState> => {
    switch (config.type) {
        case 'unit':
            return new Unit(config.name, config.duration, timeIt);
        case 'sequence':
            return new Sequence(config.inners.map(c => createTimer(c, timeIt)));
        case 'loop':
            return new Loop(config.times, createTimer(config.inner, timeIt));
        default:
            const _exhaust: never = config;
            return _exhaust;
    }
}
