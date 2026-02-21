import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Save, FileText } from 'lucide-react';
import { useUpdateConsultationSession } from '../../hooks/useQueries';
import type { ConsultationSession } from '../../backend';

interface ConsultationNotesProps {
  session: ConsultationSession;
}

export default function ConsultationNotes({ session }: ConsultationNotesProps) {
  const updateSession = useUpdateConsultationSession();
  const [notes, setNotes] = useState(session.notes);
  const [prescription, setPrescription] = useState(session.prescription || '');
  const [followUpDate, setFollowUpDate] = useState(
    session.followUpDate ? new Date(Number(session.followUpDate) / 1000000).toISOString().split('T')[0] : ''
  );

  const handleSave = async () => {
    const updatedSession: ConsultationSession = {
      ...session,
      notes,
      prescription: prescription || undefined,
      followUpDate: followUpDate ? BigInt(new Date(followUpDate).getTime() * 1000000) : undefined,
    };
    await updateSession.mutateAsync({ id: session.id, session: updatedSession });
  };

  return (
    <Card className="border-medical-200">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-medical-900">
          <FileText className="h-5 w-5 text-medical-600" />
          <span>Consultation Notes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notes">Clinical Notes</Label>
          <Textarea
            id="notes"
            placeholder="Enter consultation notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prescription">Prescription</Label>
          <Textarea
            id="prescription"
            placeholder="Enter prescription details..."
            value={prescription}
            onChange={(e) => setPrescription(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="followup">Follow-up Date</Label>
          <Input
            id="followup"
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
        </div>
        <Button
          onClick={handleSave}
          disabled={updateSession.isPending}
          className="w-full bg-medical-600 hover:bg-medical-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {updateSession.isPending ? 'Saving...' : 'Save Notes'}
        </Button>
      </CardContent>
    </Card>
  );
}
