import {
  ChannelType,
  Client,
  GatewayIntentBits,
  VoiceChannel,
} from "discord.js";
import { discordToken } from "./config";

import { Readable } from "stream";
import { AudioPlayerStatus, NoSubscriberBehavior } from "@discordjs/voice";

export async function findVoiceChannel(
  guildId: string,
  voiceChannelId: string,
  memberId?: string
) {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });

  await client.login(discordToken);

  const guild = await client.guilds.fetch(guildId);
  if (!guild) {
    console.warn("guild not found");
    return;
  }

  const channel = await guild.channels.fetch(voiceChannelId);
  if (channel?.type === ChannelType.GuildVoice) {
    return channel;
  }

  const voiceChannels = guild.channels.cache.filter(
    (c) => c.type === ChannelType.GuildVoice
  );

  const channelWithMember = voiceChannels.find((c) =>
    c.members.find((m) => m.id === memberId)
  );
  if (channelWithMember) {
    return channelWithMember;
  }

  const sorted = voiceChannels.sort((a, b) => {
    return a.members.size - b.members.size;
  });

  return sorted.first();
}

export async function createVoipClient(channel: VoiceChannel) {
  const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    VoiceConnectionStatus,
  } = await import("@discordjs/voice");

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guildId,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  connection.on(VoiceConnectionStatus.Disconnected, () => {
    console.log("voice connection disconnected");
    connection;
  });

  connection.on(VoiceConnectionStatus.Destroyed, () => {
    console.log("voice connection destroyed");
  });

  connection.on(VoiceConnectionStatus.Connecting, () => {
    console.log("voice connection connecting");
  });

  await new Promise<void>((resolve, reject) => {
    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log("voice connection ready");
      resolve();
    });

    connection.on("error", (error) => {
      console.error("voice connection error", error);
      reject(error);
    });
  });

  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Stop,
    },
  });
  connection.subscribe(player);

  player.on(AudioPlayerStatus.Idle, () => {
    console.log("audio player idle");
  });

  player.on(AudioPlayerStatus.Buffering, () => {
    console.log("audio player buffering...");
  });

  player.on("error", (error) => {
    console.log("audio player error", error);
  });

  function play(stream: Readable) {
    const audioResource = createAudioResource(stream);
    player.play(audioResource);
    return new Promise<void>((resolve) => {
      player.once(AudioPlayerStatus.Idle, () => {
        resolve();
      });
    });
  }

  return {
    play,
    close: () => {
      player.stop();
      connection.destroy();
    },
  };
}
