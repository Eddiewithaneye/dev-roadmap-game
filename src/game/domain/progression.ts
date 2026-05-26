export type ProgressionState = {
  xp: number;
  level: number;
  xpGoal: number;
};

export function addXp(
  state: ProgressionState,
  xpReward: number,
): ProgressionState {
  const xp = state.xp + xpReward;

  if (xp < state.xpGoal) {
    return { ...state, xp };
  }

  return {
    xp: xp - state.xpGoal,
    level: state.level + 1,
    xpGoal: Math.round(state.xpGoal * 1.25),
  };
}
