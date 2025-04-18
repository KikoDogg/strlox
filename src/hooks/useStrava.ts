
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

export type StravaProfile = {
  id: number;
  firstname: string;
  lastname: string;
  profile: string;
};

export type StravaActivity = {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date: string;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  map: {
    summary_polyline: string;
  };
};

export function useStrava() {
  const { user } = useAuth();
  const [stravaProfile, setStravaProfile] = useState<any>(null);
  const [stravaConnected, setStravaConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  useEffect(() => {
    if (user) {
      loadStravaProfile();
    } else {
      setStravaConnected(false);
      setStravaProfile(null);
      setIsLoading(false);
    }
  }, [user]);

  const loadStravaProfile = async () => {
    try {
      setIsLoading(true);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) {
        throw error;
      }

      if (profile?.strava_athlete_id) {
        setStravaConnected(true);
        setStravaProfile(profile);
        
        // Check if token needs refresh
        if (profile.strava_token_expires_at && profile.strava_token_expires_at * 1000 < Date.now()) {
          await refreshStravaToken(profile.strava_refresh_token);
        }
      } else {
        setStravaConnected(false);
      }
    } catch (error) {
      console.error("Error loading Strava profile:", error);
      toast({
        title: "Error",
        description: "Failed to load Strava profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const connectStrava = () => {
    // Use window.location.origin to get the current origin for redirect_uri
    const redirectUri = `${window.location.origin}/strava-callback`;
    const scope = "read,activity:read";
    
    // Make sure to properly encode the redirect URI
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=154336&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&approval_prompt=auto&scope=${scope}`;
    
    window.location.href = authUrl;
  };

  const handleStravaCallback = async (code: string) => {
    try {
      // Better error handling for the edge function call
      const response = await supabase.functions.invoke("strava-auth", {
        body: { code, action: "exchange" },
      });
      
      if (response.error) {
        console.error("Strava auth invoke error:", response.error);
        throw new Error(response.error.message || "Failed to connect Strava");
      }
      
      if (!response.data) {
        console.error("No data returned from Strava auth");
        throw new Error("No data returned from Strava authentication");
      }
      
      const { access_token, refresh_token, expires_at, athlete } = response.data;
      
      if (!access_token || !refresh_token || !athlete) {
        console.error("Invalid response from Strava auth:", response.data);
        throw new Error("Invalid response from Strava authentication");
      }
      
      // Save tokens and athlete data
      const { error } = await supabase
        .from("profiles")
        .update({
          strava_athlete_id: athlete.id,
          strava_access_token: access_token,
          strava_refresh_token: refresh_token,
          strava_token_expires_at: expires_at,
          first_name: athlete.firstname,
          last_name: athlete.lastname,
          profile_picture: athlete.profile,
          // Use ISO string for date
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);
      
      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }
      
      setStravaConnected(true);
      setStravaProfile({
        strava_athlete_id: athlete.id,
        strava_access_token: access_token,
        strava_refresh_token: refresh_token,
        strava_token_expires_at: expires_at,
        first_name: athlete.firstname,
        last_name: athlete.lastname,
        profile_picture: athlete.profile,
      });
      
      toast({
        title: "Success!",
        description: "Your Strava account has been connected.",
      });
      
      return true;
    } catch (error) {
      console.error("Error connecting Strava:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect your Strava account. " + (error.message || ""),
        variant: "destructive",
      });
      return false;
    }
  };

  const refreshStravaToken = async (refreshToken: string) => {
    try {
      const response = await supabase.functions.invoke("strava-auth", {
        body: { refresh_token: refreshToken, action: "refresh" },
      });
      
      if (response.error || !response.data) {
        console.error("Error refreshing token:", response.error || "No data returned");
        throw new Error("Failed to refresh token");
      }
      
      const { access_token, refresh_token, expires_at } = response.data;
      
      if (!access_token) {
        throw new Error("Invalid token response");
      }
      
      // Update tokens in database
      await supabase
        .from("profiles")
        .update({
          strava_access_token: access_token,
          strava_refresh_token: refresh_token,
          strava_token_expires_at: expires_at,
          // Use ISO string for date
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);
      
      // Update local state
      setStravaProfile((prev: any) => ({
        ...prev,
        strava_access_token: access_token,
        strava_refresh_token: refresh_token,
        strava_token_expires_at: expires_at,
      }));
      
      return access_token;
    } catch (error) {
      console.error("Error refreshing token:", error);
      toast({
        title: "Error",
        description: "Failed to refresh Strava token",
        variant: "destructive",
      });
      return null;
    }
  };

  // Better error handling for fetching activities
  const fetchActivities = async (page = 1) => {
    if (!stravaConnected || !stravaProfile?.strava_access_token) {
      return;
    }

    try {
      setIsLoadingActivities(true);

      let accessToken = stravaProfile.strava_access_token;
      
      // Check if token needs refresh
      if (stravaProfile.strava_token_expires_at * 1000 < Date.now()) {
        accessToken = await refreshStravaToken(stravaProfile.strava_refresh_token);
        if (!accessToken) return;
      }

      // Fetch activities from Strava
      const response = await supabase.functions.invoke("strava-auth", {
        body: {
          access_token: accessToken,
          page,
          per_page: 30,
          action: "fetch_activities",
        },
      });
      
      if (response.error || !response.data) {
        console.error("Error fetching activities:", response.error || "No data returned");
        throw new Error("Failed to fetch activities");
      }
      
      const stravaActivities = response.data;
      
      // Skip saving to database for now - just display activities
      setActivities(stravaActivities as unknown as StravaActivity[]);
      
      return stravaActivities;
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast({
        title: "Error",
        description: "Failed to fetch activities",
        variant: "destructive",
      });
    } finally {
      setIsLoadingActivities(false);
    }
  };

  const disconnectStrava = async () => {
    try {
      // Just remove token from database
      await supabase
        .from("profiles")
        .update({
          strava_athlete_id: null,
          strava_access_token: null,
          strava_refresh_token: null,
          strava_token_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);
      
      setStravaConnected(false);
      setStravaProfile(null);
      
      toast({
        title: "Success!",
        description: "Your Strava account has been disconnected.",
      });
    } catch (error) {
      console.error("Error disconnecting Strava:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect your Strava account",
        variant: "destructive",
      });
    }
  };

  return {
    stravaConnected,
    stravaProfile,
    connectStrava,
    disconnectStrava,
    handleStravaCallback,
    isLoading,
    activities,
    isLoadingActivities,
    fetchActivities,
  };
}
