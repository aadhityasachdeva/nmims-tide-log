import { useState } from "react";
import Header from "@/components/Header";
import StatsOverview from "@/components/StatsOverview";
import AttendanceCard from "@/components/AttendanceCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";

interface Subject {
  id: string;
  name: string;
  attended: number;
  total: number;
}

interface Timetable {
  [day: string]: {
    [slot: string]: string;
  };
}

const Tracker = () => {
  const location = useLocation();
  const userProfile = location.state?.userProfile || { sapId: "", name: "", division: "" };

  const [subjects, setSubjects] = useState<Subject[]>([
    { id: "1", name: "Business Statistics", attended: 18, total: 22 },
    { id: "2", name: "Financial Accounting", attended: 20, total: 24 },
    { id: "3", name: "Marketing Management", attended: 15, total: 20 },
    { id: "4", name: "Business Economics", attended: 19, total: 23 },
    { id: "5", name: "Organizational Behaviour", attended: 21, total: 25 },
  ]);

  // Sample timetable - can be customized by user
  const [timetable] = useState<Timetable>({
    Monday: {
      "9:00 AM": "Business Statistics",
      "11:00 AM": "Financial Accounting",
      "2:00 PM": "Marketing Management",
    },
    Tuesday: {
      "9:00 AM": "Business Economics",
      "11:00 AM": "Organizational Behaviour",
      "2:00 PM": "Business Statistics",
    },
    Wednesday: {
      "9:00 AM": "Financial Accounting",
      "11:00 AM": "Marketing Management",
      "2:00 PM": "Business Economics",
    },
    Thursday: {
      "9:00 AM": "Organizational Behaviour",
      "11:00 AM": "Business Statistics",
      "2:00 PM": "Financial Accounting",
    },
    Friday: {
      "9:00 AM": "Marketing Management",
      "11:00 AM": "Business Economics",
      "2:00 PM": "Organizational Behaviour",
    },
  });

  const markAttendance = (subjectId: string, isPresent: boolean) => {
    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              attended: isPresent ? subject.attended + 1 : subject.attended,
              total: subject.total + 1,
            }
          : subject
      )
    );

    toast({
      title: isPresent ? "Marked Present" : "Marked Absent",
      description: `Attendance updated successfully.`,
    });
  };

  const totalClasses = subjects.reduce((sum, subject) => sum + subject.total, 0);
  const attendedClasses = subjects.reduce((sum, subject) => sum + subject.attended, 0);
  const overallPercentage = totalClasses > 0 
    ? Math.round((attendedClasses / totalClasses) * 100) 
    : 0;

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">{userProfile.name}</h2>
          <p className="text-muted-foreground">SAP ID: {userProfile.sapId} | Division: {userProfile.division}</p>
        </div>

        <StatsOverview
          overallPercentage={overallPercentage}
          totalClasses={totalClasses}
          attendedClasses={attendedClasses}
        />

        {/* Timetable Section */}
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Weekly Timetable</CardTitle>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Edit Timetable
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {days.map((day) => (
                <div key={day} className="space-y-3">
                  <h3 className="font-semibold text-sm text-primary border-b border-primary/20 pb-2">
                    {day}
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(timetable[day] || {}).map(([time, subject]) => (
                      <div
                        key={`${day}-${time}`}
                        className="bg-secondary/50 p-2 rounded-md text-xs hover:bg-secondary transition-colors"
                      >
                        <p className="font-medium text-foreground">{time}</p>
                        <p className="text-muted-foreground mt-1">{subject}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subjects Section */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Your Subjects</h2>
          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow">
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <AttendanceCard
              key={subject.id}
              subject={subject.name}
              attended={subject.attended}
              total={subject.total}
              onMarkPresent={() => markAttendance(subject.id, true)}
              onMarkAbsent={() => markAttendance(subject.id, false)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Tracker;
