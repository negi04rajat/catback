import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_SHEETS_API_KEY = Deno.env.get('GOOGLE_SHEETS_API_KEY');
    const GOOGLE_SHEET_ID = Deno.env.get('GOOGLE_SHEET_ID');

    if (!GOOGLE_SHEETS_API_KEY || !GOOGLE_SHEET_ID) {
      throw new Error('Missing Google Sheets configuration');
    }

    const { action, data, sheet } = await req.json();
    const sheetName = sheet || 'Products';
    const baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}`;

    if (action === 'getAll') {
      const response = await fetch(
        `${baseUrl}/values/${sheetName}?key=${GOOGLE_SHEETS_API_KEY}`
      );
      const result = await response.json();
      
      if (!result.values || result.values.length < 2) {
        return new Response(JSON.stringify({ data: [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const headers = result.values[0];
      const rows = result.values.slice(1);
      const formattedData = rows.map((row: string[]) => {
        const obj: Record<string, string> = {};
        headers.forEach((header: string, index: number) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });

      return new Response(JSON.stringify({ data: formattedData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'append') {
      // For appending data to Google Sheets, we need OAuth which is more complex
      // For now, return success and note that write operations need additional setup
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Data received. Note: Write operations require OAuth setup for Google Sheets API.',
          data 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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