type AdminTokenPayload = {
  u: string;
  exp: number;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64FromBytes(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function bytesFromBase64(base64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return Uint8Array.from(Buffer.from(base64, "base64"));
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64urlEncode(input: Uint8Array | string): string {
  const bytes = typeof input === "string" ? encoder.encode(input) : input;
  return base64FromBytes(bytes).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64urlDecodeToBytes(input: string): Uint8Array {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4;
  const padded = pad ? normalized + "=".repeat(4 - pad) : normalized;
  return bytesFromBase64(padded);
}

function base64urlDecodeToString(input: string): string {
  const bytes = base64urlDecodeToBytes(input);
  return decoder.decode(bytes);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

async function hmac(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64urlEncode(new Uint8Array(sig));
}

export async function signAdminCookie(username: string, ttlDays = 7): Promise<string> {
  const secret = process.env.ADMIN_AUTH_SECRET;
  if (!secret) throw new Error("ADMIN_AUTH_SECRET não definido.");

  const exp = Math.floor(Date.now() / 1000) + ttlDays * 24 * 60 * 60;
  const payload: AdminTokenPayload = { u: username, exp };

  const payloadB64 = base64urlEncode(JSON.stringify(payload));
  const sig = await hmac(payloadB64, secret);

  return `${payloadB64}.${sig}`;
}

export async function verifyAdminCookie(token: string): Promise<boolean> {
  const secret = process.env.ADMIN_AUTH_SECRET;
  if (!secret) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, sig] = parts;
  const expected = await hmac(payloadB64, secret);

  if (!timingSafeEqual(base64urlDecodeToBytes(sig), base64urlDecodeToBytes(expected))) return false;

  try {
    const json = base64urlDecodeToString(payloadB64);
    const payload = JSON.parse(json) as AdminTokenPayload;

    if (!payload?.u || !payload?.exp) return false;
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;

    return true;
  } catch {
    return false;
  }
}
