export type GenerateLambdaEvent = {
  applicationId: string;
  token: string;
  prompt: string;
  voiceChannelId: string;
  guildId: string;
  memberId?: string;
  season?: number;
  system?: string;
}

export type VoipLambdaEvent = {
  applicationId: string;
  token: string;
  voiceChannelId: string;
  guildId: string;
  memberId?: string;
  script: string;
  style?: string;
}