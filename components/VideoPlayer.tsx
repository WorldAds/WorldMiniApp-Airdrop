"use client";

interface VideoPlayerProps {
  videoSrc: string;
}

export default function VideoPlayer({ videoSrc }: VideoPlayerProps) {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <video
        src={videoSrc}
        controls
        autoPlay
        className="w-full h-full max-w-[100vw] max-h-[100vh] object-contain rounded-lg"

      />
    </div>
  );
  
}
