
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, email, password, normalized_email } = await req.json();

    if (action === "setup") {
      if (!email || !password || !normalized_email) {
        return new Response(
          JSON.stringify({ error: "Missing required parameters" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      // Get user ID from the request
      const authHeader = req.headers.get("Authorization") || "";
      const token = authHeader.replace("Bearer ", "");
      
      // Verify the JWT token and get the user
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.error("Authentication error:", authError);
        return new Response(
          JSON.stringify({ error: "Authentication error" }),
          { 
            status: 401, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      // "Encrypt" the password (in a real app, you'd use proper encryption)
      // For this demo, we'll use a simple Base64 encoding
      // NOTE: This is NOT secure for production use
      const password_encrypted = btoa(password);

      // Store Garmin credentials - Now we're using upsert with a unique constraint
      const { error: insertError } = await supabase
        .from("garmin_credentials")
        .upsert({
          user_id: user.id,
          email,
          password_encrypted,
          normalized_email,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id", // Specify the column that has a unique constraint
        });

      if (insertError) {
        console.error("Error storing Garmin credentials:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to store credentials: " + insertError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    else if (action === "sync") {
      if (!normalized_email) {
        return new Response(
          JSON.stringify({ error: "Missing normalized_email parameter" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      // Get user ID from the request
      const authHeader = req.headers.get("Authorization") || "";
      const token = authHeader.replace("Bearer ", "");
      
      // Verify the JWT token and get the user
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !user) {
        console.error("Authentication error:", authError);
        return new Response(
          JSON.stringify({ error: "Authentication error" }),
          { 
            status: 401, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      // In a real application, you would trigger an async process here
      // For this demo, we'll just update the last_sync timestamp
      const { error: updateError } = await supabase
        .from("garmin_credentials")
        .update({
          last_sync: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("normalized_email", normalized_email);

      if (updateError) {
        console.error("Error updating Garmin credentials:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update sync status: " + updateError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      // In a real implementation, you would:
      // 1. Fetch .tcx files from Garmin Connect
      // 2. Process them
      // 3. Upload to Strava if needed
      // 4. This would be done asynchronously

      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Sync process initiated. This will run in the background."
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    else {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
