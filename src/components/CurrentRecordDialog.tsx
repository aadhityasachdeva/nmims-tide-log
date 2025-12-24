import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Subject {
  id: string;
  name: string;
  attended: number;
  total: number;
}

interface CurrentRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
}

export function CurrentRecordDialog({
  open,
  onOpenChange,
  subjects,
}: CurrentRecordDialogProps) {
  const totalClasses = subjects.reduce((sum, s) => sum + s.total, 0);
  const attendedClasses = subjects.reduce((sum, s) => sum + s.attended, 0);
  const missedClasses = totalClasses - attendedClasses;
  const overallPercentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Your Attendance Record</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-2xl font-bold text-primary">{attendedClasses}</p>
              <p className="text-xs text-muted-foreground">Attended</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-2xl font-bold text-destructive">{missedClasses}</p>
              <p className="text-xs text-muted-foreground">Missed</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-2xl font-bold text-foreground">{overallPercentage}%</p>
              <p className="text-xs text-muted-foreground">Overall</p>
            </div>
          </div>

          {/* Subject-wise Breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Subject-wise Breakdown</h3>
            <ScrollArea className="h-[280px] pr-4">
              <div className="space-y-4">
                {subjects.map((subject) => {
                  const percentage = subject.total > 0
                    ? Math.round((subject.attended / subject.total) * 100)
                    : 0;
                  const isLow = percentage < 75;

                  return (
                    <div key={subject.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                          {subject.name}
                        </span>
                        <span className={`text-sm font-semibold ${isLow ? "text-destructive" : "text-success"}`}>
                          {percentage}%
                        </span>
                      </div>
                      <Progress
                        value={percentage}
                        className={`h-2 ${isLow ? "[&>div]:bg-destructive" : "[&>div]:bg-success"}`}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{subject.attended} attended</span>
                        <span>{subject.total - subject.attended} missed</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
