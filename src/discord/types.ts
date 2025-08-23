export type GenerateLambdaEvent = {
  applicationId: string;
  token: string;
  prompt: string;
  channelId: string;
  guildId: string;
  memberId?: string;
  season?: number;
  system?: string;
  research?: boolean;
};

export type VoipLambdaEvent = {
  applicationId: string;
  token: string;
  channelId: string;
  guildId: string;
  memberId?: string;
  script: string;
  style?: string;
};
