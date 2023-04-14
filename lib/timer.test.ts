import { test, expect, beforeEach, describe, vi } from 'vitest';
import { mock, instance, capture, when } from 'ts-mockito';

import { CoreTimer, Timer, TimerEvent } from './types';
import { Sequence, Unit } from './timer';

describe('Unit', () => {
    let inner: CoreTimer;

    beforeEach(() => {
        inner = mock<CoreTimer>()
    })

    test('calling inner timer', () => {
        const unit = new Unit(10, instance(inner))
        const callback = vi.fn<[TimerEvent], void>()
        const e: TimerEvent = { type: 'tick' }

        unit.start(callback)

        const [coreCallback] = capture(inner.start).first()
        coreCallback(e)
        expect(callback).toHaveBeenCalledWith(e)
    })
});

describe('Sequence', () => {
    let inner1: Timer;
    let inner2: Timer;

    beforeEach(() => {
        inner1 = mock<Timer>();
        inner2 = mock<Timer>();
    })

    test('duration is sum of inner durations', () => {
        when(inner1.duration).thenReturn(10)
        when(inner2.duration).thenReturn(20)

        const seq = new Sequence([
            instance(inner1),
            instance(inner2)
        ]);
        expect(seq.duration).eq(30)
    })

    test('calling inner timers', () => {
        const seq = new Sequence([
            instance(inner1),
            instance(inner2)
        ]);
        const callback = vi.fn<[TimerEvent], void>();

        seq.start(callback);

        const [inner1Callback] = capture(inner1.start).first()
        inner1Callback({ type: 'tick' })
        expect(callback).toHaveBeenNthCalledWith(1, { type: 'tick' })
        inner1Callback({ type: 'done' })
        expect(callback).toHaveBeenNthCalledWith(2, { type: 'tick' })

        const [inner2Callback] = capture(inner2.start).first()
        inner2Callback({ type: 'tick' })
        expect(callback).toHaveBeenNthCalledWith(3, { type: 'tick' })
        inner2Callback({ type: 'done' })
        expect(callback).toHaveBeenNthCalledWith(4, { type: 'done' })
    })
})
