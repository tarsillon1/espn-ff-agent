import "dotenv/config";
import { discordToken, discordClientId } from "./config";

interface DiscordCommand {
  name: string;
  description: string;
  options?: Array<{
    name: string;
    description: string;
    type: number;
    required: boolean;
  }>;
}

interface DiscordCommandResponse {
  id: string;
  name: string;
}

const commands: DiscordCommand[] = [
  {
    name: "ask",
    description: "Ask questions about your fantasy football league",
    options: [
      {
        name: "question",
        description: "Your question about the league",
        type: 3, // STRING type
        required: true,
      },
    ],
  },
];

export async function registerCommands() {
  const url = `https://discord.com/api/v10/applications/${discordClientId}/commands`;

  for (const command of commands) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bot ${discordToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (response.ok) {
        console.log(`Successfully registered command: ${command.name}`);
      } else {
        const error = await response.text();
        console.error(`Failed to register command ${command.name}:`, error);
      }
    } catch (error) {
      console.error(`Error registering command ${command.name}:`, error);
    }
  }
}

export async function deleteCommands() {
  const url = `https://discord.com/api/v10/applications/${discordClientId}/commands`;

  try {
    // First, get all existing commands
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bot ${discordToken}`,
      },
    });

    if (response.ok) {
      const existingCommands =
        (await response.json()) as DiscordCommandResponse[];

      // Delete each command
      for (const command of existingCommands) {
        const deleteUrl = `${url}/${command.id}`;
        const deleteResponse = await fetch(deleteUrl, {
          method: "DELETE",
          headers: {
            Authorization: `Bot ${discordToken}`,
          },
        });

        if (deleteResponse.ok) {
          console.log(`Successfully deleted command: ${command.name}`);
        } else {
          console.error(`Failed to delete command ${command.name}`);
        }
      }
    }
  } catch (error) {
    console.error("Error deleting commands:", error);
  }
}

async function main() {
  const command = process.argv[2];

  if (command === "register") {
    console.log("Registering Discord slash commands...");
    await registerCommands();
    console.log("Done!");
  } else if (command === "delete") {
    console.log("Deleting Discord slash commands...");
    await deleteCommands();
    console.log("Done!");
  } else {
    console.log("Usage:");
    console.log("  npm run register-commands");
    console.log("  npm run delete-commands");
  }
}

main().catch(console.error);
