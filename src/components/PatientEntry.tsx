import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PatientEntryProps {
  onBack: () => void;
  userId: string;
}

const PatientEntry = ({ onBack, userId }: PatientEntryProps) => {
  const { toast } = useToast();
  const [caseType, setCaseType] = useState<"anc" | "pnc" | "child" | "general">("anc");
  const [patientName, setPatientName] = useState("");
  const [age, setAge] = useState("");
  const [village, setVillage] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!patientName || !age) {
      toast({
        title: "Missing Information",
        description: "Please enter patient name and age",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from('cases').insert({
        patient_name: patientName,
        patient_age: parseInt(age),
        village,
        blood_group: bloodGroup,
        phone_number: phone,
        case_type: caseType.toUpperCase(),
        chw_id: userId,
        status: 'active',
        priority: 'normal',
        category: caseType === 'anc' || caseType === 'pnc' ? 'pregnant_women' : caseType === 'child' ? 'child' : 'general',
        summary: `New ${caseType.toUpperCase()} case for ${patientName}`,
      });

      if (error) throw error;

      toast({
        title: "Case Saved",
        description: "Patient case has been saved successfully.",
      });
      setTimeout(onBack, 1000);
    } catch (error) {
      console.error('Error saving case:', error);
      toast({
        title: "Error",
        description: "Failed to save case. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 p-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h2 className="font-semibold">New Patient Case</h2>
              <p className="text-xs text-muted-foreground">Record visit details</p>
            </div>
          </div>
          <Button onClick={handleSave} size="sm" disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Patient Basic Info */}
        <Card className="p-4">
          <h3 className="mb-4 font-semibold">Patient Information</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="name">Name *</Label>
              <div className="flex gap-2">
                <Input 
                  id="name" 
                  placeholder="Patient name" 
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
                <Button variant="outline" size="icon">
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="age">Age *</Label>
                <Input 
                  id="age" 
                  type="number" 
                  placeholder="Years"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="village">Village</Label>
                <Input 
                  id="village" 
                  placeholder="Location"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Input 
                  id="bloodGroup" 
                  placeholder="e.g., A+, B-, O+"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  type="tel"
                  placeholder="Contact number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Case Type Tabs */}
        <Tabs value={caseType} onValueChange={(v) => setCaseType(v as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="anc">ANC</TabsTrigger>
            <TabsTrigger value="pnc">PNC</TabsTrigger>
            <TabsTrigger value="child">Child</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          <TabsContent value="anc" className="space-y-4">
            <Card className="p-4">
              <h4 className="mb-3 font-semibold">Antenatal Care (ANC)</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>LMP Date</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>EDD Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div>
                  <Label>Gravida / Para</Label>
                  <Input placeholder="e.g., G2P1" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Weight (kg)</Label>
                    <Input type="number" />
                  </div>
                  <div>
                    <Label>BP (mmHg)</Label>
                    <Input placeholder="120/80" />
                  </div>
                  <div>
                    <Label>Hb (g/dL)</Label>
                    <Input type="number" step="0.1" />
                  </div>
                </div>
                <div>
                  <Label>Complaints / Symptoms</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Describe any issues..." />
                    <Button variant="outline" size="icon">
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg bg-accent/10 p-3">
                  <p className="text-sm font-medium text-accent">✓ Checklist</p>
                  <div className="mt-2 space-y-1 text-xs">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      IFA tablets given
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      TT injection status checked
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Advised institutional delivery
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pnc" className="space-y-4">
            <Card className="p-4">
              <h4 className="mb-3 font-semibold">Postnatal Care (PNC)</h4>
              <div className="space-y-3">
                <div>
                  <Label>Delivery Date</Label>
                  <Input type="date" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Delivery Type</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option>Normal</option>
                      <option>C-Section</option>
                      <option>Assisted</option>
                    </select>
                  </div>
                  <div>
                    <Label>Baby Gender</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Mother's Condition</Label>
                  <Input placeholder="Any complications?" />
                </div>
                <div className="rounded-lg bg-accent/10 p-3">
                  <p className="text-sm font-medium text-accent">✓ PNC Checklist</p>
                  <div className="mt-2 space-y-1 text-xs">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Breastfeeding initiated
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Mother vitals checked
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Bleeding/discharge normal
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="child" className="space-y-4">
            <Card className="p-4">
              <h4 className="mb-3 font-semibold">Child Health</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>DOB</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>Weight (kg)</Label>
                    <Input type="number" step="0.1" />
                  </div>
                </div>
                <div>
                  <Label>Vaccination Status</Label>
                  <Input placeholder="Last vaccine given" />
                </div>
                <div>
                  <Label>Chief Complaint</Label>
                  <Input placeholder="Fever, cough, etc." />
                </div>
                <div className="rounded-lg bg-accent/10 p-3">
                  <p className="text-sm font-medium text-accent">✓ Child Checklist</p>
                  <div className="mt-2 space-y-1 text-xs">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Growth chart updated
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Next vaccination scheduled
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      Nutrition counseling given
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-4">
            <Card className="p-4">
              <h4 className="mb-3 font-semibold">General Consultation</h4>
              <div className="space-y-3">
                <div>
                  <Label>Chief Complaint</Label>
                  <Input placeholder="Main health concern" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Temperature (°F)</Label>
                    <Input type="number" step="0.1" />
                  </div>
                  <div>
                    <Label>BP (mmHg)</Label>
                    <Input placeholder="120/80" />
                  </div>
                </div>
                <div>
                  <Label>Symptoms</Label>
                  <textarea
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Describe symptoms in detail..."
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Referral Section */}
        <Card className="border-warning/50 bg-warning/5 p-4">
          <h4 className="mb-2 font-semibold text-warning">Referral Needed?</h4>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Yes, refer to higher facility</span>
          </label>
        </Card>
      </div>
    </div>
  );
};

export default PatientEntry;
