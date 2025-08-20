export type AskLambdaEvent = {
  applicationId: string;
  token: string;
  prompt: string;
  voiceChannelId: string;
  guildId: string;
  memberId?: string;
  season?: number;
  system?: string;
}