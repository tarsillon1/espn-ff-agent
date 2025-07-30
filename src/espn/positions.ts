const positionIdToPosition = {
  1: { name: "Quarterback", abbr: "QB" }, // QB
  2: { name: "Running Back", abbr: "RB" }, // RB
  3: { name: "Wide Receiver", abbr: "WR" }, // WR
  4: { name: "Tight End", abbr: "TE" }, // TE
  5: { name: "Kicker", abbr: "K" }, // K
  16: { name: "Defense", abbr: "DST" }, // DST
} as const;

export function getPosition(defaultPositionId?: number) {
  const position =
    positionIdToPosition[
      defaultPositionId as keyof typeof positionIdToPosition
    ];
  if (position) {
    return position;
  }
  return { name: "Unknown", abbr: "UNK" };
}
