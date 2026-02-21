import { useState } from 'react';
import { useGetAllPatients, useCreatePatient, useDeletePatient } from '../hooks/useQueries';
import PatientCard from '../components/patients/PatientCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Patient } from '../backend';

export default function PatientsPage() {
  const { data: patients = [], isLoading } = useGetAllPatients();
  const createPatient = useCreatePatient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newPatient, setNewPatient] = useState<Patient>({
    id: '',
    name: '',
    age: BigInt(0),
    medicalHistory: '',
  });

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePatient = async () => {
    if (newPatient.name && newPatient.age > 0) {
      const patientToCreate = {
        ...newPatient,
        id: `patient-${Date.now()}`,
      };
      await createPatient.mutateAsync(patientToCreate);
      setIsDialogOpen(false);
      setNewPatient({ id: '', name: '', age: BigInt(0), medicalHistory: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-medical-900">Patients</h1>
          <p className="text-medical-600 mt-1">Manage your patient records</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-600 hover:bg-medical-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="patient-name">Patient Name</Label>
                <Input
                  id="patient-name"
                  placeholder="John Doe"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-age">Age</Label>
                <Input
                  id="patient-age"
                  type="number"
                  placeholder="35"
                  value={newPatient.age === BigInt(0) ? '' : Number(newPatient.age)}
                  onChange={(e) => setNewPatient({ ...newPatient, age: BigInt(e.target.value || 0) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medical-history">Medical History</Label>
                <Textarea
                  id="medical-history"
                  placeholder="Enter medical history..."
                  value={newPatient.medicalHistory}
                  onChange={(e) => setNewPatient({ ...newPatient, medicalHistory: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreatePatient} disabled={createPatient.isPending}>
                {createPatient.isPending ? 'Creating...' : 'Create Patient'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-medical-400" />
        <Input
          placeholder="Search patients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 border-medical-300"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-medical-600 text-lg">
            {searchQuery ? 'No patients found matching your search' : 'No patients yet. Add your first patient to get started.'}
          </p>
        </div>
      )}
    </div>
  );
}
