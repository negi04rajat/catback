import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface AuthParams {
  token: string;
  expire: number;
  signature: string;
}

async function generateAuthParams(privateKey: string): Promise<AuthParams> {
  const expire = Math.floor(Date.now() / 1000) + 60 * 10; // expires in 10 minutes
  const token = crypto.randomUUID();

  const encoder = new TextEncoder();
  const keyData = encoder.encode(privateKey);
  const msgData = encoder.encode(token + expire);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );

  const sigBuffer = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
  const sigArray = new Uint8Array(sigBuffer);

  // Convert signature to hex string
  const signature = Array.from(sigArray).map(b => b.toString(16).padStart(2, "0")).join("");

  return { token, expire, signature };
}

serve(async (req) => {
  try {
    const privateKey = Deno.env.get("IMAGEKIT_PRIVATE_KEY");

    if (!privateKey) {
      throw new Error("Missing IMAGEKIT_PRIVATE_KEY environment variable");
    }

    const auth = await generateAuthParams(privateKey);

    return new Response(JSON.stringify(auth), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error in imagekit-auth function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
