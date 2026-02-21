import { Card, CardContent } from '@/components/ui/card';
import { Video } from 'lucide-react';

export default function VideoCallPlaceholder() {
  return (
    <Card className="border-medical-200 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative bg-gradient-to-br from-medical-900 to-medical-700 aspect-video flex items-center justify-center">
          <div className="text-center space-y-4">
            <img
              src="/assets/generated/video-call-icon.dim_128x128.png"
              alt="Video Call"
              className="w-32 h-32 mx-auto opacity-80"
            />
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-white">Video Consultation Area</h3>
              <p className="text-medical-200">Video call interface would be integrated here</p>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">Ready to Connect</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
