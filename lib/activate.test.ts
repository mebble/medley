import { describe, test, expect, beforeEach, Mock, vi } from 'vitest';
import { TimerConfig } from './types';
import { createTimer } from './activate';
import { Sequence, Unit, Loop } from './timer';
import { TimeIt } from './core';

describe('createTimer', () => {
    let coreTimer: Mock<TimeIt>;

    beforeEach(() => {
        coreTimer = vi.fn()
    })

    test('creates the appropriate Timers from a config', () => {
        const config: TimerConfig = {
            type: 'sequence',
            tags: [],
            of: [
                { type: 'unit', name: 'first', duration: 5, tags: [] },
                {
                    type: 'loop',
                    times: 2,
                    tags: [],
                    of: { type: 'unit', name: 'second', duration: 3, tags: [] }
                }
            ]
        }

        const timer = createTimer(config, coreTimer)

        expect(timer).toEqual(new Sequence([
            new Unit('first', 5, coreTimer),
            new Loop(
                2,
                new Unit('second', 3, coreTimer)
            )
        ]))
    })
})
