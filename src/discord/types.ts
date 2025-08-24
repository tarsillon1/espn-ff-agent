export type InteractionDesitnation = {
  type: "interaction";
  applicationId: string;
  interactionToken: string;
  guildId: string;
  channelId?: string;
  memberId?: string;
};

export type BroadcastDestination = {
  type: "broadcast";
  leagueId: string;
  textChannelId?: string;
};

export type Destination = InteractionDesitnation | BroadcastDestination;

export type GenerateLambdaEvent = {
  prompt: string;
  season?: number;
  system?: string;
  research?: boolean;
  destination: Destination;
};

export type VoipLambdaEvent = {
  destination: Destination;
  script: string;
  style?: string;
  voiceChannelId?: string;
};
