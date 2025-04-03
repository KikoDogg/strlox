
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StatsCardProps = {
  title: string;
  value: string | number;
  description?: string;
  footerText?: string;
  icon?: React.ReactNode;
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  footerText,
  icon,
}) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <CardDescription className="text-xs text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardContent>
      {footerText && (
        <CardFooter className="pt-0">
          <p className="text-xs text-muted-foreground">{footerText}</p>
        </CardFooter>
      )}
    </Card>
  );
};

export default StatsCard;
