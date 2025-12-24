import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Loader2 } from "lucide-react";
import askitLogo from "@/assets/askit-logo.jpeg";

const Onboarding = () => {
  const [sapId, setSapId] = useState("");
  const [name, setName] = useState("");
  const [division, setDivision] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sapId.trim() || !name.trim() || !division.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("profiles").insert({
        user_id: user.id,
        sap_id: sapId,
        name: name,
        division: division,
      });

      if (error) throw error;

      toast({
        title: "Profile created!",
        description: "Welcome to the attendance tracker.",
      });
      navigate("/tracker");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant animate-fade-in bg-card">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">
              NMIMS SoBA Attendance Tracker
            </CardTitle>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-2">
              <span>Powered by</span>
              <img src={askitLogo} alt="Askit" className="h-5 rounded" />
            </div>
            <CardDescription className="mt-2">
              Complete your profile to get started
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
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
