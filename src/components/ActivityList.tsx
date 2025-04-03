
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

const ActivityList: React.FC<ActivityListProps> = ({ activities, isLoading }) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading activities...</div>;
  }

  if (!activities || activities.length === 0) {
    return <div className="text-center py-8">No activities found</div>;
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Distance</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Elevation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell>{formatDate(activity.start_date)}</TableCell>
              <TableCell className="font-medium">{activity.name}</TableCell>
              <TableCell>{activity.activity_type}</TableCell>
              <TableCell>{formatDistance(activity.distance)}</TableCell>
              <TableCell>{formatDuration(activity.moving_time)}</TableCell>
              <TableCell>{activity.total_elevation_gain}m</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ActivityList;
