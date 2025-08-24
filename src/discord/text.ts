import {
  AttachmentBuilder,
  ChannelType,
  Message,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { getDiscordInstance } from "./client";

export async function findTextChannel(guildId: string) {
  const discord = await getDiscordInstance();
  const guild = await discord.guilds.fetch(guildId);

  let latestBotMessage: Message | undefined;
  let fallbackChannel: TextChannel | VoiceChannel | null = guild.systemChannel;

  for (const channel of guild.channels.cache.values()) {
    if (
      channel.type !== ChannelType.GuildText &&
      channel.type !== ChannelType.GuildVoice
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
