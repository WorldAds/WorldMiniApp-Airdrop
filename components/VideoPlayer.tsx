"use client";

import { useEffect, useState, useRef } from 'react';

interface VideoPlayerProps {
  videoSrc: string;
  onVideoEnd?: () => void;
}

export default function VideoPlayer({ videoSrc, onVideoEnd }: VideoPlayerProps) {
  const [isYouTube, setIsYouTube] = useState(false);
  const [youtubeId, setYoutubeId] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if it's a YouTube URL
  useEffect(() => {
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = videoSrc.match(youtubeRegex);
    
    if (match && match[1]) {
      setIsYouTube(true);
      setYoutubeId(match[1]);
    } else {
      setIsYouTube(false);
    }
  }, [videoSrc]);

  // Handle video visibility changes
  useEffect(() => {
    // Create an IntersectionObserver to detect when the video is visible
    if (!isYouTube && videoRef.current) {
      // Initially pause the video to prevent auto-play when entering from another page
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Video is visible, start playing
              console.log("Video is visible, starting playback");
              const playPromise = videoRef.current?.play();
              
              if (playPromise !== undefined) {
                playPromise
                  .then(() => {
                    setIsPlaying(true);
                  })
                  .catch((error) => {
                    console.warn("Auto-play was prevented:", error);
                    setIsPlaying(false);
                  });
              }
            } else {
              // Video is not visible, pause it
              console.log("Video is not visible, pausing playback");
              videoRef.current?.pause();
              setIsPlaying(false);
            }
          });
        },
        { threshold: 0.5 } // Trigger when at least 50% of the video is visible
      );
      
      // Start observing the video element
      observer.observe(videoRef.current);
      
      // Clean up the observer when component unmounts
      return () => {
        if (videoRef.current) {
          videoRef.current.pause();
          observer.disconnect();
        }
      };
    }
  }, [isYouTube]);

  const handleVideoEnded = () => {
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

  // Toggle play/pause when clicking on the video (for non-YouTube videos)
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  // Handle YouTube player visibility
  const youtubePlayerRef = useRef<HTMLDivElement>(null);
  const ytPlayerInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (isYouTube && youtubePlayerRef.current) {
      // Create an IntersectionObserver to detect when the YouTube player is visible
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // YouTube player is visible, play it
              console.log("YouTube video is visible, starting playback");
              if (ytPlayerInstanceRef.current && typeof ytPlayerInstanceRef.current.playVideo === 'function') {
                ytPlayerInstanceRef.current.playVideo();
                setIsPlaying(true);
              }
            } else {
              // YouTube player is not visible, pause it
              console.log("YouTube video is not visible, pausing playback");
              if (ytPlayerInstanceRef.current && typeof ytPlayerInstanceRef.current.pauseVideo === 'function') {
                ytPlayerInstanceRef.current.pauseVideo();
                setIsPlaying(false);
              }
            }
          });
        },
        { threshold: 0.5 } // Trigger when at least 50% of the player is visible
      );
      
      // Start observing the YouTube player element
      observer.observe(youtubePlayerRef.current);
      
      // Clean up the observer when component unmounts
      return () => {
        observer.disconnect();
      };
    }
  }, [isYouTube, youtubePlayerRef.current]);

  if (isYouTube) {
    return (
      <div 
        ref={youtubePlayerRef}
        className="flex items-center justify-center w-full h-full"
      >
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&mute=0&controls=1&enablejsapi=1&playsinline=1&rel=0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full max-w-[100vw] max-h-[100vh] rounded-lg"
          id={`youtube-player-${youtubeId}`} // Unique ID for each YouTube player
          onLoad={() => {
            // Add event listener for YouTube iframe API
            if (!window.YT) {
              const script = document.createElement('script');
              script.src = 'https://www.youtube.com/iframe_api';
              document.body.appendChild(script);
            }
            
            // This function will be called when the YouTube API is ready
            const initYouTubePlayer = () => {
              if (window.YT && window.YT.Player) {
                const playerId = `youtube-player-${youtubeId}`;
                const iframe = document.getElementById(playerId);
                if (iframe) {
                  ytPlayerInstanceRef.current = new window.YT.Player(playerId, {
                    events: {
                      onReady: (event) => {
                        console.log("YouTube player ready");
                        // Don't automatically play - let the IntersectionObserver handle this
                        // Initially pause to prevent auto-play when entering from another page
                        event.target.pauseVideo();
                        setIsPlaying(false);
                      },
                      onStateChange: (event) => {
                        // State 0 means the video has ended
                        if (event.data === 0 && onVideoEnd) {
                          onVideoEnd();
                        }
                      }
                    }
                  });
                }
              }
            };
            
            // If YT API is already loaded, initialize player
            if (window.YT && window.YT.Player) {
              initYouTubePlayer();
            } else {
              // Otherwise, set up a callback for when it loads
              window.onYouTubeIframeAPIReady = initYouTubePlayer;
            }
          }}
        />
      </div>
    );
  }

  // We've moved this functionality to the first useEffect hook

  return (
    <div 
      className="flex items-center justify-center w-full h-full"
      onClick={togglePlayPause}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        controls
        muted // Start muted to increase chances of autoplay
        playsInline
        className="w-full h-full max-w-[100vw] max-h-[100vh] object-contain rounded-lg"
        onEnded={handleVideoEnded}
      />
    </div>
  );
}
