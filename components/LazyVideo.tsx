interface LazyVideoProps {
  videoId: number;
  onVideoEnd: () => void; // new prop to handle completion
}

export default function LazyVideo({ videoId, onVideoEnd }: LazyVideoProps) {
  const handleEnded = () => {
    onVideoEnd(); // inform parent that this video ended
  };

  return (
    <video
      src={`/videos/${videoId}.mp4`}
      className="w-auto h-auto max-w-full max-h-full rounded-lg"
      controls
      autoPlay
      muted
      // Removed loop so we can catch the natural end
      onEnded={handleEnded}
    />
  );
}
