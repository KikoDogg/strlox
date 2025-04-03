
import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StravaActivity } from "@/hooks/useStrava";
import { CalendarDays, Map, MoveRight, Timer, TrendingUp } from "lucide-react";
import StatsCard from "@/components/StatsCard";

type ActivityStatsProps = {
  activities: any[];
};

const ActivityStats: React.FC<ActivityStatsProps> = ({ activities }) => {
  const stats = useMemo(() => {
    if (!activities || activities.length === 0) {
      return {
        totalActivities: 0,
        totalDistance: 0,
        totalDuration: 0,
        totalElevation: 0,
        averageSpeed: 0,
      };
    }

    const totalActivities = activities.length;
    const totalDistance = activities.reduce((sum, act) => sum + act.distance, 0);
    const totalDuration = activities.reduce((sum, act) => sum + act.moving_time, 0);
    const totalElevation = activities.reduce((sum, act) => sum + act.total_elevation_gain, 0);
    const averageSpeed = totalDistance / totalDuration * 3.6;

    return {
      totalActivities,
      totalDistance,
      totalDuration,
      totalElevation,
      averageSpeed,
    };
  }, [activities]);

  const chartData = useMemo(() => {
    if (!activities || activities.length === 0) return [];

    // Group by month
    const byMonth: Record<string, { distance: number; count: number }> = {};
    activities.forEach(activity => {
      const date = new Date(activity.start_date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!byMonth[monthYear]) {
        byMonth[monthYear] = { distance: 0, count: 0 };
      }
      
      byMonth[monthYear].distance += activity.distance / 1000; // Convert to km
      byMonth[monthYear].count += 1;
    });

    // Convert to array
    return Object.entries(byMonth).map(([month, data]) => ({
      month,
      distance: Number(data.distance.toFixed(1)),
      count: data.count,
    }));
  }, [activities]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Activities"
          value={stats.totalActivities}
          icon={<CalendarDays />}
        />
        <StatsCard 
          title="Total Distance"
          value={`${(stats.totalDistance / 1000).toFixed(1)} km`}
          icon={<Map />}
        />
        <StatsCard 
          title="Total Time"
          value={`${Math.floor(stats.totalDuration / 3600)} hours`}
          icon={<Timer />}
        />
        <StatsCard 
          title="Total Elevation"
          value={`${stats.totalElevation.toFixed(0)} m`}
          icon={<TrendingUp />}
        />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Monthly Distance</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-[300px]">
            <ChartContainer
              config={{
                distance: {
                  label: "Distance (km)",
                  color: "#3b82f6", // Blue
                },
                count: {
                  label: "Activities",
                  color: "#10b981", // Green
                },
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    yAxisId="left"
                    dataKey="distance" 
                    name="distance"
                    fill="var(--color-distance, #3b82f6)" 
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="count" 
                    name="count"
                    fill="var(--color-count, #10b981)" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityStats;
