import { GraduationCap } from "lucide-react";
import askitLogo from "@/assets/askit-logo.jpeg";

const Header = () => {
  return (
    <header className="bg-gradient-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">NMIMS SoBA Attendance Tracker</h1>
              <div className="flex items-center gap-2 text-sm opacity-90">
                <span>Powered by</span>
                <img src={askitLogo} alt="Askit" className="h-5 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
