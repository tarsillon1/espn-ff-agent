import { generateFFText } from "@/agent/fantasy-football";
import { chunkAndSendFollowup, sendAudioFollowup } from "../followup";
import { generateVoice } from "@/agent/voice";
import { podcastStylePrompt } from "@/agent/prompt";

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
    const response = await generateFFText(prompt);

    await chunkAndSendFollowup(applicationId, token, response.text);

    console.log("generating voice for commentary");

    const voice = await generateVoice(podcastStylePrompt, response.text);

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
