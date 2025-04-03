
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStrava } from "@/hooks/useStrava";

const StravaCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { handleStravaCallback } = useStrava();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Processing your Strava authorization...");
  
  useEffect(() => {
    const processOAuth = async () => {
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      
      if (error) {
        setStatus("Authorization was denied or an error occurred.");
        setTimeout(() => navigate("/"), 3000);
        return;
      }
      
      if (!code) {
        setStatus("No authorization code received.");
        setTimeout(() => navigate("/"), 3000);
        return;
      }
      
      const success = await handleStravaCallback(code);
      
      if (success) {
        setStatus("Successfully connected to Strava! Redirecting...");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setStatus("Failed to connect to Strava. Please try again.");
        setTimeout(() => navigate("/"), 3000);
      }
    };
    
    processOAuth();
  }, [searchParams, handleStravaCallback, navigate]);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-orange-500 to-orange-600">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
          <h1 className="text-2xl font-bold text-gray-900">Connecting to Strava</h1>
          <p className="text-center text-gray-600">{status}</p>
        </div>
      </div>
    </div>
  );
};

export default StravaCallback;
