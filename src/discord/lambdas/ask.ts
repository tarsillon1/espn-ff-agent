import { generateFFText } from "@/agent/fantasy-football";
import { chunkAndSendFollowup, sendAudioFollowup } from "../followup";
import { streamVoice } from "@/agent/voice/openai";
import { podcastStylePrompt } from "@/agent/prompt";
import { createVoipClient, findVoiceChannel } from "../voip";
import { Readable } from "stream";

// Helper function to convert web ReadableStream to Buffer
async function webStreamToBuffer(webStream: ReadableStream): Promise<Buffer> {
  const reader = webStream.getReader();
  const chunks: Uint8Array[] = [];

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  // Concatenate all chunks into a single buffer
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const buffer = Buffer.allocUnsafe(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.length;
  }

  return buffer;
}

// this is a manually invoked lambda
export async function handler({
  applicationId,
  token,
  prompt,
  voiceChannelId,
  guildId,
  memberId,
}: {
  applicationId: string;
  token: string;
  prompt: string;
  voiceChannelId: string;
  guildId: string;
  memberId: string;
}) {
  try {
    console.log("generating text");

    const response = await generateFFText(prompt);
    await chunkAndSendFollowup(applicationId, token, response.text);

    console.log("generating voice for commentary");

    const voice = await streamVoice(podcastStylePrompt, response.text);
    const [voipStream, followupStream] = voice.tee();

    console.log("creating voip client");

    const channel = await findVoiceChannel(guildId, voiceChannelId, memberId);
    if (!channel) {
      console.warn("failed to find voice channel");
      return;
    }

    const voip = await createVoipClient(channel);
    if (!voip) {
      console.warn("failed to create voip client");
      return;
    }

    console.log("playing voice");

    await voip.play(Readable.from(voipStream));
    voip.close();

    console.log("sending audio file followup");

    await sendAudioFollowup(
      applicationId,
      token,
      await new Response(followupStream).arrayBuffer(),
      "commentary.wav"
    );
  } catch (err) {
    console.error("Failed to generate commentary", err);
  }
}
