import { getHeadlines } from "@/espn/headlines";

export async function listNFLHeadlines() {
  console.log("listing nfl headlines");
  return getHeadlines();
}
