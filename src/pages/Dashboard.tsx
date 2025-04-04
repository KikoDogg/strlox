
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStrava } from "@/hooks/useStrava";
import { ActivityList } from "@/components/ActivityList";
import { ActivityStats } from "@/components/ActivityStats";
import { GarminConnect } from "@/components/GarminConnect";
import { ChangePassword } from "@/components/ChangePassword";

const Dashboard = () => {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { stravaConnected, connectStrava, activities, fetchActivities, isLoadingActivities } = useStrava();
  const [activeTab, setActiveTab] = useState("activities");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (stravaConnected) {
      fetchActivities();
    }
  }, [stravaConnected, fetchActivities]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-orange-600">Strava Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">{user.email}</span>
            <button
              onClick={() => signOut()}
              className="rounded-md bg-orange-100 px-3 py-1.5 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <main className="container mx-auto flex-1 px-4 py-8">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="connect">Accounts</TabsTrigger>
            <TabsTrigger value="garmin">Garmin</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="activities" className="space-y-8">
            {stravaConnected ? (
              <>
                <ActivityStats activities={activities} />
                <ActivityList activities={activities} isLoading={isLoadingActivities} />
              </>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow">
                <h3 className="mb-4 text-lg font-semibold">Connect Your Strava Account</h3>
                <p className="mb-4 text-gray-600">
                  Connect your Strava account to view your activities and stats.
                </p>
                <button
                  onClick={connectStrava}
                  className="rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
                >
                  Connect Strava
                </button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="connect">
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow">
              {stravaConnected ? (
                <div className="text-green-600">
                  Your Strava account is connected. 🎉
                </div>
              ) : (
                <div>
                  <h3 className="mb-4 text-lg font-semibold">Connect Your Strava Account</h3>
                  <p className="mb-4 text-gray-600">
                    Connect your Strava account to view your activities and stats.
                  </p>
                  <button
                    onClick={connectStrava}
                    className="rounded-md bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
                  >
                    Connect Strava
                  </button>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="garmin">
            <GarminConnect />
          </TabsContent>
          <TabsContent value="settings">
            <div className="space-y-6">
              <ChangePassword />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
