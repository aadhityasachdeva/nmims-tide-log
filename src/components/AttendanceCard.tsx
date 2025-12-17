import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceCardProps {
  subject: string;
  attended: number;
  conducted: number;
  credits: number;
  onMarkPresent: () => void;
  onMarkAbsent: () => void;
}

const AttendanceCard = ({
  subject,
  attended,
  conducted,
  credits,
  onMarkPresent,
  onMarkAbsent,
}: AttendanceCardProps) => {
  const totalClasses = credits * 15; // Total classes in semester based on credits
  const percentage = conducted > 0 ? Math.round((attended / conducted) * 100) : 0;
  const isLow = percentage < 80;
  const isWarning = percentage >= 80 && percentage < 90;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg text-foreground">{subject}</h3>
            <div className="flex gap-4 mt-2 text-sm">
              <div className="text-center">
                <p className="font-semibold text-success">{attended}</p>
                <p className="text-muted-foreground text-xs">Attended</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-accent">{conducted - attended}</p>
                <p className="text-muted-foreground text-xs">Missed</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-primary">{totalClasses}</p>
                <p className="text-muted-foreground text-xs">Total</p>
              </div>
            </div>
          </div>
          <div
            className={cn(
              "text-2xl font-bold",
              isLow && "text-accent",
              isWarning && "text-warning",
              !isLow && !isWarning && "text-success"
            )}
          >
            {percentage}%
          </div>
        </div>

        <div className="space-y-2">
          <Progress 
            value={percentage} 
            className={cn(
              "h-2",
              isLow && "[&>div]:bg-accent",
              isWarning && "[&>div]:bg-warning",
              !isLow && !isWarning && "[&>div]:bg-success"
            )}
          />
          {isLow && (
            <p className="text-xs text-accent font-medium">
              ⚠️ Attendance below 80% - Risk of detention
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onMarkPresent}
            size="sm"
            className="flex-1 bg-success hover:bg-success/90 text-white"
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Present
          </Button>
          <Button
            onClick={onMarkAbsent}
            size="sm"
            variant="outline"
            className="flex-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Absent
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AttendanceCard;
