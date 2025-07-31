export const idToTeam = {
  [0]: { name: "Free Agent", abbr: "FA" },
  [1]: { name: "Atlanta Falcons", abbr: "ATL" },
  [2]: { name: "Buffalo Bills", abbr: "BUF" },
  [3]: { name: "Chicago Bears", abbr: "CHI" },
  [4]: { name: "Cincinnati Bengals", abbr: "CIN" },
  [5]: { name: "Cleveland Browns", abbr: "CLE" },
  [6]: { name: "Dallas Cowboys", abbr: "DAL" },
  [7]: { name: "Denver Broncos", abbr: "DEN" },
  [8]: { name: "Detroit Lions", abbr: "DET" },
  [9]: { name: "Green Bay Packers", abbr: "GB" },
  [10]: { name: "Tennessee Titans", abbr: "TEN" },
  [11]: { name: "Indianapolis Colts", abbr: "IND" },
  [12]: { name: "Kansas City Chiefs", abbr: "KC" },
  [13]: { name: "Las Vegas Raiders", abbr: "LV" },
  [14]: { name: "Los Angeles Rams", abbr: "LAR" },
  [15]: { name: "Miami Dolphins", abbr: "MIA" },
  [16]: { name: "Minnesota Vikings", abbr: "MIN" },
  [17]: { name: "New England Patriots", abbr: "NE" },
  [18]: { name: "New Orleans Saints", abbr: "NO" },
  [19]: { name: "New York Giants", abbr: "NYG" },
  [20]: { name: "New York Jets", abbr: "NYJ" },
  [21]: { name: "Philadelphia Eagles", abbr: "PHI" },
  [22]: { name: "Arizona Cardinals", abbr: "ARI" },
  [23]: { name: "Pittsburgh Steelers", abbr: "PIT" },
  [24]: { name: "Los Angeles Chargers", abbr: "LAC" },
  [25]: { name: "San Francisco 49ers", abbr: "SF" },
  [26]: { name: "Seattle Seahawks", abbr: "SEA" },
  [27]: { name: "Tampa Bay Buccaneers", abbr: "TB" },
  [28]: { name: "Washington Commanders", abbr: "WSH" },
  [29]: { name: "Carolina Panthers", abbr: "CAR" },
  [30]: { name: "Jacksonville Jaguars", abbr: "JAX" },
  [33]: { name: "Baltimore Ravens", abbr: "BAL" },
  [34]: { name: "Houston Texans", abbr: "HOU" },
};

export const abbrToId = Object.fromEntries(
  Object.entries(idToTeam).map(([id, team]) => [team.abbr, id])
);

export function getTeamNameAndAbbr(teamId: number) {
  const team = idToTeam[teamId as keyof typeof idToTeam];
  if (!team) {
    throw new Error(`Invalid team ID: ${teamId}`);
  }
  return team;
}

export function getTeamIdFromAbbr(abbr: string) {
  const id = abbrToId[abbr as keyof typeof abbrToId];
  if (!id) {
    throw new Error(`Invalid team abbreviation: ${abbr}`);
  }
  return id;
}
