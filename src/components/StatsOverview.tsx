import { Card } from "@/components/ui/card";
import { TrendingUp, Calendar, AlertCircle } from "lucide-react";

interface StatsOverviewProps {
  overallPercentage: number;
  totalClasses: number;
  attendedClasses: number;
}

const StatsOverview = ({
  overallPercentage,
  totalClasses,
  attendedClasses,
}: StatsOverviewProps) => {
  const missedClasses = totalClasses - attendedClasses;
  const isLow = overallPercentage < 75;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 bg-gradient-primary text-primary-foreground">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 opacity-80" />
          <div>
            <p className="text-sm opacity-90">Overall Attendance</p>
            <p className="text-3xl font-bold">{overallPercentage}%</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-success" />
          <div>
            <p className="text-sm text-muted-foreground">Classes Attended</p>
            <p className="text-3xl font-bold text-foreground">
              {attendedClasses}/{totalClasses}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className={`h-8 w-8 ${isLow ? "text-accent" : "text-muted-foreground"}`} />
          <div>
            <p className="text-sm text-muted-foreground">Classes Missed</p>
            <p className={`text-3xl font-bold ${isLow ? "text-accent" : "text-foreground"}`}>
              {missedClasses}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatsOverview;
