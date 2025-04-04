
import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StravaActivity } from "@/hooks/useStrava";
import { CalendarDays, Map, Timer, TrendingUp } from "lucide-react";
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

    // Process activities by day
    const byDay = {};
    activities.forEach(activity => {
      const date = new Date(activity.start_date);
      const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!byDay[dayKey]) {
        byDay[dayKey] = { 
          date: dayKey, 
          distance: 0, 
          duration: 0, 
          elevation: 0,
          count: 0 
        };
      }
      
      byDay[dayKey].distance += activity.distance / 1000; // Convert to km
      byDay[dayKey].duration += activity.moving_time / 3600; // Convert to hours
      byDay[dayKey].elevation += activity.total_elevation_gain;
      byDay[dayKey].count += 1;
    });

    // Convert to array and sort by date
    return Object.values(byDay)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((day: any) => ({
        ...day,
        distance: Number(day.distance.toFixed(1)),
        duration: Number(day.duration.toFixed(1)),
        elevation: Math.round(day.elevation),
        dateFormatted: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
  }, [activities]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Activities"
          value={stats.totalActivities}
          icon={<CalendarDays className="text-orange-500" />}
        />
        <StatsCard 
          title="Total Distance"
          value={`${(stats.totalDistance / 1000).toFixed(1)} km`}
          icon={<Map className="text-orange-500" />}
        />
        <StatsCard 
          title="Total Time"
          value={`${Math.floor(stats.totalDuration / 3600)} hours`}
          icon={<Timer className="text-orange-500" />}
        />
        <StatsCard 
          title="Total Elevation"
          value={`${stats.totalElevation.toFixed(0)} m`}
          icon={<TrendingUp className="text-orange-500" />}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Distance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis 
                    dataKey="dateFormatted" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value} km`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#fff", 
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "12px"
                    }}
                    formatter={(value: any) => [`${value} km`, "Distance"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="distance" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    dot={{ fill: "#f97316", r: 4 }}
                    activeDot={{ fill: "#ea580c", r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Elevation Gain</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis 
                    dataKey="dateFormatted" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value} m`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#fff", 
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "12px"
                    }}
                    formatter={(value: any) => [`${value} m`, "Elevation"]}
                  />
                  <Bar 
                    dataKey="elevation" 
                    fill="#f97316" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ActivityStats;
