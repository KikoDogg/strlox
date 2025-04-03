
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStrava } from "@/hooks/useStrava";
import { useAuth } from "@/context/AuthContext";
import ActivityList from "@/components/ActivityList";
import ActivityStats from "@/components/ActivityStats";
import { Button } from "@/components/ui/button";
import { LogOut, RefreshCcw } from "lucide-react";

const Dashboard: React.FC = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const {
    stravaConnected,
    stravaProfile,
    isLoading,
    activities,
    isLoadingActivities,
    fetchActivities,
    connectStrava,
    disconnectStrava,
  } = useStrava();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (stravaConnected) {
      fetchActivities();
    }
  }, [stravaConnected]);

  const handleRefresh = () => {
    fetchActivities();
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          {stravaConnected && stravaProfile ? (
            <div className="flex items-center gap-4">
              {stravaProfile.profile_picture && (
                <img
                  src={stravaProfile.profile_picture}
                  alt="Profile"
                  className="h-16 w-16 rounded-full"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">
                  Welcome, {stravaProfile.first_name} {stravaProfile.last_name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Strava Account Connected
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold">Welcome to Your Strava Stats</h1>
              <p className="text-muted-foreground">
                Connect your Strava account to see your activity data
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {stravaConnected ? (
            <>
              <Button onClick={handleRefresh} disabled={isLoadingActivities}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
              <Button variant="outline" onClick={disconnectStrava}>
                Disconnect Strava
              </Button>
            </>
          ) : (
            <Button onClick={connectStrava} className="bg-orange-500 hover:bg-orange-600">
              Connect with Strava
            </Button>
          )}
          <Button variant="destructive" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {stravaConnected ? (
        <>
          {activities && activities.length > 0 ? (
            <div className="space-y-8">
              <ActivityStats activities={activities} />
              <div>
                <h2 className="mb-4 text-xl font-semibold">Recent Activities</h2>
                <ActivityList
                  activities={activities}
                  isLoading={isLoadingActivities}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              {isLoadingActivities ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
                  <p>Loading your activities...</p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-medium">No activities found</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    We couldn't find any activities in your Strava account.
                  </p>
                  <Button
                    onClick={handleRefresh}
                    className="mt-4"
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <h3 className="text-lg font-medium">Connect your Strava account</h3>
          <p className="mt-2 text-sm text-gray-500">
            Connect your Strava account to see your activities and stats
          </p>
          <Button
            onClick={connectStrava}
            className="mt-4 bg-orange-500 hover:bg-orange-600"
          >
            Connect with Strava
          </Button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
