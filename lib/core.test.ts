import { test, expect, describe, vi, beforeEach, Mock } from 'vitest';

import { CoreTimerEventHandler, webApiCountdown } from './core';

describe('webApiCountdown', () => {
    let callback: Mock<Parameters<CoreTimerEventHandler>, ReturnType<CoreTimerEventHandler>>;

    beforeEach(() => {
        vi.useFakeTimers();
        callback = vi.fn()
    })

    test('tick tick and done', () => {
        const duration = 3;

        webApiCountdown(duration, callback);

        vi.advanceTimersByTime(1000)
        expect(callback).toHaveBeenNthCalledWith(1, { type: 'tick', remaining: 2 })
        vi.advanceTimersByTime(1000)
        expect(callback).toHaveBeenNthCalledWith(2, { type: 'tick', remaining: 1 })
        vi.advanceTimersByTime(1000)
        expect(callback).toHaveBeenNthCalledWith(3, { type: 'done' })

        // should not call anymore
        vi.advanceTimersByTime(1000)
        expect(callback).toHaveBeenCalledTimes(duration)
    })

    test('stop the countdown', () => {
        const duration = 3;

        const timer = webApiCountdown(duration, callback);

        vi.advanceTimersByTime(1000)
        expect(callback).toHaveBeenNthCalledWith(1, { type: 'tick', remaining: 2 })

        timer.stop()

        vi.advanceTimersByTime(1000)
        vi.advanceTimersByTime(1000)
        expect(callback).toHaveBeenCalledTimes(1)
    })
})
