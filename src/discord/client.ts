import { Client, GatewayIntentBits } from "discord.js";
import { discordToken } from "./config";

const discord = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

let loginPromise: Promise<string> | undefined;

async function login() {
  if (!loginPromise) {
    loginPromise = discord.login(discordToken);
  }
  return loginPromise;
}

export async function getDiscordInstance() {
  await login();
  return discord;
}
