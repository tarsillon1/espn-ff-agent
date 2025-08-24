import {
  AttachmentBuilder,
  ChannelType,
  Message,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { getDiscordInstance } from "./client";
import { chunk } from "./utils";

export async function findTextChannel(guildId: string) {
  const discord = await getDiscordInstance();
  const guild = await discord.guilds.fetch(guildId);

  let latestBotMessage: Message | undefined;
  let fallbackChannel: TextChannel | VoiceChannel | null = guild.systemChannel;

  const channels = await guild.channels.fetch();
  for (const channel of channels.values()) {
    if (
      !channel ||
      (channel.type !== ChannelType.GuildText &&
        channel.type !== ChannelType.GuildVoice)
    ) {
      continue;
    }

    if (!fallbackChannel) {
      fallbackChannel = channel;
    }

    const messages = await channel.messages.fetch({ limit: 100 });

    const lastBotMessage = messages.find(
      (m) => m.author.id === guild.client.user?.id
    );
    if (
      lastBotMessage &&
      (!latestBotMessage ||
        lastBotMessage.createdTimestamp > latestBotMessage.createdTimestamp)
    ) {
      latestBotMessage = lastBotMessage;
    }
  }

  return (
    (latestBotMessage?.channel as TextChannel | VoiceChannel | null) ||
    fallbackChannel
  );
}

export async function sendAudioToTextChannel(
  textChannelId: string,
  stream: ReadableStream
) {
  const client = await getDiscordInstance();
  const channel = await client.channels.fetch(textChannelId);
  if (!channel) {
    console.warn("failed to find text channel");
    return;
  }

  if (channel.type !== ChannelType.GuildText) {
    console.warn("text channel is not a text channel");
    return;
  }

  await channel.send({
    content: "test",
    files: [
      new AttachmentBuilder(
        Buffer.from(await new Response(stream).arrayBuffer()),
        {
          name: "commentary.wav",
        }
      ),
    ],
  });
}

export async function chunkAndSendText(
  channel: TextChannel | VoiceChannel,
  text: string
) {
  const chunks = chunk(text, 3000);

  let lastMessage: Message | undefined;
  for (const chunk of chunks) {
    lastMessage = await channel.send({
      content: chunk,
      reply: lastMessage
        ? {
            messageReference: lastMessage,
          }
        : undefined,
    });
  }
}
