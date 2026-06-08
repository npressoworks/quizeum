import {
  createElapsedSegmentState,
  startElapsedSegment,
  finalizeElapsedSegment,
  getElapsedDisplaySeconds,
} from '@/lib/play-elapsed';

describe('play-elapsed', () => {
  const t0 = 1_000_000;

  test('start → tick → finalize で累計秒数が加算される', () => {
    let state = createElapsedSegmentState();
    state = startElapsedSegment(state, t0);
    expect(getElapsedDisplaySeconds(state, true, t0 + 2_500)).toBe(2);
    state = finalizeElapsedSegment(state, t0 + 2_500);
    expect(state.finalizedSeconds).toBe(2);
    expect(state.segmentStartedAtMs).toBeNull();
    expect(getElapsedDisplaySeconds(state, false, t0 + 9_000)).toBe(2);
  });

  test('finalize は進行中区間がないとき no-op', () => {
    const state = createElapsedSegmentState(5);
    const next = finalizeElapsedSegment(state, t0 + 1_000);
    expect(next).toBe(state);
    expect(next.finalizedSeconds).toBe(5);
  });

  test('連続 finalize は idempotent', () => {
    let state = startElapsedSegment(createElapsedSegmentState(), t0);
    state = finalizeElapsedSegment(state, t0 + 1_000);
    const again = finalizeElapsedSegment(state, t0 + 5_000);
    expect(again.finalizedSeconds).toBe(1);
  });

  test('start は既に進行中なら重複開始しない', () => {
    const started = startElapsedSegment(createElapsedSegmentState(), t0);
    const again = startElapsedSegment(started, t0 + 500);
    expect(again.segmentStartedAtMs).toBe(t0);
  });
});
