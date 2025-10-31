import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap } from "lucide-react";

interface OnboardingFormProps {
  onComplete: (data: { sapId: string; name: string; division: string }) => void;
}

export const OnboardingForm = ({ onComplete }: OnboardingFormProps) => {
  const [sapId, setSapId] = useState("");
  const [name, setName] = useState("");
  const [division, setDivision] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sapId.trim() || !name.trim() || !division.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const userProfile = { sapId, name, division };
    onComplete(userProfile);
    navigate("/tracker", { state: { userProfile } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-accent flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant animate-fade-in">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              NMIMS Attendance Tracker
            </CardTitle>
            <CardDescription className="mt-2">
              Enter your details to get started
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sapId">SAP ID</Label>
              <Input
                id="sapId"
                type="text"
                placeholder="Enter your SAP ID"
                value={sapId}
                onChange={(e) => setSapId(e.target.value)}
                className="border-primary/20 focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-primary/20 focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="division">Division</Label>
              <Input
                id="division"
                type="text"
                placeholder="Enter your division"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="border-primary/20 focus:border-primary"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow"
            >
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
