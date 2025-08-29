import { ChannelType, VoiceChannel } from "discord.js";

import { Readable } from "stream";
import { getDiscordInstance } from "./client";

export async function findVoiceChannel(
  guildId: string,
  voiceChannelId?: string,
  memberId?: string
) {
  const client = await getDiscordInstance();

  const guild = await client.guilds.fetch(guildId);
  if (!guild) {
    console.warn("guild not found");
    return;
  }

  if (voiceChannelId) {
    const channel = await guild.channels.fetch(voiceChannelId);
    if (channel?.type === ChannelType.GuildVoice) {
      return channel;
    }
  }

  const channels = await guild.channels.fetch();
  const voiceChannels = [...channels.values()].filter(
    (c) => c?.type === ChannelType.GuildVoice
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

  return sorted[0];
}

async function createVoiceConnection(channel: VoiceChannel) {
  const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    NoSubscriberBehavior,
    VoiceConnectionStatus,
  } = await import("@discordjs/voice");

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guildId,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  connection.on(VoiceConnectionStatus.Disconnected, () => {
    console.log("voice connection disconnected");
  });

  connection.on(VoiceConnectionStatus.Destroyed, () => {
    console.log("voice connection destroyed");
  });

  connection.on(VoiceConnectionStatus.Connecting, () => {
    console.log("voice connection connecting");
  });

  console.log("waiting for voice connection ready");

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.log("voice connection timeout");
      reject(new Error("voice connection timeout"));
    }, 5000);

    connection.on(VoiceConnectionStatus.Connecting, () => {
      console.log("voice connection connecting");
    });

    connection.on(VoiceConnectionStatus.Ready, () => {
      console.log("voice connection ready");
      clearTimeout(timeout);
      resolve();
    });

    connection.on("error", (error) => {
      console.error("voice connection error", error);
      reject(error);
    });
  });

  return {
    connection,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    NoSubscriberBehavior,
  };
}

async function createVoiceConnectionWithRetry(
  channel: VoiceChannel,
  max = 5,
  delay = 1000
) {
  try {
    return await createVoiceConnection(channel);
  } catch (error) {
    console.error("failed to create voice connection", error);
    if (max > 0) {
      console.log("retrying voice connection in " + delay + "ms", max - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));

      console.log("retrying voice connection", max - 1);
      return createVoiceConnectionWithRetry(channel, max - 1, delay * 2);
    }
    throw error;
  }
}

async function createVoipClient(channel: VoiceChannel) {
  console.log("joining voice channel");

  const {
    connection,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    NoSubscriberBehavior,
  } = await createVoiceConnectionWithRetry(channel);

  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Play,
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

  player.on(AudioPlayerStatus.AutoPaused, () => {
    console.log("audio player auto paused");
  });

  player.on(AudioPlayerStatus.Paused, () => {
    console.log("audio player paused");
  });

  function play(stream: Readable) {
    console.log("playing audio");

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

async function playVoice(channel: VoiceChannel, stream: ReadableStream) {
  const voip = await createVoipClient(channel);
  if (!voip) {
    console.warn("failed to create voip client");
    return;
  }
  try {
    console.log("playing voice");
    await voip.play(Readable.from(stream));
  } finally {
    voip.close();
  }
}

export async function findChannelAndPlayVoice(
  voiceChannelId: string,
  stream: ReadableStream
) {
  const client = await getDiscordInstance();
  const channel = await client.channels.fetch(voiceChannelId);
  if (!channel) {
    console.warn("failed to find voice channel");
    return;
  }

  if (channel.type !== ChannelType.GuildVoice) {
    console.warn("voice channel is not a voice channel");
    return;
  }

  if (channel.members.size === 0) {
    console.warn("voice channel is empty");
    return;
  }

  console.log(
    "playing voice in channel " +
      channel?.name +
      " with members " +
      [...channel.members.values()].map((m) => m.user.username).join(", ")
  );

  return playVoice(channel, stream);
}
