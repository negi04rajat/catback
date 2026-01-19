import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Helper to base64url-encode a Uint8Array
function base64UrlEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function getGoogleAccessToken(): Promise<string> {
  const serviceAccountEmail = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  let serviceAccountPrivateKey = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");

  if (!serviceAccountEmail || !serviceAccountPrivateKey) {
    throw new Error("Missing Google service account configuration");
  }

  // Handle case where newlines are stored as literal \n strings
  serviceAccountPrivateKey = serviceAccountPrivateKey.replace(/\\n/g, "\n");
  
  // Remove surrounding quotes if present (common when pasting JSON values)
  serviceAccountPrivateKey = serviceAccountPrivateKey.trim().replace(/^["']|["']$/g, "");

  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: serviceAccountEmail,
    sub: serviceAccountEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encoder = new TextEncoder();
  const encodedHeader = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // Import the private key (PEM) for signing
  // Remove BEGIN/END markers and all whitespace (including newlines)
  const pem = serviceAccountPrivateKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  
  if (!pem || pem.length === 0) {
    throw new Error("Invalid private key format: empty after parsing");
  }
  
  let rawKey: Uint8Array;
  try {
    rawKey = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  } catch (e) {
    throw new Error(`Failed to decode private key base64: ${e instanceof Error ? e.message : String(e)}`);
  }

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    rawKey.buffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );

  const signature = new Uint8Array(
    await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      encoder.encode(unsignedToken),
    ),
  );

  const signedJwt = `${unsignedToken}.${base64UrlEncode(signature)}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedJwt,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error("Failed to obtain Google access token:", errorText);
    throw new Error("Failed to obtain Google access token");
  }

  const tokenJson = await tokenResponse.json() as { access_token?: string };
  if (!tokenJson.access_token) {
    throw new Error("Google access token missing in response");
  }

  return tokenJson.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { uid, email, name, role } = await req.json();

    if (!uid || !email || !name || !role) {
      throw new Error("Missing required fields");
    }

    const GOOGLE_SHEET_ID = Deno.env.get("GOOGLE_SHEET_ID");

    if (!GOOGLE_SHEET_ID) {
      throw new Error("Missing Google Sheets configuration");
    }

    const accessToken = await getGoogleAccessToken();

    const baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}`;
    const sheetName = "Users";

    console.log("User registration data:", { uid, email, name, role });

    const values = [[
      uid,
      email,
      name,
      role,
      new Date().toISOString(),
    ]];

    const appendResponse = await fetch(
      `${baseUrl}/values/${sheetName}!A2:E2:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ values }),
      },
    );

    if (!appendResponse.ok) {
      const errorText = await appendResponse.text();
      console.error("Failed to append user to Google Sheets:", errorText);
      throw new Error("Failed to append user to Google Sheets");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "User data appended to Users sheet.",
        user: { uid, email, name, role, createdAt: new Date().toISOString() },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
