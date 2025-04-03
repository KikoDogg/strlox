
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-500 to-orange-600">
      <div className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-white md:text-6xl">
            Track Your Strava Performance
          </h1>
          <p className="mb-8 text-xl text-white">
            Connect your Strava account to analyze your activities, track your progress, 
            and gain insights into your training data.
          </p>
          
          {isLoading ? (
            <div className="flex justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
            </div>
          ) : user ? (
            <Link to="/dashboard">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
              <Link to="/login">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100">
                  Sign In
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-orange-600/20">
                  Create Account
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-orange-600">Activity Tracking</h2>
            <p className="text-gray-700">
              See all your Strava activities in one place with detailed metrics and performance insights.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-orange-600">Performance Analytics</h2>
            <p className="text-gray-700">
              Visualize your progress over time with interactive charts and detailed statistics.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-orange-600">Seamless Integration</h2>
            <p className="text-gray-700">
              Connect once with Strava and automatically sync all your past and future activities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
