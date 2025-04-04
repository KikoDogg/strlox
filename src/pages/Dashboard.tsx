
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStrava } from "@/hooks/useStrava";
import { useAuth } from "@/context/AuthContext";
import ActivityList from "@/components/ActivityList";
import ActivityStats from "@/components/ActivityStats";
import GarminConnect from "@/components/GarminConnect";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
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
  const [activeTab, setActiveTab] = useState("overview");
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
                  className="h-16 w-16 rounded-full border-2 border-orange-500"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">
                  Welcome, {stravaProfile.first_name} {stravaProfile.last_name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your fitness data
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold">Welcome to Your Fitness Dashboard</h1>
              <p className="text-muted-foreground">
                Connect your accounts to see your activity data
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {stravaConnected ? (
            <>
              <Button onClick={handleRefresh} disabled={isLoadingActivities} className="bg-orange-500 hover:bg-orange-600">
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

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="w-full max-w-md mb-6">
          <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
          <TabsTrigger value="connections" className="flex-1">Connections</TabsTrigger>
          <TabsTrigger value="activities" className="flex-1">Activities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {stravaConnected && activities && activities.length > 0 ? (
            <ActivityStats activities={activities} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-medium mb-2">Connect your accounts</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your Strava or Garmin account to see your activities and stats
                </p>
                <div className="flex justify-center gap-4">
                  {!stravaConnected && (
                    <Button onClick={connectStrava} className="bg-orange-500 hover:bg-orange-600">
                      Connect Strava
                    </Button>
                  )}
                  <Button onClick={() => setActiveTab("connections")} variant="outline">
                    Manage Connections
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="connections">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Strava Connection</h3>
                {stravaConnected ? (
                  <div className="space-y-4">
                    <div className="rounded-md bg-green-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="h-5 w-5 rounded-full bg-green-400 flex items-center justify-center">
                            <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">
                            Connected to Strava as {stravaProfile?.first_name} {stravaProfile?.last_name}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleRefresh} disabled={isLoadingActivities} className="bg-orange-500 hover:bg-orange-600">
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Refresh
                      </Button>
                      <Button variant="outline" onClick={disconnectStrava}>
                        Disconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                      Connect your Strava account to import your activities
                    </p>
                    <Button onClick={connectStrava} className="bg-orange-500 hover:bg-orange-600">
                      Connect with Strava
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <GarminConnect />
          </div>
        </TabsContent>
        
        <TabsContent value="activities">
          <h2 className="mb-4 text-xl font-semibold">Your Activities</h2>
          <ActivityList
            activities={activities}
            isLoading={isLoadingActivities}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
