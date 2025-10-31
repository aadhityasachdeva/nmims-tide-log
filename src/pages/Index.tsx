import { useState } from "react";
import Header from "@/components/Header";
import StatsOverview from "@/components/StatsOverview";
import AttendanceCard from "@/components/AttendanceCard";
import { OnboardingForm } from "@/components/OnboardingForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Subject {
  id: string;
  name: string;
  attended: number;
  total: number;
}

const Index = () => {
  const [userProfile, setUserProfile] = useState<{
    sapId: string;
    name: string;
    division: string;
  } | null>(null);

  const [subjects, setSubjects] = useState<Subject[]>([
    { id: "1", name: "Business Statistics", attended: 18, total: 22 },
    { id: "2", name: "Financial Accounting", attended: 20, total: 24 },
    { id: "3", name: "Marketing Management", attended: 15, total: 20 },
    { id: "4", name: "Business Economics", attended: 19, total: 23 },
    { id: "5", name: "Organizational Behaviour", attended: 21, total: 25 },
  ]);

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

  if (!userProfile) {
    return <OnboardingForm onComplete={setUserProfile} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">{userProfile.name}</h2>
          <p className="text-muted-foreground">SAP ID: {userProfile.sapId} | Division: {userProfile.division}</p>
        </div>

        <StatsOverview
          overallPercentage={overallPercentage}
          totalClasses={totalClasses}
          attendedClasses={attendedClasses}
        />

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Your Subjects</h2>
          <Button className="bg-primary hover:bg-primary/90">
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

export default Index;
