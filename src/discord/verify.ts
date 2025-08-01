import nacl from "tweetnacl";

export function verifyDiscordRequest(
  headers: Record<string, string>,
  body: string,
  publicKey: string
) {
  const signature = headers["x-signature-ed25519"];
  const timestamp = headers["x-signature-timestamp"];

  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, "hex"),
    Buffer.from(publicKey, "hex")
  );

  return isVerified;
}
