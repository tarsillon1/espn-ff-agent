import { createFindPlayersTool } from "./find-players";
import { leagueId, espnS2, espnSwid } from "@/espn";

const tool = createFindPlayersTool({
  year: 2025,
  leagueId: leagueId,
  espnS2,
  espnSwid,
});

it("should find QB players that match query", async () => {
  const result = await tool.execute({
    query: "Mahomes Chiefs QB",
  });
  expect(result[0]).toEqual({
    player: {
      fullName: "Patrick Mahomes",
      team: { name: "Kansas City Chiefs", abbr: "KC" },
      position: { name: "Quarterback", abbr: "QB" },
      injured: undefined,
      injuryStatus: undefined,
      isBenched: true,
      isFreeAgent: true,
      rosteredBy: undefined,
    },
    score: expect.any(Number),
  });
});

it("should find WR players that match query", async () => {
  const result = await tool.execute({
    query: "Jefferson Vikings WR",
  });
  expect(result[0]).toEqual({
    player: {
      fullName: "Vikings D/ST",
      team: { name: "Minnesota Vikings", abbr: "MIN" },
      position: { name: "Defense", abbr: "DST" },
      injured: undefined,
      injuryStatus: undefined,
      isBenched: true,
      isFreeAgent: true,
      rosteredBy: undefined,
    },
    score: expect.any(Number),
  });
});

it("should find RB players that match query", async () => {
  const result = await tool.execute({
    query: "McCaffrey 49ers RB",
  });
  expect(result[0]).toEqual({
    player: {
      fullName: "Christian McCaffrey",
      team: { name: "San Francisco 49ers", abbr: "SF" },
      position: { name: "Running Back", abbr: "RB" },
      injured: undefined,
      injuryStatus: undefined,
      isBenched: true,
      isFreeAgent: true,
      rosteredBy: undefined,
    },
    score: expect.any(Number),
  });
});

it("should find TE players that match query", async () => {
  const result = await tool.execute({
    query: "Kelce Chiefs TE",
    limit: 1,
  });
  expect(result[0]).toEqual({
    player: {
      fullName: "Travis Kelce",
      team: { name: "Kansas City Chiefs", abbr: "KC" },
      position: { name: "Tight End", abbr: "TE" },
      injured: undefined,
      injuryStatus: undefined,
      isBenched: true,
      isFreeAgent: true,
      rosteredBy: undefined,
    },
    score: expect.any(Number),
  });
});

it("should find Defense players that match query", async () => {
  const result = await tool.execute({
    query: "49ers Defense DST",
  });
  expect(result[0]).toEqual({
    player: {
      fullName: "49ers D/ST",
      team: { name: "San Francisco 49ers", abbr: "SF" },
      position: { name: "Defense", abbr: "DST" },
      injured: undefined,
      injuryStatus: undefined,
      isBenched: true,
      isFreeAgent: true,
      rosteredBy: undefined,
    },
    score: expect.any(Number),
  });
});

it.only("should find Kicker players that match query", async () => {
  const result = await tool.execute({
    query: "Tyler Bass Bills K",
  });
  expect(result[0]).toEqual({
    player: {
      fullName: "Tyler Bass",
      team: { name: "Buffalo Bills", abbr: "BUF" },
      position: { name: "Kicker", abbr: "K" },
      injured: undefined,
      injuryStatus: undefined,
      isBenched: true,
      isFreeAgent: true,
      rosteredBy: undefined,
    },
    score: expect.any(Number),
  });
});

it("should find players by name only", async () => {
  const result = await tool.execute({
    query: "Josh Allen",
  });
  expect(result[0]).toEqual({
    player: {
      fullName: "Josh Allen",
      team: { name: "Buffalo Bills", abbr: "BUF" },
      position: { name: "Quarterback", abbr: "QB" },
      injured: undefined,
      injuryStatus: undefined,
      isBenched: true,
      isFreeAgent: true,
      rosteredBy: undefined,
    },
    score: expect.any(Number),
  });
});

it("should find players by team abbreviation", async () => {
  const result = await tool.execute({
    query: "Brady TB",
  });
  expect(result[0]).toEqual({
    player: {
      fullName: "Brady Russell",
      team: { name: "Seattle Seahawks", abbr: "SEA" },
      position: { name: "Running Back", abbr: "RB" },
      injured: undefined,
      injuryStatus: undefined,
      isBenched: true,
      isFreeAgent: true,
      rosteredBy: undefined,
    },
    score: expect.any(Number),
  });
});

it("should find players by position abbreviation", async () => {
  const result = await tool.execute({
    query: "Adams WR",
  });
  expect(result[0]).toEqual({
    player: {
      fullName: "Davante Adams",
      team: { name: "Los Angeles Rams", abbr: "LAR" },
      position: { name: "Wide Receiver", abbr: "WR" },
      injured: undefined,
      injuryStatus: undefined,
      isBenched: true,
      isFreeAgent: true,
      rosteredBy: undefined,
    },
    score: expect.any(Number),
  });
});

it("should return multiple results for broad queries", async () => {
  const result = await tool.execute({
    query: "QB",
  });
  expect(result).toEqual([]);
});

it("should handle team name searches", async () => {
  const result = await tool.execute({
    query: "Chiefs",
  });
  expect(result).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        player: expect.objectContaining({
          team: { name: "Kansas City Chiefs", abbr: "KC" },
        }),
        score: expect.any(Number),
      }),
    ])
  );
});

it("should find multiple players at once", async () => {
  const result = await tool.execute({
    query: "Mahomes Chiefs QB Adams Rams WR",
  });
  expect(result).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        player: expect.objectContaining({
          fullName: "Patrick Mahomes",
          team: { name: "Kansas City Chiefs", abbr: "KC" },
          position: { name: "Quarterback", abbr: "QB" },
          injured: undefined,
          injuryStatus: undefined,
          isBenched: true,
          isFreeAgent: true,
          rosteredBy: undefined,
        }),
        score: expect.any(Number),
      }),
      expect.objectContaining({
        player: expect.objectContaining({
          fullName: "Davante Adams",
          team: { name: "Los Angeles Rams", abbr: "LAR" },
          position: { name: "Wide Receiver", abbr: "WR" },
          injured: undefined,
          injuryStatus: undefined,
          isBenched: true,
          isFreeAgent: true,
          rosteredBy: undefined,
        }),
        score: expect.any(Number),
      }),
    ])
  );
});
