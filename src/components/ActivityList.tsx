
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StravaActivity } from "@/hooks/useStrava";
import { Badge } from "@/components/ui/badge";
import { Bike, User, Map, ChevronRight, AlertCircle } from "lucide-react";

type ActivityListProps = {
  activities: any[];
  isLoading: boolean;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const formatDistance = (meters: number) => {
  const km = meters / 1000;
  return `${km.toFixed(2)} km`;
};

const getActivityIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'ride':
    case 'cycling':
    case 'biking':
      return <Bike className="h-4 w-4 text-blue-500" />;
    case 'run':
    case 'running':
      return <User className="h-4 w-4 text-green-500" />;
    default:
      return <Map className="h-4 w-4 text-orange-500" />;
  }
};

const ActivityList: React.FC<ActivityListProps> = ({ activities, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
        <span className="ml-3 text-sm text-gray-600">Loading activities...</span>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium">No activities found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Connect your accounts to see activities here
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto rounded-lg border border-gray-200 shadow">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-semibold">Date</TableHead>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Distance</TableHead>
            <TableHead className="font-semibold">Duration</TableHead>
            <TableHead className="font-semibold">Elevation</TableHead>
            <TableHead className="font-semibold"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity.id} className="hover:bg-gray-50">
              <TableCell className="whitespace-nowrap">{formatDate(activity.start_date)}</TableCell>
              <TableCell className="font-medium">{activity.name}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  {getActivityIcon(activity.type || activity.activity_type)}
                  <span className="ml-2">{activity.type || activity.activity_type}</span>
                </div>
              </TableCell>
              <TableCell>{formatDistance(activity.distance)}</TableCell>
              <TableCell>{formatDuration(activity.moving_time)}</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 hover:bg-orange-100">
                  {activity.total_elevation_gain}m
                </Badge>
              </TableCell>
              <TableCell>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ActivityList;
