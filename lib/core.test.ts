import { test, expect, describe, vi, beforeEach } from 'vitest';

import { TimerEvent } from './types';
import { webApiCountdown } from './core';

describe('webApiCountdown', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    })

    test('tick tick and done', () => {
        const duration = 3;
        const callback = vi.fn<[TimerEvent], void>()

        webApiCountdown(duration, callback);

        vi.advanceTimersByTime(1000)
        expect(callback).toHaveBeenNthCalledWith(1, { type: 'tick' })
        vi.advanceTimersByTime(1000)
        expect(callback).toHaveBeenNthCalledWith(2, { type: 'tick' })
        vi.advanceTimersByTime(1000)
        expect(callback).toHaveBeenNthCalledWith(3, { type: 'done' })

        // should not call anymore
        vi.advanceTimersByTime(1000)
        expect(callback).toHaveBeenCalledTimes(duration)
    })

    test('stop the countdown', () => {
        const duration = 3;
        const callback = vi.fn<[TimerEvent], void>()

        const timer = webApiCountdown(duration, callback);

        vi.advanceTimersByTime(1000)
        expect(callback).toHaveBeenNthCalledWith(1, { type: 'tick' })

        timer.stop()

        vi.advanceTimersByTime(1000)
        vi.advanceTimersByTime(1000)
        expect(callback).toHaveBeenCalledTimes(1)
    })
})
