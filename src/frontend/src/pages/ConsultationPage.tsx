import { useParams } from '@tanstack/react-router';
import { useGetConsultationSession } from '../hooks/useQueries';
import VideoCallPlaceholder from '../components/consultation/VideoCallPlaceholder';
import ConsultationControls from '../components/consultation/ConsultationControls';
import ConsultationNotes from '../components/consultation/ConsultationNotes';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

export default function ConsultationPage() {
  const { sessionId } = useParams({ from: '/consultation/$sessionId' });
  const { data: session, isLoading } = useGetConsultationSession(sessionId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-medical-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-medical-900 mb-2">Session Not Found</h2>
          <p className="text-medical-600">The consultation session you're looking for doesn't exist or you don't have access to it.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-medical-900">Consultation Session</h1>
        <p className="text-medical-600 mt-1">Session ID: {session.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <VideoCallPlaceholder />
          <ConsultationControls sessionId={session.id} />
        </div>
        <div>
          <ConsultationNotes session={session} />
        </div>
      </div>
    </div>
  );
}
