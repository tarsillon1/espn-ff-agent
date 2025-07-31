import { generateCommentaryText } from "@/agent/commentator";
import { discordClientId } from "./config";

interface DiscordInteraction {
  type: number;
  data?: {
    content?: string;
  };
  channel_id: string;
  author: {
    id: string;
    username: string;
  };
  mentions: Array<{
    id: string;
  }>;
}

export async function handleInteraction(message: DiscordInteraction) {
  const isBotMentioned = message.mentions?.some(
    (mention) => mention.id === discordClientId
  );

  if (!isBotMentioned) {
    return { received: true };
  }

  const content = message.data?.content || "";
  const cleanContent = content.replace(/<@!?\d+>/g, "").trim();
  if (!cleanContent) {
    return {
      type: 4,
      data: {
        content:
          "Hello! I'm your ESPN Fantasy Football commentator. What would you like to know about your league?",
      },
    };
  }

  try {
    const result = await generateCommentaryText(cleanContent);
    return {
      type: 4,
      data: {
        content: result.text,
      },
    };
  } catch (error) {
    console.error("Error calling commentator agent:", error);

    return {
      type: 4,
      data: {
        content:
          "Sorry, I encountered an error while processing your request. Please try again later.",
      },
    };
  }
}
