import { test, expect, beforeEach, describe, vi } from 'vitest';
import { mock, instance, capture, when, verify, anything } from 'ts-mockito';

import { CoreTimer, Timer, TimerEvent } from './types';
import { Loop, Sequence, Unit } from './timer';

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

        const [innerCallback] = capture(inner.start).first()
        innerCallback(e)
        expect(callback).toHaveBeenCalledWith(e)
    })

    test('do nothing if already on', () => {
        const unit = new Unit(10, instance(inner))
        const callback = vi.fn<[TimerEvent], void>()

        unit.start(callback)
        verify(inner.start(anything())).once()

        unit.start(callback)
        verify(inner.start(anything())).once()
    })

    test('timer state on every callback call', () => {
        const unit = new Unit(10, instance(inner));
        const callback = vi.fn((e: TimerEvent) => {
            if (e.type === 'done') {
                expect(unit.state()).toEqual('off')
            } else if (e.type === 'tick') {
                expect(unit.state()).toEqual('on')
            }
        });

        unit.start(callback);

        const [innerCallback] = capture(inner.start).first()
        innerCallback({ type: 'tick' })
        innerCallback({ type: 'done' })

        expect.assertions(2)
    })

    test('should be able to restart a timer that was done', () => {
        const unit = new Unit(10, instance(inner))
        const callback = vi.fn<[TimerEvent], void>()

        unit.start(callback)
        const [innerCallback1] = capture(inner.start).first()
        innerCallback1({ type: 'tick' })
        innerCallback1({ type: 'done' })

        unit.start(callback)  // restart
        verify(inner.start(anything())).twice()
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

    test('do nothing if already on', () => {
        const seq = new Sequence([
            instance(inner1)
        ]);
        const callback = vi.fn<[TimerEvent], void>()

        seq.start(callback)
        verify(inner1.start(anything())).once()

        seq.start(callback)
        verify(inner1.start(anything())).once()
    })

    test('timer state on every callback call', () => {
        const seq = new Sequence([
            instance(inner1)
        ]);
        const callback = vi.fn((e: TimerEvent) => {
            if (e.type === 'done') {
                expect(seq.state()).toEqual('off')
            } else if (e.type === 'tick') {
                expect(seq.state()).toEqual('on')
            }
        });

        seq.start(callback);

        const [inner1Callback] = capture(inner1.start).first()
        inner1Callback({ type: 'tick' })
        inner1Callback({ type: 'done' })

        expect.assertions(2)
    })

    test('should be able to restart a timer that was done', () => {
        const seq = new Sequence([
            instance(inner1),
            instance(inner2),                             // [required] more than one inner timer
        ]);
        const callback = vi.fn<[TimerEvent], void>()

        seq.start(callback);
        const [inner1Callback1] = capture(inner1.start).first()
        inner1Callback1({ type: 'tick' })
        inner1Callback1({ type: 'done' })
        const [inner2Callback] = capture(inner2.start).first()
        inner2Callback({ type: 'tick' })
        inner2Callback({ type: 'done' })

        seq.start(callback);  // restart
        verify(inner1.start(anything())).twice()
    })

    test('no inner timer', () => {
        const seq = new Sequence([]);
        const callback = vi.fn<[TimerEvent], void>();

        expect(seq.duration).eq(0);
        expect(() => seq.start(callback)).not.toThrowError();
    })
})

describe('Loop', () => {
    let inner: Timer;

    beforeEach(() => {
        inner = mock<Timer>();
    })

    test('duration is multiple of inner duration', () => {
        when(inner.duration).thenReturn(3);

        const loop = new Loop(2, instance(inner));
        expect(loop.duration).eq(6);
    })

    test('calling inner timer', () => {
        const loop = new Loop(2, instance(inner));
        const callback = vi.fn<[TimerEvent], void>();

        loop.start(callback);

        const [innerCallback] = capture(inner.start).first()
        innerCallback({ type: 'tick' })
        expect(callback).toHaveBeenNthCalledWith(1, { type: 'tick' });
        innerCallback({ type: 'done' })
        expect(callback).toHaveBeenNthCalledWith(2, { type: 'tick' });
        innerCallback({ type: 'tick' })
        expect(callback).toHaveBeenNthCalledWith(3, { type: 'tick' });
        innerCallback({ type: 'done' })
        expect(callback).toHaveBeenNthCalledWith(4, { type: 'done' });
    })

    test('do nothing if already on', () => {
        const loop = new Loop(5, instance(inner));        // [required] times > 1
        const callback = vi.fn<[TimerEvent], void>()

        loop.start(callback)
        verify(inner.start(anything())).once()

        loop.start(callback)
        verify(inner.start(anything())).once()
    })

    test('timer state on every callback call', () => {
        const loop = new Loop(1, instance(inner));
        const callback = vi.fn((e: TimerEvent) => {
            if (e.type === 'done') {
                expect(loop.state()).toEqual('off')
            } else if (e.type === 'tick') {
                expect(loop.state()).toEqual('on')
            }
        });

        loop.start(callback);

        const [innerCallback] = capture(inner.start).first()
        innerCallback({ type: 'tick' })
        innerCallback({ type: 'done' })

        expect.assertions(2)
    })

    test('should be able to restart a timer that was done', () => {
        const loop = new Loop(1, instance(inner));
        const callback = vi.fn<[TimerEvent], void>()

        loop.start(callback);
        const [innerCallback] = capture(inner.start).first()
        innerCallback({ type: 'tick' })
        innerCallback({ type: 'done' })

        loop.start(callback);  // restart
        verify(inner.start(anything())).twice()
    })

    test('loop with times zero', () => {
        when(inner.duration).thenReturn(3);

        const loop = new Loop(0, instance(inner));
        expect(loop.duration).eq(0);

        const callback = vi.fn<[TimerEvent], void>();

        loop.start(callback)

        verify(inner.start(anything())).never();
    })

    test('loop with times negative', () => {
        when(inner.duration).thenReturn(3);

        const loop = new Loop(-1, instance(inner));
        expect(loop.duration).eq(0);

        const callback = vi.fn<[TimerEvent], void>();

        loop.start(callback)

        verify(inner.start(anything())).never();
    })
})
