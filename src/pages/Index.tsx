import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Users, FileText, Activity, LogOut, UserCheck, Baby, AlertTriangle, UserPlus, ClipboardList, Share2, LayoutDashboard } from "lucide-react";
import AIAssistant from "@/components/AIAssistant";
import PatientEntry from "@/components/PatientEntry";
import CaseHistory from "@/components/CaseHistory";
import PatientDetail from "@/components/PatientDetail";
import { LanguageSelector } from "@/components/LanguageSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCases } from "@/hooks/useCases";
import type { User } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";
import type { Case } from "@/hooks/useCases";

const Index = () => {
  const [activeView, setActiveView] = useState<"home" | "ai" | "entry" | "history" | "detail">("home");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Case | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { cases, loading: casesLoading, refetch } = useCases(user);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user && event !== 'INITIAL_SESSION') {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time case updates
    const channel = supabase
      .channel('cases-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cases',
          filter: `chw_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Case update:', payload);
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Case Added",
              description: "A new patient case has been recorded.",
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: "Case Updated",
              description: "A patient case has been updated.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const stats = {
    activeCases: cases.filter(c => c.status === 'active').length,
    followUps: cases.filter(c => c.follow_up_date && new Date(c.follow_up_date) >= new Date()).length,
    pregnantWomen: cases.filter(c => c.category === 'pregnant_women').length,
    totalPatients: cases.length,
    todaysFollowups: cases.filter(c => c.follow_up_date && new Date(c.follow_up_date).toDateString() === new Date().toDateString()).length,
    highRisk: cases.filter(c => c.priority === 'high').length,
    referrals: cases.filter(c => c.is_referred).length,
  };

  const handleCategoryClick = (category: string) => {
    setFilterCategory(category);
    setActiveView("history");
  };

  const handlePatientClick = (caseData: Case) => {
    setSelectedPatient(caseData);
    setActiveView("detail");
  };

  const renderView = () => {
    switch (activeView) {
      case "ai":
        return <AIAssistant onBack={() => setActiveView("home")} />;
      case "entry":
        return <PatientEntry onBack={() => { setActiveView("home"); refetch(); }} userId={user?.id || ''} />;
      case "history":
        return <CaseHistory onBack={() => setActiveView("home")} cases={cases} filter={filterCategory} onPatientClick={handlePatientClick} />;
      case "detail":
        return selectedPatient ? <PatientDetail patient={selectedPatient} onBack={() => setActiveView("history")} /> : null;
      default:
        return (
          <div className="min-h-screen bg-secondary/30 p-4 pb-24">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t('app_name')}</h1>
                <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
              </div>
              <div className="flex gap-2">
                <LanguageSelector />
                <Button variant="ghost" size="icon" onClick={handleSignOut} title={t('sign_out')}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <Card className="p-4 cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => handleCategoryClick('active')}>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.activeCases}</p>
                    <p className="text-xs text-muted-foreground">{t('active_cases')}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => handleCategoryClick('follow_up')}>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-accent/10 p-2">
                    <Activity className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.followUps}</p>
                    <p className="text-xs text-muted-foreground">{t('follow_ups')}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Interactive Sections */}
            <div className="mb-6 space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Quick Access</h3>
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3 cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => handleCategoryClick('pregnant_women')}>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Baby className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold">{stats.pregnantWomen}</p>
                      <p className="text-xs text-muted-foreground">{t('pregnant_women')}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3 cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => handleCategoryClick('all')}>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="rounded-full bg-accent/10 p-3">
                      <UserCheck className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-bold">{stats.totalPatients}</p>
                      <p className="text-xs text-muted-foreground">{t('total_patients')}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3 cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => handleCategoryClick('today_followup')}>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="rounded-full bg-warning/10 p-3">
                      <ClipboardList className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="font-bold">{stats.todaysFollowups}</p>
                      <p className="text-xs text-muted-foreground">{t('todays_followups')}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3 cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => handleCategoryClick('high_risk')}>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="rounded-full bg-destructive/10 p-3">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-bold">{stats.highRisk}</p>
                      <p className="text-xs text-muted-foreground">{t('high_risk')}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3 cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => handleCategoryClick('referrals')}>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="rounded-full bg-accent/10 p-3">
                      <Share2 className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-bold">{stats.referrals}</p>
                      <p className="text-xs text-muted-foreground">{t('referrals')}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3 cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => toast({ title: "Coming Soon", description: "Supervisor dashboard will be available soon" })}>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="rounded-full bg-primary/10 p-3">
                      <LayoutDashboard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('supervisor_dashboard')}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Main Actions */}
            <div className="space-y-3">
              <Button
                onClick={() => setActiveView("ai")}
                className="h-auto w-full flex-col gap-2 py-6"
                size="lg"
              >
                <MessageSquare className="h-8 w-8" />
                <div>
                  <div className="font-semibold">{t('ai_assistant')}</div>
                  <div className="text-xs opacity-90">Ask medical questions (Voice & Image)</div>
                </div>
              </Button>

              <Button
                onClick={() => setActiveView("entry")}
                variant="secondary"
                className="h-auto w-full flex-col gap-2 py-6"
                size="lg"
              >
                <FileText className="h-8 w-8" />
                <div>
                  <div className="font-semibold">{t('patient_entry')}</div>
                  <div className="text-xs opacity-90">Record visit details</div>
                </div>
              </Button>

              <Button
                onClick={() => { setFilterCategory(null); setActiveView("history"); }}
                variant="outline"
                className="h-auto w-full flex-col gap-2 py-6"
                size="lg"
              >
                <Users className="h-8 w-8" />
                <div>
                  <div className="font-semibold">{t('case_history')}</div>
                  <div className="text-xs opacity-90">View past records (Real-time)</div>
                </div>
              </Button>
            </div>

            {/* Quick Tips */}
            <Card className="mt-6 border-accent/20 bg-accent/5 p-4">
              <p className="text-sm font-medium text-accent">💡 Tip of the Day</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Always check for danger signs in pregnant mothers: severe headache, blurred vision, or bleeding.
              </p>
            </Card>
          </div>
        );
    }
  };

  return <div className="mx-auto max-w-md">{renderView()}</div>;
};

export default Index;
