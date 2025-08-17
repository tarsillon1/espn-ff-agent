const slotNames = {
  0: "QB",
  2: "RB",
  4: "WR",
  6: "TE",
  16: "DST",
  17: "K",
  20: "BENCH",
  21: "IR",
  23: "FLEX",
};

export function getSlotName(slotId: number) {
  return slotNames[slotId as keyof typeof slotNames];
}
