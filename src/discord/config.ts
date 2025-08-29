export const discordClientId = process.env.DISCORD_CLIENT_ID!;
export const discordPublicKey = process.env.DISCORD_PUBLIC_KEY!;
export const discordToken = process.env.DISCORD_TOKEN!;
export const cronIntervalMs = parseInt(process.env.CRON_INTERVAL_MS || "0");
export const generateQueueUrl = process.env.GENERATE_SQS_QUEUE_URL!;
export const voipQueueUrl = process.env.VOIP_SQS_QUEUE_URL!;
