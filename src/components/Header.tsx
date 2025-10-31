import { GraduationCap } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-gradient-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">NMIMS Attendance Tracker</h1>
            <p className="text-sm opacity-90">Track your academic progress</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
