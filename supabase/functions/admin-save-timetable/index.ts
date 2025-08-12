import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !anonKey || !serviceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(
        JSON.stringify({ error: "Server not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Client to read the calling user from the JWT
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });

    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify admin via RPC
    const { data: isAdmin, error: adminCheckErr } = await authClient.rpc("is_admin", { user_id: user.id });
    if (adminCheckErr) {
      console.error("Admin check error:", adminCheckErr);
      return new Response(
        JSON.stringify({ error: "Authorization check failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { weekStart, weekEnd, slots } = await req.json();
    if (!weekStart || !weekEnd || !Array.isArray(slots)) {
      return new Response(
        JSON.stringify({ error: "Invalid payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Admin client to bypass RLS for write operations
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Delete existing slots in range
    const { error: deleteError } = await supabaseAdmin
      .from("timetable_slots")
      .delete()
      .gte("date", weekStart)
      .lte("date", weekEnd);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return new Response(
        JSON.stringify({ error: "Failed to delete existing slots", details: deleteError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize and insert new slots
    const sanitized = slots.map((s: any) => ({
      name: String(s.name ?? "").slice(0, 255),
      time: String(s.time ?? "00:00").slice(0, 5),
      end_time: String(s.end_time ?? "00:00").slice(0, 5),
      type: String(s.type ?? "study"),
      description: s.description ? String(s.description) : null,
      active: Boolean(s.active),
      plan_type: String(s.plan_type ?? "full_day"),
      date: String(s.date ?? weekStart),
    }));

    if (sanitized.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from("timetable_slots")
        .insert(sanitized);

      if (insertError) {
        console.error("Insert error:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to insert slots", details: insertError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, inserted: sanitized.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("Unhandled error:", e);
    return new Response(
      JSON.stringify({ error: "Internal error", details: e?.message ?? String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
