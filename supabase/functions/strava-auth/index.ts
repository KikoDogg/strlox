
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const STRAVA_CLIENT_ID = Deno.env.get("STRAVA_CLIENT_ID") || "154336";
const STRAVA_CLIENT_SECRET = Deno.env.get("STRAVA_CLIENT_SECRET") || "3c89b71d9decce76797c9595728306040d98df04";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { code, action, refresh_token } = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    if (action === "exchange") {
      console.log("Exchanging authorization code for tokens");
      // Exchange authorization code for tokens
      const response = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          code: code,
          grant_type: "authorization_code",
        }),
      });

      const data = await response.json();
      console.log("Token exchange response:", data);
      
      if (data.errors) {
        return new Response(JSON.stringify({ error: data.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } 
    else if (action === "refresh") {
      // Refresh access token
      console.log("Refreshing access token");
      const response = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          refresh_token: refresh_token,
          grant_type: "refresh_token",
        }),
      });

      const data = await response.json();
      console.log("Token refresh response:", data);
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    else if (action === "fetch_activities") {
      // Fetch athlete activities
      const { access_token, page = 1, per_page = 30 } = await req.json();
      console.log(`Fetching activities page ${page}`);
      
      const response = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?page=${page}&per_page=${per_page}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      const data = await response.json();
      console.log(`Fetched ${data.length} activities`);
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
