import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface CaseHistoryProps {
  onBack: () => void;
}

interface Case {
  id: string;
  patientName: string;
  age: number;
  type: "ANC" | "PNC" | "Child" | "General";
  date: string;
  status: "active" | "followup" | "completed";
  priority: "normal" | "high";
  summary: string;
}

const mockCases: Case[] = [
  {
    id: "1",
    patientName: "Sunita Devi",
    age: 26,
    type: "ANC",
    date: "2025-11-20",
    status: "followup",
    priority: "high",
    summary: "G2P1, 32 weeks, mild anemia (Hb 9.2)",
  },
  {
    id: "2",
    patientName: "Ramesh Kumar",
    age: 45,
    type: "General",
    date: "2025-11-19",
    status: "active",
    priority: "normal",
    summary: "Fever for 3 days, cough, advised rest",
  },
  {
    id: "3",
    patientName: "Baby Aarav",
    age: 1,
    type: "Child",
    date: "2025-11-18",
    status: "completed",
    priority: "normal",
    summary: "DPT-3 vaccination completed",
  },
  {
    id: "4",
    patientName: "Priya Sharma",
    age: 28,
    type: "PNC",
    date: "2025-11-17",
    status: "followup",
    priority: "normal",
    summary: "Day 7 post-delivery, breastfeeding well",
  },
];

const CaseHistory = ({ onBack }: CaseHistoryProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "followup" | "completed">("all");

  const filteredCases = mockCases.filter((c) => {
    const matchesSearch = c.patientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: Case["status"]) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4 text-accent" />;
      case "followup":
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-primary" />;
    }
  };

  const getTypeColor = (type: Case["type"]) => {
    switch (type) {
      case "ANC":
        return "bg-primary/10 text-primary";
      case "PNC":
        return "bg-accent/10 text-accent";
      case "Child":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-background/95 p-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-semibold">Case History</h2>
            <p className="text-xs text-muted-foreground">{filteredCases.length} records</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patient name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
          >
            All
          </Button>
          <Button
            variant={filterStatus === "active" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("active")}
          >
            Active
          </Button>
          <Button
            variant={filterStatus === "followup" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("followup")}
          >
            Follow-up
          </Button>
          <Button
            variant={filterStatus === "completed" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("completed")}
          >
            Completed
          </Button>
        </div>

        {/* Cases List */}
        <div className="space-y-3">
          {filteredCases.map((caseItem) => (
            <Card
              key={caseItem.id}
              className={`p-4 ${caseItem.priority === "high" ? "border-destructive/50" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{caseItem.patientName}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getTypeColor(caseItem.type)}`}>
                      {caseItem.type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Age: {caseItem.age} • {new Date(caseItem.date).toLocaleDateString()}
                  </p>
                  <p className="mt-2 text-sm">{caseItem.summary}</p>
                </div>
                <div>{getStatusIcon(caseItem.status)}</div>
              </div>
              {caseItem.priority === "high" && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  High priority - Follow-up needed
                </div>
              )}
            </Card>
          ))}
        </div>

        {filteredCases.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <p>No cases found</p>
            <p className="mt-1 text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseHistory;
