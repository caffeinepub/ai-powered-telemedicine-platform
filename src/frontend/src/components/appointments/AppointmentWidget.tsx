import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Video, Trash2 } from 'lucide-react';
import { useGetAllPatients, useDeleteAppointment, useCreateConsultationSession } from '../../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import type { Appointment } from '../../backend';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AppointmentWidgetProps {
  appointment: Appointment;
  showActions?: boolean;
  isPast?: boolean;
}

export default function AppointmentWidget({ appointment, showActions = false, isPast = false }: AppointmentWidgetProps) {
  const { data: patients = [] } = useGetAllPatients();
  const deleteAppointment = useDeleteAppointment();
  const createConsultation = useCreateConsultationSession();
  const navigate = useNavigate();

  const patient = patients.find((p) => p.id === appointment.patientId);
  const appointmentDate = new Date(Number(appointment.time) / 1000000);

  const handleDelete = async () => {
    await deleteAppointment.mutateAsync(appointment.id);
  };

  const handleStartConsultation = async () => {
    const sessionId = `session-${Date.now()}`;
    await createConsultation.mutateAsync({
      id: sessionId,
      appointmentId: appointment.id,
      notes: '',
      prescription: undefined,
      followUpDate: undefined,
    });
    navigate({ to: `/consultation/${sessionId}` });
  };

  return (
    <Card className="border-medical-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <img src="/assets/generated/calendar-icon.dim_64x64.png" alt="" className="w-5 h-5" />
              <h4 className="font-semibold text-medical-900">{patient?.name || 'Unknown Patient'}</h4>
              {isPast && <Badge variant="secondary" className="text-xs">Completed</Badge>}
            </div>
            <div className="flex items-center space-x-4 text-sm text-medical-600">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{appointmentDate.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
            <p className="text-sm text-medical-700">
              <span className="font-medium">Reason:</span> {appointment.reason}
            </p>
          </div>
          {showActions && !isPast && (
            <div className="flex items-center space-x-2 ml-4">
              <Button
                size="sm"
                onClick={handleStartConsultation}
                disabled={createConsultation.isPending}
                className="bg-health-600 hover:bg-health-700"
              >
                <Video className="h-4 w-4 mr-1" />
                Start
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this appointment? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                      Cancel Appointment
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
