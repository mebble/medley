import { test, expect, beforeEach, describe, vi, Mock } from 'vitest';
import { mock, instance, capture, when, verify, anything, anyNumber } from 'ts-mockito';

import { Timer, TimerEventHandler, TimerState } from './types';
import { Loop, Sequence, Unit } from './timer';
import { TimeIt } from './core';

type MockTimerEventHandler = Mock<Parameters<TimerEventHandler>, ReturnType<TimerEventHandler>>;

describe('Unit', () => {
    let inner: Mock<Parameters<TimeIt>, ReturnType<TimeIt>>;
    let callback: MockTimerEventHandler;

    beforeEach(() => {
        inner = vi.fn()
        callback = vi.fn()
    })

    test('on tick, will call callback with target', () => {
        const unit = new Unit('u', 10, inner)

        unit.start(callback)

        const [,innerCallback] = inner.mock.lastCall!
        innerCallback({ type: 'tick', remaining: 1 })
        expect(callback).toHaveBeenCalledWith({ type: 'tick', target: { type: 'tick', remaining: 1, id: 'u' } })
    })

    test('timer status on every callback call', () => {
        const unit = new Unit('u', 10, inner);
        callback = vi.fn(e => {
            if (e.type === 'done') {
                expect(unit.state().status).toEqual('off')
            } else if (e.type === 'tick') {
                expect(unit.state().status).toEqual('on')
            }
        });

        unit.start(callback);

        const [,innerCallback] = inner.mock.lastCall!
        innerCallback({ type: 'tick', remaining: anyNumber() })
        innerCallback({ type: 'done' })

        expect.assertions(2)
    })

    test('do nothing if timer already on', () => {
        const unit = new Unit('u', 10, inner)

        unit.start(callback)
        expect(inner).toHaveBeenCalledTimes(1)

        unit.start(callback)
        expect(inner).toHaveBeenCalledTimes(1)
    })

    test('should be able to restart a timer that was done', () => {
        const unit = new Unit('u', 10, inner)

        unit.start(callback)
        const [,innerCallback1] = inner.mock.lastCall!
        innerCallback1({ type: 'tick', remaining: anyNumber() })
        innerCallback1({ type: 'done' })

        unit.start(callback)  // restart
        expect(inner).toHaveBeenCalledTimes(2)
    })
});

describe('Sequence', () => {
    let inner1: Timer<TimerState>;
    let inner2: Timer<TimerState>;
    let callback: MockTimerEventHandler;

    beforeEach(() => {
        inner1 = mock();
        inner2 = mock();
        callback = vi.fn();
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

    test('calling inner timers in sequence', () => {
        const seq = new Sequence([
            instance(inner1),
            instance(inner2)
        ]);

        seq.start(callback);

        const [inner1Callback] = capture(inner1.start).first()
        inner1Callback({ type: 'tick', target: anything() })
        expect(callback).toHaveBeenNthCalledWith(1, expect.objectContaining({ type: 'tick' }))
        inner1Callback({ type: 'done', target: anything() })
        expect(callback).toHaveBeenNthCalledWith(2, expect.objectContaining({ type: 'tick' }))

        const [inner2Callback] = capture(inner2.start).first()
        inner2Callback({ type: 'tick', target: anything() })
        expect(callback).toHaveBeenNthCalledWith(3, expect.objectContaining({ type: 'tick' }))
        inner2Callback({ type: 'done', target: anything() })
        expect(callback).toHaveBeenNthCalledWith(4, expect.objectContaining({ type: 'done' }))
    })

    test('timer status on every callback call', () => {
        const seq = new Sequence([
            instance(inner1)
        ]);
        callback = vi.fn(e => {
            if (e.type === 'done') {
                expect(seq.state().status).toEqual('off')
            } else if (e.type === 'tick') {
                expect(seq.state().status).toEqual('on')
            }
        });

        seq.start(callback);

        const [inner1Callback] = capture(inner1.start).first()
        inner1Callback({ type: 'tick', target: anything() })
        inner1Callback({ type: 'done', target: anything() })

        expect.assertions(2)
    })

    test('do nothing if timer already on', () => {
        const seq = new Sequence([
            instance(inner1)
        ]);

        seq.start(callback)
        verify(inner1.start(anything())).once()

        seq.start(callback)
        verify(inner1.start(anything())).once()
    })

    test('should be able to restart a timer that was done', () => {
        const seq = new Sequence([
            instance(inner1),
            instance(inner2),                             // [required] more than one inner timer
        ]);

        seq.start(callback);
        const [inner1Callback1] = capture(inner1.start).first()
        inner1Callback1({ type: 'tick', target: anything() })
        inner1Callback1({ type: 'done', target: anything() })
        const [inner2Callback] = capture(inner2.start).first()
        inner2Callback({ type: 'tick', target: anything() })
        inner2Callback({ type: 'done', target: anything() })

        seq.start(callback);  // restart
        verify(inner1.start(anything())).twice()
    })

    test('no inner timer', () => {
        const seq = new Sequence([]);

        expect(seq.duration).eq(0);
        expect(() => seq.start(callback)).not.toThrowError();
    })
})

describe('Loop', () => {
    let inner: Timer<TimerState>;
    let callback: MockTimerEventHandler;

    beforeEach(() => {
        inner = mock();
        callback = vi.fn();
    })

    test('duration is multiple of inner duration', () => {
        when(inner.duration).thenReturn(3);

        const loop = new Loop(2, instance(inner));
        expect(loop.duration).eq(6);
    })

    test('calling inner timer in a loop', () => {
        const loop = new Loop(2, instance(inner));

        loop.start(callback);

        const [innerCallback] = capture(inner.start).first()
        innerCallback({ type: 'tick', target: anything() })
        expect(callback).toHaveBeenNthCalledWith(1, expect.objectContaining({ type: 'tick' }));
        innerCallback({ type: 'done', target: anything() })
        expect(callback).toHaveBeenNthCalledWith(2, expect.objectContaining({ type: 'tick' }));
        innerCallback({ type: 'tick', target: anything() })
        expect(callback).toHaveBeenNthCalledWith(3, expect.objectContaining({ type: 'tick' }));
        innerCallback({ type: 'done', target: anything() })
        expect(callback).toHaveBeenNthCalledWith(4, expect.objectContaining({ type: 'done' }));
    })

    test('timer status on every callback call', () => {
        const loop = new Loop(1, instance(inner));
        callback = vi.fn(e => {
            if (e.type === 'done') {
                expect(loop.state().status).toEqual('off')
            } else if (e.type === 'tick') {
                expect(loop.state().status).toEqual('on')
            }
        });

        loop.start(callback);

        const [innerCallback] = capture(inner.start).first()
        innerCallback({ type: 'tick', target: anything() })
        innerCallback({ type: 'done', target: anything() })

        expect.assertions(2)
    })

    test('do nothing if timer already on', () => {
        const loop = new Loop(5, instance(inner));        // [required] times > 1

        loop.start(callback)
        verify(inner.start(anything())).once()

        loop.start(callback)
        verify(inner.start(anything())).once()
    })

    test('should be able to restart a timer that was done', () => {
        const loop = new Loop(1, instance(inner));

        loop.start(callback);
        const [innerCallback] = capture(inner.start).first()
        innerCallback({ type: 'tick', target: anything() })
        innerCallback({ type: 'done', target: anything() })

        loop.start(callback);  // restart
        verify(inner.start(anything())).twice()
    })

    test('loop with times zero', () => {
        when(inner.duration).thenReturn(3);

        const loop = new Loop(0, instance(inner));
        expect(loop.duration).eq(0);

        loop.start(callback)

        verify(inner.start(anything())).never();
    })

    test('loop with times negative', () => {
        when(inner.duration).thenReturn(3);

        const loop = new Loop(-1, instance(inner));
        expect(loop.duration).eq(0);

        loop.start(callback)

        verify(inner.start(anything())).never();
    })
})
