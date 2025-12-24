import { GraduationCap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import askitLogo from "@/assets/askit-logo.jpeg";

interface HeaderProps {
  onSignOut?: () => void;
}

const Header = ({ onSignOut }: HeaderProps) => {
  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
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
          {onSignOut && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSignOut}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
