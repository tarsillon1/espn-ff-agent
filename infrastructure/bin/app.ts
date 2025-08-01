#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { FFDiscordBotStack } from "../lib/ff-discord-bot-stack";

import "dotenv/config";

const app = new cdk.App();
new FFDiscordBotStack(app, "FFDiscordBotStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || "us-east-1",
  },
});
