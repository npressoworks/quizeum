/** 区間累計経過時間のセグメント状態 */
export type ElapsedSegmentState = {
  finalizedSeconds: number;
  segmentStartedAtMs: number | null;
};

export function createElapsedSegmentState(
  finalizedSeconds = 0
): ElapsedSegmentState {
  return {
    finalizedSeconds: Math.max(0, finalizedSeconds),
    segmentStartedAtMs: null,
  };
}

export function startElapsedSegment(
  state: ElapsedSegmentState,
  nowMs = Date.now()
): ElapsedSegmentState {
  if (state.segmentStartedAtMs !== null) {
    return state;
  }
  return { ...state, segmentStartedAtMs: nowMs };
}

export function finalizeElapsedSegment(
  state: ElapsedSegmentState,
  nowMs = Date.now()
): ElapsedSegmentState {
  if (state.segmentStartedAtMs === null) {
    return state;
  }
  const delta = Math.max(0, Math.floor((nowMs - state.segmentStartedAtMs) / 1000));
  return {
    finalizedSeconds: state.finalizedSeconds + delta,
    segmentStartedAtMs: null,
  };
}

export function getElapsedDisplaySeconds(
  state: ElapsedSegmentState,
  ticking: boolean,
  nowMs = Date.now()
): number {
  if (!ticking || state.segmentStartedAtMs === null) {
    return state.finalizedSeconds;
  }
  const active = Math.max(0, Math.floor((nowMs - state.segmentStartedAtMs) / 1000));
  return state.finalizedSeconds + active;
}
