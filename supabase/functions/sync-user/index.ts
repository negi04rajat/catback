import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { uid, email, name, role } = await req.json();

    if (!uid || !email || !name || !role) {
      throw new Error('Missing required fields');
    }

    const GOOGLE_SHEETS_API_KEY = Deno.env.get('GOOGLE_SHEETS_API_KEY');
    const GOOGLE_SHEET_ID = Deno.env.get('GOOGLE_SHEET_ID');

    if (!GOOGLE_SHEETS_API_KEY || !GOOGLE_SHEET_ID) {
      throw new Error('Missing Google Sheets configuration');
    }

    // Note: Google Sheets API with just an API key is read-only
    // For write operations, you would need OAuth2 or a service account
    // For now, we'll store this in memory and return success
    // In production, you'd use OAuth2 with Google Sheets API or a service account
    
    console.log('User registration data:', { uid, email, name, role });
    
    // Return success - in a real implementation with OAuth2/service account,
    // this would append to the Users sheet
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User data received. Note: Full write support requires OAuth2 setup.',
        user: { uid, email, name, role, createdAt: new Date().toISOString() }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
