import { useState } from 'react';
import { useGetAllAppointments, useGetAllPatients, useCreateAppointment } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AppointmentWidget from '../components/appointments/AppointmentWidget';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Appointment } from '../backend';

export default function AppointmentsPage() {
  const { data: appointments = [], isLoading } = useGetAllAppointments();
  const { data: patients = [] } = useGetAllPatients();
  const { identity } = useInternetIdentity();
  const createAppointment = useCreateAppointment();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    time: '',
    reason: '',
  });

  const now = Date.now() * 1000000;
  const upcomingAppointments = appointments
    .filter((apt) => Number(apt.time) > now)
    .sort((a, b) => Number(a.time) - Number(b.time));
  
  const pastAppointments = appointments
    .filter((apt) => Number(apt.time) <= now)
    .sort((a, b) => Number(b.time) - Number(a.time));

  const handleCreateAppointment = async () => {
    if (newAppointment.patientId && newAppointment.time && newAppointment.reason && identity) {
      const appointmentToCreate: Appointment = {
        id: `appointment-${Date.now()}`,
        patientId: newAppointment.patientId,
        doctorId: identity.getPrincipal(),
        time: BigInt(new Date(newAppointment.time).getTime() * 1000000),
        reason: newAppointment.reason,
      };
      await createAppointment.mutateAsync(appointmentToCreate);
      setIsDialogOpen(false);
      setNewAppointment({ patientId: '', time: '', reason: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-medical-900">Appointments</h1>
          <p className="text-medical-600 mt-1">Schedule and manage appointments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-600 hover:bg-medical-700">
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Appointment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="patient">Patient</Label>
                <Select value={newAppointment.patientId} onValueChange={(value) => setNewAppointment({ ...newAppointment, patientId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointment-time">Date & Time</Label>
                <Input
                  id="appointment-time"
                  type="datetime-local"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Input
                  id="reason"
                  placeholder="Annual checkup, follow-up, etc."
                  value={newAppointment.reason}
                  onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateAppointment} disabled={createAppointment.isPending}>
                {createAppointment.isPending ? 'Scheduling...' : 'Schedule Appointment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <AppointmentWidget key={appointment.id} appointment={appointment} showActions />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-medical-50 rounded-lg border border-medical-200">
              <CalendarIcon className="h-12 w-12 text-medical-400 mx-auto mb-4" />
              <p className="text-medical-600 text-lg">No upcoming appointments</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past" className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : pastAppointments.length > 0 ? (
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <AppointmentWidget key={appointment.id} appointment={appointment} isPast />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-medical-50 rounded-lg border border-medical-200">
              <CalendarIcon className="h-12 w-12 text-medical-400 mx-auto mb-4" />
              <p className="text-medical-600 text-lg">No past appointments</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
