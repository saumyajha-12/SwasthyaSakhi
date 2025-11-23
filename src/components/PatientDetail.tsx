import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, User, Calendar, MapPin, Phone, Droplet } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PatientDetailProps {
  patient: {
    id: string;
    patient_name: string;
    patient_age: number | null;
    village: string | null;
    phone_number: string | null;
    blood_group: string | null;
    case_type: string;
    status: string | null;
    priority: string | null;
    summary: string | null;
    created_at: string;
    case_data: any;
  };
  onBack: () => void;
}

const PatientDetail = ({ patient, onBack }: PatientDetailProps) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/95 p-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-semibold">{t('patient_name')}</h2>
            <p className="text-xs text-muted-foreground">{patient.case_type}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Patient Info Card */}
        <Card className="p-4">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{patient.patient_name}</h3>
              <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                {patient.patient_age && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{patient.patient_age} years</span>
                  </div>
                )}
                {patient.village && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{patient.village}</span>
                  </div>
                )}
                {patient.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{patient.phone_number}</span>
                  </div>
                )}
                {patient.blood_group && (
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4" />
                    <span className="font-semibold">{patient.blood_group}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Status Card */}
        <Card className="p-4">
          <h4 className="font-semibold mb-3">{t('status')}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">{t('status')}</p>
              <p className="font-medium capitalize">{patient.status || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('priority')}</p>
              <p className="font-medium capitalize">{patient.priority || 'N/A'}</p>
            </div>
          </div>
        </Card>

        {/* Summary Card */}
        {patient.summary && (
          <Card className="p-4">
            <h4 className="font-semibold mb-2">{t('summary')}</h4>
            <p className="text-sm text-muted-foreground">{patient.summary}</p>
          </Card>
        )}

        {/* Case Data Card */}
        {patient.case_data && (
          <Card className="p-4">
            <h4 className="font-semibold mb-3">Medical Details</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(patient.case_data as object).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-muted-foreground capitalize">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Date Card */}
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Case Created</h4>
          <p className="text-sm text-muted-foreground">
            {new Date(patient.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default PatientDetail;
