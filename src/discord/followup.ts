export async function sendInteractionAudioFollowup(
  applicationId: string,
  interactionToken: string,
  fileBuffer: ArrayBuffer,
  filename: string,
  content = "Here's your file!"
) {
  const form = new FormData();

  const payload = {
    type: 4,
    data: {
      content,
      attachments: [
        {
          id: 0,
          filename,
          description: content,
        },
      ],
    },
  };

  form.append("payload_json", JSON.stringify(payload));

  const blob = new Blob([fileBuffer], { type: "audio/wav" });
  form.append("files[0]", blob, filename);

  const url = `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}`;

  const res = await fetch(url, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord API error: ${res.status} — ${text}`);
  }
}

export async function sendInteractionFollowup(
  applicationId: string,
  interactionToken: string,
  body: object
) {
  const url = `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to send follow-up", {
      applicationId,
      interactionToken,
      body,
    });
    throw new Error(`Failed to send follow-up: ${response.status} ${error}`);
  }

  return await response.json();
}

function chunk(message: string, chunkSize: number) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function chunkAndSendInteractionFollowup(
  applicationId: string,
  interactionToken: string,
  message: string
) {
  const chunks = chunk(message, 1900);

  for (const chunk of chunks) {
    await sendInteractionFollowup(applicationId, interactionToken, {
      content: chunk,
    });
  }
}
