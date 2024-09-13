import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { X } from "lucide-react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  isShort: boolean;
  startTime?: number;
}

export function VideoModal({ isOpen, onClose, videoId, isShort, startTime = 0 }: VideoModalProps) {
  const videoSrc = `https://www.youtube.com/embed/${videoId}?autoplay=1&start=${startTime}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={isShort ? "sm:max-w-[400px] w-11/12 p-0 overflow-hidden" : "sm:max-w-[1000px] w-11/12"}>
        <DialogHeader>
          <DialogTitle>YouTube Video</DialogTitle>
          <DialogDescription>
            {isShort ? "Watch this YouTube Short" : "Watch this YouTube video"}
          </DialogDescription>
        </DialogHeader>
        {isShort ? (
          <div className="relative bg-black h-[80vh] max-h-[800px]">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-white z-10"
            >
              <X size={24} />
            </button>
            <iframe
              src={videoSrc}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        ) : (
          <div className="aspect-video">
            <iframe
              src={videoSrc}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
