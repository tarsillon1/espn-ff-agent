import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { handleInteraction } from "./interaction";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || "{}");

    if (body.type === 1) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: 1 }),
      };
    }

    if (body.type === 0 && body.t === "MESSAGE_CREATE") {
      const message = body.d;
      const response = await handleInteraction(message);
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(response),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error("Lambda function error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal server error",
      }),
    };
  }
};
