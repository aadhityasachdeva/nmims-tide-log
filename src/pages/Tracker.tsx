import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import StatsOverview from "@/components/StatsOverview";
import { AppSidebar } from "@/components/AppSidebar";
import { CurrentRecordDialog } from "@/components/CurrentRecordDialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Loader2, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
interface Subject {
  id: string;
  name: string;
  attended: number;
  total: number;
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

interface AttendanceRecord {
  subject_id: string;
  status: string;
  date: string;
  time_slot: string;
}

// Original timetable (before January 2, 2026)
const TIMETABLE_ORIGINAL: TimetableData = {
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
};

// New timetable effective January 2, 2026
const TIMETABLE_NEW: TimetableData = {
  Monday: {
    "7:00 - 8:00": { subject: "Introduction to Visual Effect", professor: "Prof. Prashant Patil", room: "CC102" },
    "8:00 - 9:00": { subject: "Media Economics", professor: "Prof. Rohan Mehra", room: "102" },
    "9:45 - 10:45": { subject: "Media Economics", professor: "Prof. Rohan Mehra", room: "102" },
    "10:45 - 11:45": { subject: "Market Research - II", professor: "Dr. Kiran Desai", room: "102" },
  },
  Tuesday: {
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
};

// Date when new timetable becomes effective
const NEW_TIMETABLE_EFFECTIVE_DATE = new Date("2026-01-02");

// Get timetable based on date
const getTimetableForDate = (date: Date): TimetableData => {
  return date >= NEW_TIMETABLE_EFFECTIVE_DATE ? TIMETABLE_NEW : TIMETABLE_ORIGINAL;
};

// Get all unique subject names from both timetables
const getAllSubjectNames = (): string[] => {
  const names = new Set<string>();
  [TIMETABLE_ORIGINAL, TIMETABLE_NEW].forEach(timetable => {
    Object.values(timetable).forEach(day => {
      Object.values(day).forEach(slot => {
        names.add(slot.subject);
      });
    });
  });
  return Array.from(names);
};

const Tracker = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const selectedDayName = days[selectedDate.getDay()];
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6;
  const isToday = format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  // Get today's schedule with subjects based on the selected date
  const getTodaysSchedule = () => {
    if (isWeekend) return [];
    const timetable = getTimetableForDate(selectedDate);
    const daySchedule = timetable[selectedDayName];
    if (!daySchedule) return [];
    
    return Object.entries(daySchedule).map(([time, slot]) => {
      const subject = subjects.find(s => s.name === slot.subject);
      return {
        time,
        ...slot,
        subjectId: subject?.id,
        attended: subject?.attended || 0,
        total: subject?.total || 0,
      };
    });
  };

  const todaysSchedule = getTodaysSchedule();

  // Get attendance status for a subject on the selected date and time slot
  const getAttendanceStatus = (subjectId: string | undefined, timeSlot: string): string | null => {
    if (!subjectId) return null;
    const record = attendanceRecords.find(
      r => r.subject_id === subjectId && r.date === selectedDateStr && r.time_slot === timeSlot
    );
    return record?.status || null;
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      initializeSubjects();
    }
  }, [user]);

  useEffect(() => {
    if (user && subjects.length > 0) {
      fetchAllAttendance();
    }
  }, [user, subjects.length]);

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

  const initializeSubjects = async () => {
    if (!user) return;

    try {
      const allSubjectNames = getAllSubjectNames();
      
      // Upsert all subjects (insert if not exists, ignore if exists)
      for (const name of allSubjectNames) {
        await supabase
          .from("subjects")
          .upsert({ user_id: user.id, name }, { onConflict: "user_id,name", ignoreDuplicates: true });
      }

      // Fetch all subjects for this user
      const { data: subjects, error: fetchError } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", user.id);

      if (fetchError) throw fetchError;

      await fetchSubjectsWithCounts(subjects || []);
    } catch (error) {
      console.error("Error initializing subjects:", error);
      setLoading(false);
    }
  };

  const fetchSubjectsWithCounts = async (subjectsData: any[]) => {
    try {
      const subjectsWithCounts = await Promise.all(
        subjectsData.map(async (subject) => {
          const { data: attendanceData, error } = await supabase
            .from("attendance_records")
            .select("status")
            .eq("subject_id", subject.id);

          if (error) throw error;

          const total = attendanceData?.length || 0;
          const attended = attendanceData?.filter(r => r.status === "present").length || 0;

          return {
            id: subject.id,
            name: subject.name,
            attended,
            total,
          };
        })
      );

      setSubjects(subjectsWithCounts);
    } catch (error) {
      console.error("Error fetching subject counts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAttendance = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("attendance_records")
      .select("subject_id, status, date, time_slot")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching attendance:", error);
      return;
    }

    setAttendanceRecords(data || []);
  };

  const markAttendance = async (subjectId: string, timeSlot: string, isPresent: boolean) => {
    if (!user || !subjectId) return;

    const existingStatus = getAttendanceStatus(subjectId, timeSlot);

    try {
      const { error } = await supabase
        .from("attendance_records")
        .upsert({
          user_id: user.id,
          subject_id: subjectId,
          date: selectedDateStr,
          time_slot: timeSlot,
          status: isPresent ? "present" : "absent",
        }, {
          onConflict: "subject_id,date,time_slot"
        });

      if (error) throw error;

      // Update local attendance records
      setAttendanceRecords(prev => {
        const filtered = prev.filter(r => !(r.subject_id === subjectId && r.date === selectedDateStr && r.time_slot === timeSlot));
        return [...filtered, { subject_id: subjectId, status: isPresent ? "present" : "absent", date: selectedDateStr, time_slot: timeSlot }];
      });

      // Update subject counts
      if (!existingStatus) {
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
      } else if (existingStatus !== (isPresent ? "present" : "absent")) {
        setSubjects((prev) =>
          prev.map((subject) =>
            subject.id === subjectId
              ? {
                  ...subject,
                  attended: isPresent ? subject.attended + 1 : subject.attended - 1,
                }
              : subject
          )
        );
      }

      toast({
        title: isPresent ? "Marked Present" : "Marked Absent",
        description: `Attendance updated for ${format(selectedDate, "MMM d")}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark attendance",
        variant: "destructive",
      });
    }
  };

  const goToPreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    if (next <= new Date()) {
      setSelectedDate(next);
    }
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const totalClasses = subjects.reduce((sum, subject) => sum + subject.total, 0);
  const attendedClasses = subjects.reduce((sum, subject) => sum + subject.attended, 0);
  const overallPercentage = totalClasses > 0 
    ? Math.round((attendedClasses / totalClasses) * 100) 
    : 0;

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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar onSignOut={signOut} onOpenRecord={() => setRecordDialogOpen(true)} />
        
        <div className="flex-1 flex flex-col">
          {/* Header with sidebar trigger */}
          <header className="h-14 flex items-center border-b border-border px-4 gap-4">
            <SidebarTrigger>
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <h1 className="font-bold text-lg text-foreground">Attendance Tracker</h1>
          </header>

          <main className="flex-1 container mx-auto px-4 py-6 space-y-6 animate-fade-in">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
              <p className="text-muted-foreground">SAP ID: {profile.sap_id} | Division: {profile.division}</p>
            </div>

            <StatsOverview
              overallPercentage={overallPercentage}
              totalClasses={totalClasses}
              attendedClasses={attendedClasses}
            />

            {/* Date Navigation */}
            <Card className="bg-card border-primary/20">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={goToPreviousDay}
                    className="h-10 w-10"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  
                  <div className="flex flex-col items-center gap-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="text-lg font-semibold gap-2">
                          <CalendarIcon className="h-5 w-5 text-primary" />
                          {format(selectedDate, "EEE, MMM d")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="center">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    {isToday ? (
                      <span className="text-xs text-primary font-medium">Today</span>
                    ) : (
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={goToToday}
                        className="text-xs h-auto p-0 text-muted-foreground hover:text-primary"
                      >
                        Go to Today
                      </Button>
                    )}
                  </div>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={goToNextDay}
                    disabled={isToday}
                    className="h-10 w-10"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Schedule & Attendance */}
            <Card className="bg-card border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{selectedDayName}'s Classes</CardTitle>
              </CardHeader>
              <CardContent>
                {isWeekend ? (
                  <p className="text-muted-foreground text-center py-8">No classes on weekends</p>
                ) : todaysSchedule.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No classes scheduled</p>
                ) : (
                  <div className="space-y-3">
                    {todaysSchedule.map((slot) => {
                      const status = getAttendanceStatus(slot.subjectId, slot.time);
                      const percentage = slot.total > 0 ? Math.round((slot.attended / slot.total) * 100) : 0;
                      
                      return (
                        <div
                          key={`${slot.time}-${slot.subject}`}
                          className={cn(
                            "p-4 rounded-lg border transition-all",
                            status === "present" && "bg-success/10 border-success/30",
                            status === "absent" && "bg-accent/10 border-accent/30",
                            !status && "bg-secondary/50 border-border"
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                                  {slot.time}
                                </span>
                                <span className="text-xs text-muted-foreground">Room {slot.room}</span>
                              </div>
                              <h3 className="font-semibold text-foreground truncate">{slot.subject}</h3>
                              <p className="text-sm text-muted-foreground">{slot.professor}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {slot.attended}/{slot.total} classes • {percentage}%
                              </p>
                            </div>
                            
                            <div className="flex gap-2 shrink-0">
                              <Button
                                size="sm"
                                onClick={() => slot.subjectId && markAttendance(slot.subjectId, slot.time, true)}
                                className={cn(
                                  "h-9 px-3",
                                  status === "present" 
                                    ? "bg-success text-white" 
                                    : "bg-success/20 text-success hover:bg-success hover:text-white"
                                )}
                              >
                                Present
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => slot.subjectId && markAttendance(slot.subjectId, slot.time, false)}
                                className={cn(
                                  "h-9 px-3",
                                  status === "absent"
                                    ? "bg-accent text-accent-foreground border-accent"
                                    : "border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground"
                                )}
                              >
                                Absent
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>

        <CurrentRecordDialog
          open={recordDialogOpen}
          onOpenChange={setRecordDialogOpen}
          subjects={subjects}
        />
      </div>
    </SidebarProvider>
  );
};

export default Tracker;
