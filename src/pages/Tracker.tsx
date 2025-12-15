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
    { id: "1", name: "Introduction to Visual Effect", attended: 0, total: 0 },
    { id: "2", name: "Media Economics", attended: 0, total: 0 },
    { id: "3", name: "Entrepreneurship", attended: 0, total: 0 },
    { id: "4", name: "Marketing Analytics", attended: 0, total: 0 },
    { id: "5", name: "Introduction to Graphic Design", attended: 0, total: 0 },
    { id: "6", name: "Retail Management", attended: 0, total: 0 },
    { id: "7", name: "Market Research - II", attended: 0, total: 0 },
  ]);

  interface TimetableSlot {
    subject: string;
    professor: string;
    room: string;
  }

  interface TimetableData {
    [day: string]: {
      [slot: string]: TimetableSlot;
    };
  }

  const [timetable] = useState<TimetableData>({
    Monday: {
      "7:00 - 8:00": { subject: "Introduction to Visual Effect", professor: "Prof. Prashant Patil", room: "CC102" },
      "8:00 - 9:00": { subject: "Media Economics", professor: "Prof. Rohan Mehra", room: "102" },
      "9:45 - 10:45": { subject: "Market Research - II", professor: "Dr. Kiran Desai", room: "102" },
    },
    Tuesday: {
      "7:00 - 8:00": { subject: "Media Economics", professor: "Prof. Rohan Mehra", room: "102" },
      "8:00 - 9:00": { subject: "Introduction to Graphic Design", professor: "Prof. Freddy Singaraj", room: "CC102" },
      "9:45 - 10:45": { subject: "Entrepreneurship", professor: "Dr. Percy Vaid", room: "102" },
      "10:45 - 11:45": { subject: "Marketing Analytics", professor: "Prof. Ashish Mathur", room: "102" },
      "11:45 - 12:45": { subject: "Introduction to Graphic Design", professor: "Prof. Freddy Singaraj", room: "CC102" },
    },
    Wednesday: {
      "7:00 - 8:00": { subject: "Entrepreneurship", professor: "Dr. Percy Vaid", room: "102" },
      "8:00 - 9:00": { subject: "Marketing Analytics", professor: "Prof. Ashish Mathur", room: "102" },
      "9:45 - 10:45": { subject: "Introduction to Visual Effect", professor: "Prof. Prashant Patil", room: "CC102" },
      "10:45 - 11:45": { subject: "Marketing Analytics", professor: "Prof. Ashish Mathur", room: "102" },
    },
    Thursday: {
      "8:00 - 9:00": { subject: "Retail Management", professor: "Prof. Anandaraman", room: "102" },
      "9:45 - 10:45": { subject: "Retail Management", professor: "Prof. Anandaraman", room: "102" },
      "10:45 - 11:45": { subject: "Entrepreneurship", professor: "Dr. Percy Vaid", room: "102" },
      "11:45 - 12:45": { subject: "Entrepreneurship", professor: "Dr. Percy Vaid", room: "102" },
    },
    Friday: {
      "7:00 - 8:00": { subject: "Marketing Analytics", professor: "Prof. Ashish Mathur", room: "102" },
      "8:00 - 9:00": { subject: "Retail Management", professor: "Prof. Anandaraman", room: "102" },
      "9:45 - 10:45": { subject: "Retail Management", professor: "Prof. Anandaraman", room: "102" },
      "10:45 - 11:45": { subject: "Market Research - II", professor: "Dr. Kiran Desai", room: "102" },
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
                    {Object.entries(timetable[day] || {}).map(([time, slot]) => (
                      <div
                        key={`${day}-${time}`}
                        className="bg-secondary/50 p-2 rounded-md text-xs hover:bg-secondary transition-colors"
                      >
                        <p className="font-medium text-foreground">{time}</p>
                        <p className="text-primary font-semibold mt-1">{slot.subject}</p>
                        <p className="text-muted-foreground text-[10px]">{slot.professor}</p>
                        <p className="text-muted-foreground text-[10px]">Room: {slot.room}</p>
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
