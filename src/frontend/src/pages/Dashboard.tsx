import { useGetAllPatients, useGetAllAppointments } from '../hooks/useQueries';
import PatientCard from '../components/patients/PatientCard';
import AppointmentWidget from '../components/appointments/AppointmentWidget';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Calendar, Activity, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data: patients = [], isLoading: patientsLoading } = useGetAllPatients();
  const { data: appointments = [], isLoading: appointmentsLoading } = useGetAllAppointments();

  const upcomingAppointments = appointments
    .filter((apt) => Number(apt.time) > Date.now() * 1000000)
    .sort((a, b) => Number(a.time) - Number(b.time))
    .slice(0, 5);

  const recentPatients = patients.slice(0, 4);

  const stats = [
    { label: 'Total Patients', value: patients.length, icon: Users, color: 'text-medical-600' },
    { label: 'Appointments', value: appointments.length, icon: Calendar, color: 'text-health-600' },
    { label: 'Active Sessions', value: 0, icon: Activity, color: 'text-accent-600' },
    { label: 'This Month', value: appointments.filter(a => {
      const aptDate = new Date(Number(a.time) / 1000000);
      const now = new Date();
      return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
    }).length, icon: TrendingUp, color: 'text-success-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="relative h-48 rounded-2xl overflow-hidden shadow-lg">
        <img
          src="/assets/generated/telemedicine-hero.dim_1200x400.png"
          alt="Telemedicine Platform"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-medical-900/80 to-medical-600/60 flex items-center">
          <div className="px-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome to Your Dashboard</h2>
            <p className="text-medical-100 text-lg">Manage your patients and appointments efficiently</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-medical-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-medical-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-medical-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={cn('p-3 rounded-xl bg-medical-50', stat.color)}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-medical-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-medical-900">
              <Calendar className="h-5 w-5 text-medical-600" />
              <span>Upcoming Appointments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentWidget key={appointment.id} appointment={appointment} />
                ))}
              </div>
            ) : (
              <p className="text-medical-600 text-center py-8">No upcoming appointments</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-medical-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-medical-900">
              <Users className="h-5 w-5 text-medical-600" />
              <span>Recent Patients</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patientsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : recentPatients.length > 0 ? (
              <div className="space-y-3">
                {recentPatients.map((patient) => (
                  <PatientCard key={patient.id} patient={patient} compact />
                ))}
              </div>
            ) : (
              <p className="text-medical-600 text-center py-8">No patients yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
