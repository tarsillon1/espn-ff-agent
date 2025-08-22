import { z } from "zod";
import { getHeadlines } from "@/espn/headlines";

export function createListNFLHeadlinesTool() {
  async function listNFLHeadlines() {
    console.log("listing nfl headlines");
    return getHeadlines();
  }

  return {
    name: "listNFLHeadlines",
    description: "List most recent NFL headlines.",
    parameters: z.object({}),
    execute: listNFLHeadlines,
  };
}
