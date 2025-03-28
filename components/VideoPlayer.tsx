"use client";

import React, { useState, useEffect, useRef } from "react";

// Define global YouTube API types
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface VideoPlayerProps {
  videoSrc: string;
  onVideoEnd?: () => void;
  allowProgressControl?: boolean;
  isActive?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoSrc,
  onVideoEnd,
  allowProgressControl = false,
  isActive = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isYouTube, setIsYouTube] = useState(false);
  const [youtubeId, setYoutubeId] = useState("");
  const [youtubePlayer, setYoutubePlayer] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Extract YouTube ID from URL
  useEffect(() => {
    const getYouTubeId = (url: string) => {
      // Handle YouTube Shorts URLs
      if (url.includes("youtube.com/shorts/")) {
        const shortsId = url.split("youtube.com/shorts/")[1];
        // Remove any query parameters or hash
        return shortsId.split(/[?#]/)[0];
      }
      
      // Regular YouTube URL handling
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
    };

    const isYT =
      videoSrc.includes("youtube.com") ||
      videoSrc.includes("youtu.be") ||
      videoSrc.includes("youtube-nocookie.com");

    setIsYouTube(isYT);

    if (isYT) {
      const id = getYouTubeId(videoSrc);
      if (id) {
        setYoutubeId(id);
        
        // Load YouTube API if not already loaded
        if (typeof window !== 'undefined' && !window.YT) {
          console.log("Loading YouTube API from main component effect");
          const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          
          // Set up callback for when API is ready
          window.onYouTubeIframeAPIReady = () => {
            console.log("YouTube API ready from main component effect");
          };
          
          document.body.appendChild(tag);
        }
      }
    }

    setIsMounted(true);
  }, [videoSrc]);

  // Handle visibility detection
  useEffect(() => {
    const currentContainer = containerRef.current;
    if (!currentContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.5,
      }
    );

    observer.observe(currentContainer);

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
    };
  }, []);

  // Handle auto play/pause based on visibility and isActive status
  useEffect(() => {
    if (!isMounted) return;

    if (isVisible && isActive) {
      if (isYouTube) {
        if (youtubePlayer && typeof youtubePlayer.playVideo === "function") {
          youtubePlayer.playVideo();
        }
      } else if (videoRef.current) {
        videoRef.current.play().catch((error) => {
          console.warn("Autoplay failed:", error);
        });
      }
      setIsPlaying(true);
    } else {
      if (isYouTube) {
        if (youtubePlayer && typeof youtubePlayer.pauseVideo === "function") {
          youtubePlayer.pauseVideo();
        }
      } else if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
    }
  }, [isVisible, isYouTube, youtubePlayer, isMounted, isActive]);

  // Pause all videos when component unmounts
  useEffect(() => {
    // Store ref in a variable to avoid issues with cleanup function
    const videoElement = videoRef.current;
    
    return () => {
      if (isYouTube) {
        if (youtubePlayer && typeof youtubePlayer.pauseVideo === "function") {
          youtubePlayer.pauseVideo();
        }
      } else if (videoElement) {
        videoElement.pause();
      }
    };
  }, [isYouTube, youtubePlayer]);

  // Update progress for HTML5 video
  useEffect(() => {
    if (!videoRef.current || isYouTube) return;

    const updateProgress = () => {
      if (!videoRef.current) return;
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 0;
      setCurrentTime(currentTime);
      setDuration(duration);
      setProgress((currentTime / duration) * 100);
    };

    const video = videoRef.current;
    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("durationchange", updateProgress);
    video.addEventListener("ended", () => {
      setIsPlaying(false);
      if (onVideoEnd) onVideoEnd();
    });

    return () => {
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("durationchange", updateProgress);
      video.removeEventListener("ended", () => {
        if (onVideoEnd) onVideoEnd();
      });
    };
  }, [isYouTube, onVideoEnd]);

  // Handle YouTube player state changes
  const onPlayerStateChange = (event: any) => {
    // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (event.data === 0) {
      // Video ended
      setIsPlaying(false);
      if (onVideoEnd) onVideoEnd();
    } else if (event.data === 1) {
      // Video playing
      setIsPlaying(true);
    } else if (event.data === 2) {
      // Video paused
      setIsPlaying(false);
    }
  };

  // Update progress for YouTube video
  useEffect(() => {
    if (!isYouTube || !youtubePlayer) return;

    let interval: NodeJS.Timeout;

    if (isPlaying) {
      interval = setInterval(() => {
        if (youtubePlayer && typeof youtubePlayer.getCurrentTime === "function") {
          const currentTime = youtubePlayer.getCurrentTime();
          const duration = youtubePlayer.getDuration();
          setCurrentTime(currentTime);
          setDuration(duration);
          setProgress((currentTime / duration) * 100);
        }
      }, 200);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isYouTube, youtubePlayer, isPlaying]);

  const togglePlayPause = () => {
    if (isYouTube) {
      if (youtubePlayer) {
        if (isPlaying) {
          youtubePlayer.pauseVideo();
        } else {
          youtubePlayer.playVideo();
        }
      }
    } else {
      if (!videoRef.current) return;
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!allowProgressControl) return;
    
    const progressBar = progressBarRef.current;
    if (!progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const clickPercentage = (clickPosition / rect.width) * 100;
    const seekTime = (clickPercentage / 100) * duration;

    if (isYouTube) {
      if (youtubePlayer && typeof youtubePlayer.seekTo === "function") {
        youtubePlayer.seekTo(seekTime, true);
      }
    } else if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }

    setProgress(clickPercentage);
  };

  const handleProgressDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!allowProgressControl) return;
    setIsDragging(true);
    handleProgressDrag(e);
  };

  const handleProgressDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!allowProgressControl || !isDragging) return;
    
    const progressBar = progressBarRef.current;
    if (!progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const dragPosition = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const dragPercentage = (dragPosition / rect.width) * 100;
    
    setProgress(dragPercentage);
  };

  const handleProgressDragEnd = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!allowProgressControl || !isDragging) return;
    
    const progressBar = progressBarRef.current;
    if (!progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const dragPosition = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const dragPercentage = (dragPosition / rect.width) * 100;
    const seekTime = (dragPercentage / 100) * duration;

    if (isYouTube) {
      if (youtubePlayer && typeof youtubePlayer.seekTo === "function") {
        youtubePlayer.seekTo(seekTime, true);
      }
    } else if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }

    setIsDragging(false);
  };

  // Add global mouse move and up handlers for dragging
  useEffect(() => {
    if (!allowProgressControl) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        const progressBar = progressBarRef.current;
        if (!progressBar) return;

        const rect = progressBar.getBoundingClientRect();
        const dragPosition = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const dragPercentage = (dragPosition / rect.width) * 100;
        
        setProgress(dragPercentage);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        const progressBar = progressBarRef.current;
        if (!progressBar) return;

        const rect = progressBar.getBoundingClientRect();
        const dragPosition = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const dragPercentage = (dragPosition / rect.width) * 100;
        const seekTime = (dragPercentage / 100) * duration;

        if (isYouTube) {
          if (youtubePlayer && typeof youtubePlayer.seekTo === "function") {
            youtubePlayer.seekTo(seekTime, true);
          }
        } else if (videoRef.current) {
          videoRef.current.currentTime = seekTime;
        }

        setIsDragging(false);
      }
    };

    // Add touch event handlers for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        const progressBar = progressBarRef.current;
        if (!progressBar) return;

        const rect = progressBar.getBoundingClientRect();
        const touch = e.touches[0];
        const dragPosition = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
        const dragPercentage = (dragPosition / rect.width) * 100;
        
        setProgress(dragPercentage);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isDragging) {
        const progressBar = progressBarRef.current;
        if (!progressBar) return;

        const rect = progressBar.getBoundingClientRect();
        const touch = e.changedTouches[0];
        const dragPosition = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
        const dragPercentage = (dragPosition / rect.width) * 100;
        const seekTime = (dragPercentage / 100) * duration;

        if (isYouTube) {
          if (youtubePlayer && typeof youtubePlayer.seekTo === "function") {
            youtubePlayer.seekTo(seekTime, true);
          }
        } else if (videoRef.current) {
          videoRef.current.currentTime = seekTime;
        }

        setIsDragging(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, allowProgressControl, duration, isYouTube, youtubePlayer]);

  // Helper function to initialize YouTube player
  function initYoutubePlayer() {
    console.log("Initializing YouTube player for ID:", youtubeId);
    
    if (window.YT && window.YT.Player) {
      try {
        console.log("Creating new YouTube player instance");
        
        // Check if element exists
        const playerElement = document.getElementById(`youtube-player-${youtubeId}`);
        if (!playerElement) {
          console.error(`Player element with ID youtube-player-${youtubeId} not found`);
          return;
        }
        
        const player = new window.YT.Player(`youtube-player-${youtubeId}`, {
          events: {
            onReady: (event: any) => {
              console.log("YouTube player ready");
              setYoutubePlayer(event.target);
              setDuration(event.target.getDuration());
              
              // Force play if active
              if (isActive) {
                console.log("Auto-playing YouTube video because isActive=true");
                // Use a longer timeout for more reliability
                setTimeout(() => {
                  try {
                    console.log("Attempting to play video now");
                    event.target.playVideo();
                    
                    // Double-check playback after a short delay
                    setTimeout(() => {
                      const state = event.target.getPlayerState();
                      console.log("Player state after play attempt:", state);
                      
                      // If not playing (state !== 1), try again
                      if (state !== 1) {
                        console.log("Video not playing, trying again");
                        event.target.playVideo();
                      }
                    }, 500);
                  } catch (e) {
                    console.error("Error playing video:", e);
                  }
                }, 300);
              }
            },
            onStateChange: (event: any) => {
              console.log("YouTube player state changed:", event.data);
              onPlayerStateChange(event);
            },
            onError: (event: any) => {
              console.error("YouTube player error:", event.data);
            }
          }
        });
      } catch (error) {
        console.error("Error initializing YouTube player:", error);
      }
    } else {
      console.warn("YouTube API not available yet");
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center bg-black"
    >
      {isYouTube ? (
        <div className="w-full h-full">
          {isMounted && youtubeId && (
            <iframe
              id={`youtube-player-${youtubeId}`}
              src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&autoplay=0&controls=0&modestbranding=1&rel=0&showinfo=0&fs=0&playsinline=1&origin=${window.location.origin}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => {
                console.log(`YouTube iframe loaded for ID: ${youtubeId}`);
                
                // Wait for iframe to be fully loaded before initializing player
                setTimeout(() => {
                  // Initialize YouTube API if not already loaded
                  if (!window.YT) {
                    console.log("Loading YouTube API");
                    const tag = document.createElement('script');
                    tag.src = 'https://www.youtube.com/iframe_api';
                    
                    // Set up callback for when API is ready
                    window.onYouTubeIframeAPIReady = () => {
                      console.log("YouTube API ready, initializing player");
                      setTimeout(() => {
                        initYoutubePlayer();
                      }, 300);
                    };
                    
                    document.body.appendChild(tag);
                  } else {
                    // API already loaded, initialize player directly
                    console.log("YouTube API already loaded, initializing player directly");
                    initYoutubePlayer();
                  }
                }, 300); // Add a delay to ensure iframe is fully loaded
              }}
            />
          )}
        </div>
      ) : (
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-contain"
          playsInline
          muted={false}
          controls={false}
          onEnded={() => {
            if (onVideoEnd) onVideoEnd();
          }}
        />
      )}

      {/* Custom controls */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2"
        onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling up
      >
        {/* Progress bar */}
        <div 
          ref={progressBarRef}
          className={`w-full h-2 bg-gray-600 rounded-full mb-2 ${allowProgressControl ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={(e) => {
            e.stopPropagation(); // Prevent clicks from bubbling up
            if (allowProgressControl) handleProgressClick(e);
          }}
          onMouseDown={(e) => {
            e.stopPropagation(); // Prevent events from bubbling up
            if (allowProgressControl) handleProgressDragStart(e);
          }}
          onTouchStart={(e) => {
            e.stopPropagation(); // Prevent events from bubbling up
            if (allowProgressControl) setIsDragging(true);
          }}
        >
          <div
            ref={progressRef}
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Time display */}
        <div className="flex justify-between text-white text-xs">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
export type { VideoPlayerProps };
