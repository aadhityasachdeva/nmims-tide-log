import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import StatsOverview from "@/components/StatsOverview";
import AttendanceCard from "@/components/AttendanceCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Calendar, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Subject {
  id: string;
  name: string;
  attended: number;
  total: number;
  required_percentage: number;
}

interface Profile {
  sap_id: string;
  name: string;
  division: string;
}

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

const Tracker = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [addingSubject, setAddingSubject] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSubjectsWithAttendance();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    if (!data) {
      navigate("/onboarding");
      return;
    }

    setProfile(data);
  };

  const fetchSubjectsWithAttendance = async () => {
    if (!user) return;

    try {
      const { data: subjectsData, error: subjectsError } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", user.id);

      if (subjectsError) throw subjectsError;

      const subjectsWithCounts = await Promise.all(
        (subjectsData || []).map(async (subject) => {
          const { data: attendanceData, error: attendanceError } = await supabase
            .from("attendance_records")
            .select("status")
            .eq("subject_id", subject.id);

          if (attendanceError) throw attendanceError;

          const total = attendanceData?.length || 0;
          const attended = attendanceData?.filter(r => r.status === "present").length || 0;

          return {
            id: subject.id,
            name: subject.name,
            required_percentage: subject.required_percentage,
            attended,
            total,
          };
        })
      );

      setSubjects(subjectsWithCounts);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const addSubject = async () => {
    if (!user || !newSubjectName.trim()) return;

    setAddingSubject(true);
    try {
      const { data, error } = await supabase
        .from("subjects")
        .insert({
          user_id: user.id,
          name: newSubjectName.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setSubjects([...subjects, { id: data.id, name: data.name, required_percentage: data.required_percentage, attended: 0, total: 0 }]);
      setNewSubjectName("");
      setDialogOpen(false);
      toast({
        title: "Subject added",
        description: `${data.name} has been added to your subjects.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add subject",
        variant: "destructive",
      });
    } finally {
      setAddingSubject(false);
    }
  };

  const markAttendance = async (subjectId: string, isPresent: boolean) => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    try {
      const { error } = await supabase
        .from("attendance_records")
        .upsert({
          user_id: user.id,
          subject_id: subjectId,
          date: today,
          status: isPresent ? "present" : "absent",
        }, {
          onConflict: "subject_id,date"
        });

      if (error) throw error;

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
    } catch (error: any) {
      if (error.code === "23505") {
        toast({
          title: "Already marked",
          description: "You've already marked attendance for this subject today.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to mark attendance",
          variant: "destructive",
        });
      }
    }
  };

  const totalClasses = subjects.reduce((sum, subject) => sum + subject.total, 0);
  const attendedClasses = subjects.reduce((sum, subject) => sum + subject.attended, 0);
  const overallPercentage = totalClasses > 0 
    ? Math.round((attendedClasses / totalClasses) * 100) 
    : 0;

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dayIndex = new Date().getDay();
  const currentDay = dayIndex >= 1 && dayIndex <= 5 ? days[dayIndex - 1] : "Monday";

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSignOut={signOut} />
      
      <main className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
          <p className="text-muted-foreground">SAP ID: {profile.sap_id} | Division: {profile.division}</p>
        </div>

        <StatsOverview
          overallPercentage={overallPercentage}
          totalClasses={totalClasses}
          attendedClasses={attendedClasses}
        />

        {/* Today's Timetable Section */}
        <Card className="shadow-elegant border-primary/20 bg-card">
          <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Today's Schedule - {currentDay}</CardTitle>
          </div>
          </CardHeader>
          <CardContent>
            {timetable[currentDay] && Object.keys(timetable[currentDay]).length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(timetable[currentDay]).map(([time, slot]) => (
                  <div
                    key={`${currentDay}-${time}`}
                    className="bg-secondary/50 p-4 rounded-lg border border-primary/20 hover:border-primary/40 transition-all"
                  >
                    <p className="font-bold text-primary text-sm">{time}</p>
                    <p className="text-foreground font-semibold mt-2">{slot.subject}</p>
                    <p className="text-muted-foreground text-sm mt-1">{slot.professor}</p>
                    <p className="text-muted-foreground text-xs mt-1">Room: {slot.room}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No classes scheduled for today</p>
            )}
          </CardContent>
        </Card>

        {/* Subjects Section */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Your Subjects</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="subjectName">Subject Name</Label>
                  <Input
                    id="subjectName"
                    placeholder="Enter subject name"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={addSubject} 
                  disabled={addingSubject || !newSubjectName.trim()}
                  className="w-full"
                >
                  {addingSubject && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Subject
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {subjects.length === 0 ? (
          <Card className="bg-card">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No subjects added yet. Click "Add Subject" to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <AttendanceCard
                key={subject.id}
                subject={subject.name}
                attended={subject.attended}
                conducted={subject.total}
                credits={4}
                onMarkPresent={() => markAttendance(subject.id, true)}
                onMarkAbsent={() => markAttendance(subject.id, false)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Tracker;
