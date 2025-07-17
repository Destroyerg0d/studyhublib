
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface VideoTourDialogProps {
  children: React.ReactNode;
}

const VideoTourDialog = ({ children }: VideoTourDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Virtual Tour - The Study Hub</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Virtual Tour Coming Soon</h3>
            <p className="text-gray-500">
              Experience our premium library facilities with comfortable seating,<br />
              peaceful study environment, and modern amenities.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900">Silent Study Zones</h4>
            <p className="text-sm text-blue-700">Dedicated quiet areas for focused learning</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-900">24/7 Access</h4>
            <p className="text-sm text-green-700">Study anytime that suits your schedule</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-900">Modern Amenities</h4>
            <p className="text-sm text-purple-700">High-speed WiFi, charging points & AC</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoTourDialog;
