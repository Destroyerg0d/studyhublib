
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is admin
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Google Sheets API endpoint
    const SHEET_ID = '1httjxvXgrI4tl35krAsW842_IfkZPIVC61-QSmuMQjI';
    const API_KEY = Deno.env.get('GOOGLE_SHEETS_API_KEY');
    
    if (!API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Google Sheets API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const range = 'Sheet1!A:M'; // Adjust range based on your sheet structure
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${API_KEY}`;

    console.log('Fetching data from Google Sheets...');
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.status}`);
    }

    const data = await response.json();
    const rows = data.values || [];
    
    if (rows.length <= 1) {
      return new Response(
        JSON.stringify({ message: 'No new data found', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Skip header row
    const dataRows = rows.slice(1);
    console.log(`Processing ${dataRows.length} rows from Google Sheets`);

    let insertedCount = 0;
    const errors = [];

    for (const row of dataRows) {
      try {
        // Map Google Sheets columns to database fields
        // Adjust indices based on your actual sheet structure
        const registrationData = {
          first_name: row[1] || '',
          last_name: row[2] || '',
          date_of_birth: row[3] ? new Date(row[3]).toISOString().split('T')[0] : null,
          gender: row[4] || '',
          email: row[5] || '',
          phone: row[6] || '',
          purpose: row[7] || '',
          preferred_study_time: row[8] || '',
          special_requirements: row[9] || null,
          terms_accepted: true,
          registration_agreed: row[11] === 'Agree, please submit my registration.' || true,
          registration_experience: row[12] || null,
          form_submitted_at: new Date().toISOString(),
          status: 'pending'
        };

        // Validate required fields
        if (!registrationData.first_name || !registrationData.last_name || 
            !registrationData.email || !registrationData.phone) {
          console.log('Skipping row with missing required fields:', registrationData);
          continue;
        }

        // Check if registration already exists
        const { data: existing } = await supabaseClient
          .from('registration_forms')
          .select('id')
          .eq('email', registrationData.email)
          .eq('first_name', registrationData.first_name)
          .eq('last_name', registrationData.last_name)
          .single();

        if (existing) {
          console.log('Registration already exists for:', registrationData.email);
          continue;
        }

        // Insert new registration
        const { error: insertError } = await supabaseClient
          .from('registration_forms')
          .insert(registrationData);

        if (insertError) {
          console.error('Insert error:', insertError);
          errors.push(`Failed to insert ${registrationData.email}: ${insertError.message}`);
        } else {
          insertedCount++;
          console.log('Successfully inserted registration for:', registrationData.email);
        }
      } catch (error) {
        console.error('Error processing row:', error, row);
        errors.push(`Error processing row: ${error.message}`);
      }
    }

    console.log(`Sync completed. Inserted: ${insertedCount}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({ 
        message: 'Sync completed',
        count: insertedCount,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
