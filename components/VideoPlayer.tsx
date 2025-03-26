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

  // Handle touch events for regular videos
  useEffect(() => {
    // Only run on client side and for non-YouTube videos
    if (typeof window !== 'undefined' && !isYouTube && videoRef.current) {
      const handleTouchStart = (e: TouchEvent) => {
        if (!videoRef.current) return;
        // Pause video immediately on touch start to ensure quick response
        videoRef.current.pause();
        setIsPlaying(false);
      };
      
      // Add the touch event listeners to the document
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      
      // Clean up
      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
      };
    }
  }, [isYouTube]);
  
  // Handle video visibility changes
  useEffect(() => {
    // Create an IntersectionObserver to detect when the video is visible
    if (!isYouTube && videoRef.current) {
      // Immediately pause the video to prevent auto-play when entering from another page
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Video is visible, start playing
              console.log("Video is visible, starting playback:", videoSrc);
              
              // Pause all other videos first to ensure only one plays at a time
              document.querySelectorAll('video').forEach(video => {
                if (video !== videoRef.current) {
                  video.pause();
                }
              });
              
              // Now play this video
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
              // Video is not visible, pause it immediately
              console.log("Video is not visible, pausing playback:", videoSrc);
              videoRef.current?.pause();
              setIsPlaying(false);
            }
          });
        },
        { 
          threshold: 0.7, // Higher threshold - only play when more of the video is visible
          rootMargin: "-10% 0px" // Slightly reduce the effective viewport
        }
      );
      
      // Start observing the video element
      observer.observe(videoRef.current);
      
      // Clean up the observer when component unmounts
      return () => {
        // Pause video and disconnect observer
        if (videoRef.current) {
          videoRef.current.pause();
          observer.disconnect();
        }
      };
    }
  }, [isYouTube, videoSrc]);

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
      // Add touch event listeners to detect swipe gestures for YouTube videos
      const handleTouchStart = (e: TouchEvent) => {
        // Pause YouTube video immediately on touch start to ensure quick response
        if (ytPlayerInstanceRef.current && typeof ytPlayerInstanceRef.current.pauseVideo === 'function') {
          ytPlayerInstanceRef.current.pauseVideo();
          setIsPlaying(false);
          console.log("Touch detected, pausing YouTube video immediately:", videoSrc);
        }
      };
      
      // Add the touch event listeners to the document
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      
      // Create an IntersectionObserver to detect when the YouTube player is visible
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // YouTube player is visible, play it
              console.log("YouTube video is visible, starting playback:", videoSrc);
              
              // Pause all other YouTube players
              if (window.YT && typeof window.YT.get === 'function') {
                // Find all YouTube iframes
                document.querySelectorAll('iframe[src*="youtube.com"]').forEach(iframe => {
                  const iframeId = iframe.id;
                  // Skip the current player
                  if (iframeId !== `youtube-player-${youtubeId}`) {
                    try {
                      const player = window.YT?.get(iframeId);
                      if (player && typeof player.pauseVideo === 'function') {
                        player.pauseVideo();
                      }
                    } catch (e) {
                      console.warn("Error pausing other YouTube player:", e);
                    }
                  }
                });
              }
              
              // Play this YouTube video
              if (ytPlayerInstanceRef.current && typeof ytPlayerInstanceRef.current.playVideo === 'function') {
                ytPlayerInstanceRef.current.playVideo();
                setIsPlaying(true);
              }
            } else {
              // YouTube player is not visible, pause it immediately
              console.log("YouTube video is not visible, pausing playback:", videoSrc);
              if (ytPlayerInstanceRef.current && typeof ytPlayerInstanceRef.current.pauseVideo === 'function') {
                ytPlayerInstanceRef.current.pauseVideo();
                setIsPlaying(false);
              }
            }
          });
        },
        { 
          threshold: 0.7, // Higher threshold - only play when more of the video is visible
          rootMargin: "-10% 0px" // Slightly reduce the effective viewport
        }
      );
      
      // Start observing the YouTube player element
      observer.observe(youtubePlayerRef.current);
      
      // Clean up the observer and event listeners when component unmounts
      return () => {
        // Remove touch event listener
        document.removeEventListener('touchstart', handleTouchStart);
        
        // Pause YouTube video and disconnect observer
        if (ytPlayerInstanceRef.current && typeof ytPlayerInstanceRef.current.pauseVideo === 'function') {
          ytPlayerInstanceRef.current.pauseVideo();
        }
        observer.disconnect();
      };
    }
  }, [isYouTube, videoSrc, youtubeId]);

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
