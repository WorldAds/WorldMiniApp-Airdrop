"use client";

import React, {
  useState,
  useEffect,
  Suspense,
  useRef,
  useCallback,
} from "react";
import Footer from "./Footer";
import AdActionButtons from "./AdActionButtons";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/mousewheel";
import "swiper/css/keyboard";
import { getAdsList } from "@/app/api/service";
import VideoPlayer from "./VideoPlayer";
import HTMLContent from "./HTMLContent";
import Image from "next/image";
import { Ad } from "@/@types/data";
import VideoRewardAnimation from "./VideoRewardAnimation"; // New component for video rewards

export default function AdsComponent() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const [completedAds, setCompletedAds] = useState<Record<string, boolean>>({});
  const [showReward, setShowReward] = useState<Record<string, boolean>>({});
  const [showVideoReward, setShowVideoReward] = useState<
    Record<string, boolean>
  >({}); // New state for video rewards
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [viewStartTime, setViewStartTime] = useState<Record<string, number>>(
    {}
  );
  const currentVideoRef = useRef<string | null>(null);

  // Function to pause all videos
  const pauseAllVideos = useCallback(() => {
    // Pause all HTML5 videos
    document.querySelectorAll("video").forEach((video) => {
      video.pause();
    });

    // Pause all YouTube videos
    if (window.YT && typeof window.YT.get === "function") {
      document
        .querySelectorAll('iframe[src*="youtube.com"]')
        .forEach((iframe) => {
          try {
            const player = window.YT?.get(iframe.id);
            if (player && typeof player.pauseVideo === "function") {
              player.pauseVideo();
            }
          } catch (e) {
            console.warn("Error pausing YouTube player:", e);
          }
        });
    }

    // Clear current video reference when pausing all
    currentVideoRef.current = null;
  }, []);

  // Update the autoPlayCurrentVideo function to be more reliable
  const autoPlayCurrentVideo = useCallback(() => {
    if (!currentVideoRef.current) return;

    // Pause all other videos first to ensure only one plays at a time
    const pauseAllVideos = () => {
      // Find all video elements and pause them
      const videoElements = document.querySelectorAll("video");
      videoElements.forEach((video) => {
        video.pause();
      });

      // Find all YouTube iframes and pause them if possible
      const youtubeIframes = document.querySelectorAll(
        'iframe[src*="youtube.com"]'
      );
      youtubeIframes.forEach((iframe) => {
        try {
          // Try to access the contentWindow to send a postMessage
          const contentWindow = (iframe as HTMLIFrameElement).contentWindow;
          if (contentWindow) {
            contentWindow.postMessage(
              '{"event":"command","func":"pauseVideo","args":""}',
              "*"
            );
          }
        } catch (e) {
          console.log("Could not pause YouTube iframe:", e);
        }
      });
    };

    // Pause all videos first
    pauseAllVideos();

    // Add a longer delay to ensure the player is ready
    setTimeout(() => {
      const currentAd = ads.find((ad) => ad._id === currentVideoRef.current);
      if (currentAd) {
        // Log the current ad being played
        console.log(
          "Auto-playing video for ad:",
          currentAd.adsName,
          "URL:",
          currentAd.creativeURL
        );

        // For YouTube Shorts, we need special handling
        if (currentAd.creativeURL.includes("youtube.com/shorts/")) {
          console.log("Detected YouTube Shorts URL, applying special handling");

          // Find the specific iframe for this ad
          const adContainer = document.querySelector(
            `[data-ad-id="${currentAd._id}"]`
          );
          if (adContainer) {
            // Refresh the iframe - this is the most reliable method for Shorts
            const iframe = adContainer.querySelector("iframe");
            if (iframe) {
              console.log("Refreshing YouTube Shorts iframe");
              
              // Store original src
              const originalSrc = iframe.src;
              
              // Add autoplay=1 parameter if not already present
              let newSrc = originalSrc;
              if (!newSrc.includes("autoplay=1")) {
                newSrc = newSrc.replace("autoplay=0", "autoplay=1");
                if (!newSrc.includes("autoplay=")) {
                  newSrc += (newSrc.includes("?") ? "&" : "?") + "autoplay=1";
                }
              }
              
              // Force reload by changing src
              iframe.src = newSrc;
              
              // Don't try other methods for Shorts to avoid conflicts
              return;
            }
          }
        }
        // For regular YouTube videos, use the YouTube API
        else if (
          (currentAd.creativeURL.includes("youtube.com") || 
           currentAd.creativeURL.includes("youtu.be")) && 
          !currentAd.creativeURL.includes("shorts")
        ) {
          // Find the specific iframe for this ad
          const adContainer = document.querySelector(
            `[data-ad-id="${currentAd._id}"]`
          );
          
          if (adContainer) {
            const iframe = adContainer.querySelector("iframe");
            if (iframe) {
              try {
                // Try to send a postMessage to play the video
                const contentWindow = (iframe as HTMLIFrameElement).contentWindow;
                if (contentWindow) {
                  contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', "*");
                  console.log("Sent playVideo command via postMessage to regular YouTube video");
                }
              } catch (e) {
                console.error("Error sending postMessage to YouTube iframe:", e);
              }
            }
          }
        }
        // For regular video elements, use the standard video API
        else if (currentAd.creativeURL.match(/\.(mp4|webm|ogg|mov)$/i)) {
          const adContainer = document.querySelector(
            `[data-ad-id="${currentAd._id}"]`
          );
          
          if (adContainer) {
            const video = adContainer.querySelector("video");
            if (video) {
              try {
                video.play()
                  .then(() => console.log("Regular video playing successfully"))
                  .catch(e => console.error("Error playing regular video:", e));
              } catch (e) {
                console.error("Error with video.play():", e);
              }
            }
          }
        }
        
        // Force a re-render of the video player to ensure it's properly initialized
        // But only for non-shorts videos to avoid conflicts
        if (!currentAd.creativeURL.includes("youtube.com/shorts/")) {
          setAds((prevAds) => [...prevAds]);
        }
      }
    }, 500);
  }, [ads]);

  const handleContentComplete = (adId: string) => {
    // Only mark as completed if not already completed
    if (!completedAds[adId]) {
      setCompletedAds((prev) => ({ ...prev, [adId]: true }));

      // Find the ad to determine its type
      const ad = ads.find((ad) => ad._id === adId);

      if (ad) {
        // Only show animation for video type ads
        if (
          ad.creativeType.toLowerCase() === "video" ||
          ad.creativeURL.match(/\.(mp4|webm|ogg|mov)$/i) ||
          ad.creativeURL.includes("youtube.com") ||
          ad.creativeURL.includes("youtu.be")
        ) {
          // For video ads, show the video reward animation
          console.log(`Video ad completed: ${ad.adsName}`);
        } else {
          // For HTML and image ads, just log a message
          console.log(`Non-video ad viewed: ${ad.adsName}`);
        }
      }
    }
  };

  const handleRewardComplete = (adId: string) => {
    setShowReward((prev) => ({ ...prev, [adId]: false }));
  };

  const handleVideoRewardComplete = (adId: string) => {
    setShowVideoReward((prev) => ({ ...prev, [adId]: false }));
  };

  const renderAdContent = (ad: Ad) => {
    switch (ad.creativeType.toLowerCase()) {
      case "image":
        return (
          <div className="relative w-full h-full" data-ad-id={ad._id}>
            <Image
              src={ad.creativeURL}
              alt={ad.adsName}
              fill
              className="object-contain rounded-lg"
              onLoadingComplete={() => {
                // For images, just mark as complete without animation
                handleContentComplete(ad._id);
              }}
            />
          </div>
        );

      case "html":
        return (
          <div className="relative w-full h-full" data-ad-id={ad._id}>
            <HTMLContent
              htmlUrl={ad.creativeURL}
              onLoad={() => {
                // For HTML content, just mark as complete without animation
                handleContentComplete(ad._id);
              }}
              fallbackContent={
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <div className="text-center p-4">
                    <h3 className="text-white font-bold text-xl mb-2">
                      {ad.adsName}
                    </h3>
                    <p className="text-gray-300">
                      This content cannot be displayed in the app.
                    </p>
                    <button
                      onClick={() =>
                        window.open(
                          ad.creativeURL,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Visit Website
                    </button>
                  </div>
                </div>
              }
            />
          </div>
        );

      case "video":
        return (
          <div className="relative w-full h-full" data-ad-id={ad._id}>
            <VideoPlayer
              videoSrc={ad.creativeURL}
              onVideoEnd={() => {
                handleContentComplete(ad._id);
                // Only show reward animation for video ads
                setShowVideoReward((prev) => ({ ...prev, [ad._id]: true }));
              }}
              allowProgressControl={true}
              isActive={currentVideoRef.current === ad._id}
            />
          </div>
        );

      default:
        if (ad.creativeURL.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return (
            <div className="relative w-full h-full" data-ad-id={ad._id}>
              <Image
                src={ad.creativeURL}
                alt={ad.adsName}
                fill
                className="object-contain rounded-lg"
                onLoadingComplete={() => {
                  // For images, just mark as complete without animation
                  handleContentComplete(ad._id);
                }}
              />
            </div>
          );
        } else if (
          ad.creativeURL.match(/\.(mp4|webm|ogg|mov)$/i) ||
          ad.creativeURL.includes("youtube.com") ||
          ad.creativeURL.includes("youtu.be")
        ) {
          return (
            <div className="relative w-full h-full" data-ad-id={ad._id}>
              <VideoPlayer
                videoSrc={ad.creativeURL}
                onVideoEnd={() => {
                  handleContentComplete(ad._id);
                  // Only show reward animation for video ads
                  setShowVideoReward((prev) => ({ ...prev, [ad._id]: true }));
                }}
                allowProgressControl={true}
                isActive={currentVideoRef.current === ad._id}
              />
            </div>
          );
        }

        return (
          <div
            className="flex items-center justify-center w-full h-full"
            data-ad-id={ad._id}
          >
            <p className="text-white text-xl">
              Unsupported ad type: {ad.creativeType}
            </p>
          </div>
        );
    }
  };

  useEffect(() => {
    if (!loading && ads.length > 0) {
      const firstAd = ads[0];
      
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // Set the view start time for the first ad
      setViewStartTime((prev) => ({ ...prev, [firstAd._id]: Date.now() }));
      
      // For non-video ads, set a timer to mark as completed after 10 seconds
      if (
        firstAd.creativeType.toLowerCase() !== "video" &&
        !firstAd.creativeURL.match(/\.(mp4|webm|ogg|mov)$/i) &&
        !firstAd.creativeURL.includes("youtube.com") &&
        !firstAd.creativeURL.includes("youtu.be")
      ) {
        timerRef.current = setTimeout(() => {
          console.log(`Non-video ad viewed: ${firstAd.adsName}`);
        }, 10000);
      }
      // Auto-play the first video if it's a video ad
      else {
        // Set current video reference to the first ad
        currentVideoRef.current = firstAd._id;
        
        // Add a slight delay to ensure components are mounted
        setTimeout(() => {
          console.log("Auto-playing first video ad:", firstAd.adsName);
          autoPlayCurrentVideo();
        }, 300);
      }
      
      // Clean up function
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }
  }, [ads, loading, autoPlayCurrentVideo]);

  const handleSlideChange = (swiper: SwiperType) => {
    const newIndex = swiper.activeIndex;
    setActiveIndex(newIndex);
    
    // Pause all videos when changing slides
    pauseAllVideos();
    
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Get the current ad
    const currentAd = ads[newIndex];
    if (!currentAd) return;
    
    // Set the view start time for the current ad
    setViewStartTime((prev) => ({ ...prev, [currentAd._id]: Date.now() }));
    
    // For non-video ads, set a timer to mark as completed after 10 seconds
    if (
      currentAd.creativeType.toLowerCase() !== "video" &&
      !currentAd.creativeURL.match(/\.(mp4|webm|ogg|mov)$/i) &&
      !currentAd.creativeURL.includes("youtube.com") &&
      !currentAd.creativeURL.includes("youtu.be")
    ) {
      timerRef.current = setTimeout(() => {
        console.log(`Non-video ad viewed: ${currentAd.adsName}`);
      }, 10000);
    }
    // For video ads, set the current video reference and auto-play
    else {
      currentVideoRef.current = currentAd._id;
      
      // Add a slight delay to ensure components are mounted
      setTimeout(() => {
        console.log("Auto-playing video for slide change:", currentAd.adsName);
        autoPlayCurrentVideo();
      }, 300);
    }
  };

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const adsData = await getAdsList();
        console.log("Fetched ads:", adsData);

        setAds(adsData);
      } catch (error) {
        console.error("Failed to load ads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2A203B] flex items-center justify-center">
        <p className="text-white text-xl">Loading ads...</p>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="min-h-screen bg-[#2A203B] flex items-center justify-center">
        <p className="text-white text-xl">No ads available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2A203B] overflow-hidden">
      <main className="flex flex-col items-center justify-center">
        <Swiper
          modules={[Mousewheel, Keyboard]}
          direction="vertical"
          spaceBetween={0}
          slidesPerView={1}
          mousewheel={{
            sensitivity: 3,
            thresholdDelta: 20,
          }}
          keyboard={{
            enabled: true,
          }}
          threshold={10}
          resistance={false}
          touchReleaseOnEdges={true}
          longSwipes={true}
          longSwipesRatio={0.05}
          shortSwipes={true}
          followFinger={true}
          speed={250}
          simulateTouch={true}
          touchStartPreventDefault={false}
          touchMoveStopPropagation={false}
          grabCursor={true}
          touchAngle={45}
          touchRatio={1}
          edgeSwipeDetection={true}
          preventInteractionOnTransition={false}
          className="w-full h-[calc(100vh-3rem)]"
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={handleSlideChange}
        >
          {ads.map((ad) => (
            <SwiperSlide
              key={ad._id}
              className="flex items-center justify-center"
            >
              <div className="relative w-full h-full">
                <Suspense
                  fallback={
                    <div className="text-white">Loading ad content...</div>
                  }
                >
                  {renderAdContent(ad)}
                </Suspense>

                <div
                  className="absolute inset-0 z-10"
                  style={{
                    pointerEvents:
                      ad.creativeType.toLowerCase() === "video" ||
                      ad.creativeURL.match(/\.(mp4|webm|ogg|mov)$/i) ||
                      ad.creativeURL.includes("youtube.com") ||
                      ad.creativeURL.includes("youtu.be")
                        ? "none"
                        : "auto",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      pointerEvents:
                        ad.creativeType.toLowerCase() === "video" ||
                        ad.creativeURL.match(/\.(mp4|webm|ogg|mov)$/i) ||
                        ad.creativeURL.includes("youtube.com") ||
                        ad.creativeURL.includes("youtu.be")
                          ? "none"
                          : "auto",
                    }}
                    onClick={(e) => {
                      if (
                        ad.creativeType.toLowerCase() !== "video" &&
                        !ad.creativeURL.match(/\.(mp4|webm|ogg|mov)$/i) &&
                        !ad.creativeURL.includes("youtube.com") &&
                        !ad.creativeURL.includes("youtu.be")
                      ) {
                        e.stopPropagation();
                      }
                    }}
                  />
                </div>

                {showVideoReward[ad._id] && (
                  <VideoRewardAnimation
                    amount={10}
                    onComplete={() => handleVideoRewardComplete(ad._id)}
                  />
                )}

                {/* Swipe detection overlay - only for videos */}
                {(ad.creativeType.toLowerCase() === "video" ||
                  ad.creativeURL.match(/\.(mp4|webm|ogg|mov)$/i) ||
                  ad.creativeURL.includes("youtube.com") ||
                  ad.creativeURL.includes("youtu.be")) && (
                  <div className="absolute inset-0 z-[5]">
                    {/* Top swipe area - to go to previous slide */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[20%]"
                      onTouchStart={(e) => {
                        // Mark this as a swipe attempt
                        (e.currentTarget as any).swiping = true;
                        (e.currentTarget as any).startY = e.touches[0].clientY;
                      }}
                      onTouchMove={(e) => {
                        if ((e.currentTarget as any).swiping) {
                          // Calculate direction
                          const touch = e.touches[0];
                          const startY =
                            (e.currentTarget as any).startY || touch.clientY;
                          const deltaY = touch.clientY - startY;

                          if (deltaY > 50) {
                            // Swipe down - go to previous
                            if (swiperRef.current) {
                              swiperRef.current.slidePrev();
                              (e.currentTarget as any).swiping = false;
                            }
                          }
                        }
                      }}
                      onTouchEnd={(e) => {
                        (e.currentTarget as any).swiping = false;
                      }}
                    />

                    {/* Bottom swipe area - to go to next slide */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[20%]"
                      onTouchStart={(e) => {
                        // Mark this as a swipe attempt
                        (e.currentTarget as any).swiping = true;
                        (e.currentTarget as any).startY = e.touches[0].clientY;
                      }}
                      onTouchMove={(e) => {
                        if ((e.currentTarget as any).swiping) {
                          // Calculate direction
                          const touch = e.touches[0];
                          const startY =
                            (e.currentTarget as any).startY || touch.clientY;
                          const deltaY = touch.clientY - startY;

                          if (deltaY < -50) {
                            // Swipe up - go to next
                            if (swiperRef.current) {
                              swiperRef.current.slideNext();
                              (e.currentTarget as any).swiping = false;
                            }
                          }
                        }
                      }}
                      onTouchEnd={(e) => {
                        (e.currentTarget as any).swiping = false;
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="absolute bottom-10 left-4 z-20 p-2 rounded-lg">
                <h3 className="text-white font-bold text-xl">{ad.adsName}</h3>
              </div>

              <AdActionButtons adId={ad._id} completed={completedAds[ad._id]} />
            </SwiperSlide>
          ))}
        </Swiper>
      </main>
      <Footer />
    </div>
  );
}
