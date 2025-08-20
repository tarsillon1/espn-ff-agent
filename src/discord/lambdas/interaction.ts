import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { verifyDiscordRequest } from "../verify";
import { askLambdaName, discordPublicKey } from "../config";
import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { GenerateLambdaEvent } from "../types";
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

const lambdaClient = new LambdaClient({
  region: "us-east-1",
});

const GENERATE_SQS_QUEUE_URL = process.env.GENERATE_SQS_QUEUE_URL;

const sqs = new SQSClient({
  region: "us-east-1",
});

interface DiscordInteraction {
  type: number;
  data?: {
    name?: string;
    options?: Array<{
      name: string;
      value: string | number;
    }>;
  };
  application_id: string;
  token: string;
  channel_id: string;
  guild_id: string;
  member?: {
    user: {
      id: string;
      username: string;
    };
  };
  user?: {
    id: string;
    username: string;
  };
}

async function ask(interaction: DiscordInteraction) {
  const question =
    interaction.data?.options?.find((opt) => opt.name === "question")?.value ||
    "";
  if (!question) {
    return {
      type: 4,
      data: {
        content:
          "Please provide a question to ask about your fantasy football league.",
      },
    };
  }
  if (typeof question !== "string") {
    return {
      type: 4,
      data: {
        content: "Please provide a valid question.",
      },
    };
  }

  const season = interaction.data?.options?.find((opt) => opt.name === "season")?.value;
  if (season && typeof season !== "number") {
    return {
      type: 4,
      data: {
        content: "Please provide a valid season.",
      },
    };
  }

  const event: GenerateLambdaEvent = {
    applicationId: interaction.application_id,
    token: interaction.token,
    prompt: question,
    voiceChannelId: interaction.channel_id,
    guildId: interaction.guild_id,
    memberId: interaction.member?.user.id,
    season: season ? Number(season) : undefined,
  };

  await sqs.send(new SendMessageCommand({
    QueueUrl: GENERATE_SQS_QUEUE_URL,
    MessageBody: JSON.stringify(event),
  }));

  return { type: 5 };
}

export function handleInteraction(interaction: DiscordInteraction) {
  const commandName = interaction.data?.name;

  if (commandName === "ask") {
    return ask(interaction);
  }

  return {
    type: 4,
    data: {
      content:
        "Unknown command. Use `/ask` to ask questions about your fantasy football league.",
    },
  };
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (
      !verifyDiscordRequest(
        event.headers as Record<string, string>,
        event.body || "",
        discordPublicKey
      )
    ) {
      return {
        statusCode: 401,
        body: "Invalid request signature",
      };
    }

    const body = JSON.parse(event.body || "{}");

    // Handle Discord ping (type 1)
    if (body.type === 1) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: 1 }),
      };
    }

    // Handle slash command interactions (type 2)
    if (body.type === 2) {
      const response = await handleInteraction(body);
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(response),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error("Lambda function error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal server error",
      }),
    };
  }
};
