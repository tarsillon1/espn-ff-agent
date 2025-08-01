import { generateCommentaryText } from "@/agent/commentator";
import { chunkAndSendFollowup, sendAudioFollowup } from "../followup";
import { generateVoice } from "@/agent/voice";
import { sportsAnnouncerPrompt } from "@/agent/prompt";

// this is a manually invoked lambda
export async function handler({
  applicationId,
  token,
  prompt,
}: {
  applicationId: string;
  token: string;
  prompt: string;
}) {
  try {
    const response = await generateCommentaryText(prompt);

    await chunkAndSendFollowup(applicationId, token, response.text);

    console.log("generating voice for commentary");

    const voice = await generateVoice(sportsAnnouncerPrompt, response.text);

    console.log("sending file followup");

    if (voice) {
      await sendAudioFollowup(applicationId, token, voice, "voice.wav");
    } else {
      console.warn("Failed to generaxte voice");
    }
  } catch (err) {
    console.error("Failed to generate commentary", err);
  }
}
