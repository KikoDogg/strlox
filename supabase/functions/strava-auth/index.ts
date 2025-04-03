
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
    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const { action, code, refresh_token, access_token, page, per_page } = requestData;
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
      
      if (data.errors || data.message) {
        return new Response(JSON.stringify({ error: data.message || "Authorization failed" }), {
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
      
      if (data.errors || data.message) {
        return new Response(JSON.stringify({ error: data.message || "Token refresh failed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    else if (action === "fetch_activities") {
      // Fetch athlete activities
      console.log(`Fetching activities page ${page}`);
      
      if (!access_token) {
        return new Response(JSON.stringify({ error: "Access token is required" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      
      const response = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?page=${page || 1}&per_page=${per_page || 30}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching activities: ${response.status}`, errorText);
        return new Response(JSON.stringify({ error: `Strava API error: ${response.status}` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: response.status,
        });
      }

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
