import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";
import * as path from "path";
import { Construct } from "constructs";
import { aws_lambda_nodejs } from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";

export class FFDiscordBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create standard queue for generate messages (no FIFO needed)
    const generateQueue = new sqs.Queue(this, "GenerateQueue", {
      queueName: "discord-generate-queue",
      visibilityTimeout: cdk.Duration.minutes(5),
      retentionPeriod: cdk.Duration.days(4),
    });

    // Create FIFO queue for VoIP messages, partitioned by guildId
    const voipQueue = new sqs.Queue(this, "VoipQueue", {
      queueName: "discord-voip-queue.fifo",
      fifo: true,
      fifoThroughputLimit: sqs.FifoThroughputLimit.PER_MESSAGE_GROUP_ID,
      contentBasedDeduplication: true,
      visibilityTimeout: cdk.Duration.minutes(16),
      retentionPeriod: cdk.Duration.days(4),
    });

    const discordInteractionLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      "FFDiscordInteractionLambda",
      {
        runtime: Runtime.NODEJS_20_X,
        handler: "handler",
        entry: path.join(__dirname, "../../src/discord/lambdas/interaction.ts"),
        timeout: cdk.Duration.seconds(60),
        memorySize: 512,
        environment: {
          DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || "",
          DISCORD_PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY || "",
          GENERATE_SQS_QUEUE_URL: generateQueue.queueUrl,
        },
      }
    );

    const generateLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      "GenerateLambda",
      {
        runtime: Runtime.NODEJS_20_X,
        handler: "handler",
        entry: path.join(__dirname, "../../src/discord/lambdas/generate.ts"),
        timeout: cdk.Duration.minutes(5),
        memorySize: 512,
        environment: {
          ESPN_SWID: process.env.ESPN_SWID || "",
          ESPN_S2: process.env.ESPN_S2 || "",
          ESPN_LEAGUE_ID: process.env.ESPN_LEAGUE_ID || "",
          ESPN_YEAR: process.env.ESPN_YEAR || "",
          GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || "",
          GOOGLE_GENERATIVE_AI_API_KEY:
            process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
          GOOGLE_TTS_API_KEY: process.env.GOOGLE_TTS_API_KEY || "",
          DISCORD_TOKEN: process.env.DISCORD_TOKEN || "",
          OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
          SERPER_API_KEY: process.env.SERPER_API_KEY || "",
          VOIP_SQS_QUEUE_URL: voipQueue.queueUrl,
        },
      }
    );

    const voipLambda = new aws_lambda_nodejs.NodejsFunction(
      this,
      "VoipLambda",
      {
        runtime: Runtime.NODEJS_20_X,
        handler: "handler",
        entry: path.join(__dirname, "../../src/discord/lambdas/voip.ts"),
        timeout: cdk.Duration.minutes(15),
        memorySize: 512,
        environment: {
          DISCORD_TOKEN: process.env.DISCORD_TOKEN || "",
          OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
        },
        bundling: {
          nodeModules: ["@discordjs/voice"],
        },
      }
    );

    // Grant permissions for SQS operations
    discordInteractionLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["sqs:SendMessage"],
        resources: [generateQueue.queueArn],
      })
    );

    generateLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["sqs:SendMessage"],
        resources: [voipQueue.queueArn],
      })
    );

    voipLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
        ],
        resources: [voipQueue.queueArn],
      })
    );

    // Create event source mapping for generate queue
    generateLambda.addEventSource(
      new lambdaEventSources.SqsEventSource(generateQueue, {
        batchSize: 1,
        maxBatchingWindow: cdk.Duration.seconds(0),
      })
    );

    // Create event source mapping for voip queue
    voipLambda.addEventSource(new lambdaEventSources.SqsEventSource(voipQueue));

    const api = new apigateway.RestApi(this, "FFDiscordBotApi", {
      restApiName: "Discord Bot API",
      description: "API Gateway for Discord bot webhook",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
        ],
      },
    });

    const webhook = api.root.addResource("discord").addResource("webhook");
    const integration = new apigateway.LambdaIntegration(
      discordInteractionLambda
    );
    webhook.addMethod("POST", integration);

    new cdk.CfnOutput(this, "ApiGatewayUrl", {
      value: `${api.url}discord/webhook`,
      description:
        "Discord webhook URL to configure in Discord Developer Portal",
    });

    discordInteractionLambda.addPermission("ApiGatewayInvoke", {
      principal: new iam.ServicePrincipal("apigateway.amazonaws.com"),
      sourceArn: `${api.arnForExecuteApi()}/*/*`,
    });
  }
}
