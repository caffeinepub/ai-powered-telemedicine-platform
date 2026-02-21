import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Calendar } from 'lucide-react';
import { useState } from 'react';

interface ConsultationControlsProps {
  sessionId: string;
}

export default function ConsultationControls({ sessionId }: ConsultationControlsProps) {
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  return (
    <Card className="border-medical-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={videoEnabled ? 'default' : 'destructive'}
            size="lg"
            onClick={() => setVideoEnabled(!videoEnabled)}
            className="w-16 h-16 rounded-full"
          >
            {videoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </Button>
          <Button
            variant={audioEnabled ? 'default' : 'destructive'}
            size="lg"
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="w-16 h-16 rounded-full"
          >
            {audioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="w-16 h-16 rounded-full"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-16 h-16 rounded-full border-medical-300"
          >
            <Calendar className="h-6 w-6" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
