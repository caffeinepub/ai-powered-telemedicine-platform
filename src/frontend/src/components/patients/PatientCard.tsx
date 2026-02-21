import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Calendar, FileText, Trash2 } from 'lucide-react';
import { useDeletePatient } from '../../hooks/useQueries';
import type { Patient } from '../../backend';
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

interface PatientCardProps {
  patient: Patient;
  compact?: boolean;
}

export default function PatientCard({ patient, compact = false }: PatientCardProps) {
  const deletePatient = useDeletePatient();

  const handleDelete = async () => {
    await deletePatient.mutateAsync(patient.id);
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-medical-50 rounded-lg border border-medical-200 hover:border-medical-300 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-medical-600 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-medical-900">{patient.name}</p>
            <p className="text-xs text-medical-600">{Number(patient.age)} years old</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-medical-200 hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-medical-600 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-medical-900">{patient.name}</h3>
              <p className="text-sm text-medical-600">ID: {patient.id.slice(0, 12)}...</p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Patient Record</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {patient.name}'s record? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="h-4 w-4 text-medical-600" />
          <span className="text-medical-700">Age: {Number(patient.age)} years</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm">
            <FileText className="h-4 w-4 text-medical-600" />
            <span className="font-medium text-medical-700">Medical History:</span>
          </div>
          <p className="text-sm text-medical-600 line-clamp-3 pl-6">
            {patient.medicalHistory || 'No medical history recorded'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
