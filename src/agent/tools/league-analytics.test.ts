import { createLeagueAnalyticsTool } from "./league-analytics";

// Mock data for testing
const mockGetLeagueInput = {
  espnS2: "test-espn-s2",
  espnSwid: "test-espn-swid",
  leagueId: "123456",
  season: 2024,
};

it("should create a tool with correct structure", () => {
  const tool = createLeagueAnalyticsTool(mockGetLeagueInput);

  expect(tool).toBeDefined();
  expect(tool.description).toBeDefined();
  expect(tool.parameters).toBeDefined();
  expect(tool.execute).toBeDefined();
});

it("should have correct parameter schema", () => {
  const tool = createLeagueAnalyticsTool(mockGetLeagueInput);

  // Test that the schema accepts empty parameters
  expect(() => tool.parameters.parse({})).not.toThrow();

  // Test that the schema accepts additional properties (z.object({}) allows this by default)
  expect(() =>
    tool.parameters.parse({ additionalProp: "value" })
  ).not.toThrow();
});
