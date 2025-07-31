import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "path";
import { Construct } from "constructs";

export class FFDiscordBotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const discordBotFunction = new lambda.Function(
      this,
      "FFDiscordBotFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "lambda.handler",
        code: lambda.Code.fromAsset(path.join(__dirname, "../../src/discord")),
        timeout: cdk.Duration.seconds(30),
        memorySize: 512,
        environment: {
          DISCORD_TOKEN: process.env.DISCORD_TOKEN || "",
          DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID || "",
          ESPN_SWID: process.env.ESPN_SWID || "",
          ESPN_S2: process.env.ESPN_S2 || "",
          LEAGUE_ID: process.env.LEAGUE_ID || "",
          ESPN_YEAR: process.env.ESPN_YEAR || "",
          GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || "",
        },
      }
    );

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
    const integration = new apigateway.LambdaIntegration(discordBotFunction);
    webhook.addMethod("POST", integration);

    new cdk.CfnOutput(this, "ApiGatewayUrl", {
      value: `${api.url}discord/webhook`,
      description:
        "Discord webhook URL to configure in Discord Developer Portal",
    });

    discordBotFunction.addPermission("ApiGatewayInvoke", {
      principal: new iam.ServicePrincipal("apigateway.amazonaws.com"),
      sourceArn: `${api.url}/*/*`,
    });
  }
}
