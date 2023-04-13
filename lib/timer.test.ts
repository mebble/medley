import { test, expect, beforeEach, describe, vi } from 'vitest';
import { mock, instance, capture } from 'ts-mockito';
import { Unit } from './timer';
import { CoreTimer, TimerEvent } from './types';

describe('Unit', () => {
    let core: CoreTimer;

    beforeEach(() => {
        core = mock<CoreTimer>()
    })

    test('starting timer', () => {
        const unit = new Unit(10, instance(core))
        const callback = vi.fn<[TimerEvent], void>()
        const e: TimerEvent = { type: 'tick' }

        unit.start(callback)

        const [coreCallback] = capture(core.start).first()
        coreCallback(e)
        expect(callback).toHaveBeenCalledWith(e)
    })
});
