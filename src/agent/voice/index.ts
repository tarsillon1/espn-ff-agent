import { GoogleGenAI } from "@google/genai";
import mime from "mime";

const apiKey = process.env.GOOGLE_TTS_API_KEY;

export async function generateVoice(style: string, text: string) {
  if (!apiKey) {
    console.warn("GOOGLE_TTS_API_KEY is not set");
    return undefined;
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const model = "gemini-2.5-pro-preview-tts";
  const contents = [
    {
      role: "user",
      parts: [{ text: style + ": " + text }],
    },
  ];

  const response = await ai.models.generateContent({
    model,
    config: {
      temperature: 1,
      responseModalities: ["audio"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: "Orus",
          },
        },
      },
    },
    contents,
  });

  const chunk = response.candidates?.[0];

  if (!chunk) {
    throw new Error("No candidates");
  }

  if (!chunk.content || !chunk.content.parts) {
    throw new Error("No content");
  }

  if (chunk.content.parts[0].inlineData) {
    const inlineData = chunk.content.parts[0].inlineData;
    let fileExtension = mime.getExtension(inlineData.mimeType || "");
    let buffer = Buffer.from(inlineData.data || "", "base64");
    if (!fileExtension) {
      fileExtension = "wav";
      buffer = convertToWav(inlineData.data || "", inlineData.mimeType || "");
    }
    return buffer;
  }
}

interface WavConversionOptions {
  numChannels: number;
  sampleRate: number;
  bitsPerSample: number;
}

function convertToWav(rawData: string, mimeType: string) {
  const options = parseMimeType(mimeType);
  const wavHeader = createWavHeader(rawData.length, options);
  const buffer = Buffer.from(rawData, "base64");

  return Buffer.concat([wavHeader, buffer]);
}

function parseMimeType(mimeType: string) {
  const [fileType, ...params] = mimeType.split(";").map((s) => s.trim());
  const [_, format] = fileType.split("/");

  const options: Partial<WavConversionOptions> = {
    numChannels: 1,
  };

  if (format && format.startsWith("L")) {
    const bits = parseInt(format.slice(1), 10);
    if (!isNaN(bits)) {
      options.bitsPerSample = bits;
    }
  }

  for (const param of params) {
    const [key, value] = param.split("=").map((s) => s.trim());
    if (key === "rate") {
      options.sampleRate = parseInt(value, 10);
    }
  }

  return options as WavConversionOptions;
}

function createWavHeader(dataLength: number, options: WavConversionOptions) {
  const { numChannels, sampleRate, bitsPerSample } = options;

  // http://soundfile.sapp.org/doc/WaveFormat

  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const buffer = Buffer.alloc(44);

  buffer.write("RIFF", 0); // ChunkID
  buffer.writeUInt32LE(36 + dataLength, 4); // ChunkSize
  buffer.write("WAVE", 8); // Format
  buffer.write("fmt ", 12); // Subchunk1ID
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22); // NumChannels
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(byteRate, 28); // ByteRate
  buffer.writeUInt16LE(blockAlign, 32); // BlockAlign
  buffer.writeUInt16LE(bitsPerSample, 34); // BitsPerSample
  buffer.write("data", 36); // Subchunk2ID
  buffer.writeUInt32LE(dataLength, 40); // Subchunk2Size

  return buffer;
}
