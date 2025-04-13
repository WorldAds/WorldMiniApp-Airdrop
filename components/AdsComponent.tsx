import React, {
  useState,
  useEffect,
  Suspense,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/effect-cards";
import "swiper/css/mousewheel";
import "swiper/css/keyboard";
import { Mousewheel, Keyboard } from "swiper/modules";
import VideoPlayer from "./VideoPlayer";
import AdActionButtons from "./AdActionButtons";
import HTMLContent from "./HTMLContent";
import Image from "next/image";
import { Ad, AdRewardParams } from "@/@types/data";
import VideoRewardAnimation from "./VideoRewardAnimation";
import HtmlRewardAnimation from "./HtmlRewardAnimation";
import ImageRewardAnimation from "./ImageRewardAnimation";
import { getAdsList, getAdsReward, postAdReward } from "@/app/api/service";
import { MiniKit } from "@worldcoin/minikit-js";
import { ERC20_ABI } from "../app/api/erc20";
import Footer from "./Footer";

const userID = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

export default function AdsComponent() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
  const [completedAds, setCompletedAds] = useState<Record<string, boolean>>({});
  const [showVideoReward, setShowVideoReward] = useState<
    Record<string, boolean>
  >({});
  const [showHtmlReward, setShowHtmlReward] = useState<Record<string, boolean>>(
    {}
  );
  const [showImageReward, setShowImageReward] = useState<
    Record<string, boolean>
  >({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [viewStartTime, setViewStartTime] = useState<Record<string, number>>(
    {}
  );
  const currentVideoRef = useRef<string | null>(null);
  const [userRewards, setUserRewards] = useState<string[]>([]);
  const [txStatus, setTxStatus] = useState<Record<string, string>>({});

  // Get ad list
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const data = await getAdsList();
        setAds(data);
        setLoading(false);
      } catch (error) {
        // Error fetching ads
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  // Get user's ad reward records
  useEffect(() => {
    const fetchUserRewards = async () => {
      try {
        const data = await getAdsReward(userID);
        // Assume API returns an array containing adId
        if (data && Array.isArray(data)) {
          // Extract all ad IDs
          const adIds = data.map((reward: any) => reward.adId);
          setUserRewards(adIds);
        }
      } catch (error) {
        // Error fetching user rewards
      }
    };

    fetchUserRewards();
  }, []);

  // Handle ad content completion
  const handleContentComplete = useCallback(
    async (adId: string) => {
      // Check if this ad has already been rewarded
      if (userRewards.includes(adId)) {
        // Ad already rewarded, skipping reward
        return;
      }

      // Mark ad as completed
      setCompletedAds((prev) => {
        if (prev[adId]) return prev;
        return { ...prev, [adId]: true };
      });

      // Get current ad
      const currentAd = ads.find((ad) => ad._id === adId);
      if (!currentAd) return;

      // Record ad completion
      // Ad completed

      try {
        // Send transaction
        // TODO 
        //await sendRewardTransaction(adId);

        // Set reward animation based on ad type
        const creativeURL = currentAd.creativeURL || "";
        const creativeType = currentAd.creativeType || "";

        if (
          creativeURL.match(/\.(mp4|webm|ogg|mov)$/i) ||
          creativeURL.includes("youtube.com") ||
          creativeURL.includes("youtu.be")
        ) {
          // Video reward
          setShowVideoReward((prev) => ({ ...prev, [adId]: true }));
        } else if (creativeType.toLowerCase() === "html") {
          // HTML reward
          setShowHtmlReward((prev) => ({ ...prev, [adId]: true }));
        } else if (
          creativeType.toLowerCase() === "image" ||
          creativeURL.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        ) {
          // Image reward
          setShowImageReward((prev) => ({ ...prev, [adId]: true }));
        }
      } catch (error) {
        // Error sending reward transaction
        // Don't show reward animation when transaction fails
      }
    },
    [ads, userRewards]
  );

  // Send reward transaction
  const sendRewardTransaction = async (adId: string) => {
    if (!MiniKit.isInstalled()) {
      // MiniKit not installed
      throw new Error("MiniKit not installed");
    }

    // Get user address
    const userAddress = MiniKit.walletAddress || userID;
    if (!userAddress) {
      // No wallet address found
      throw new Error("No wallet address found");
    }

    try {
      setTxStatus((prev) => ({ ...prev, [adId]: "pending" }));

      // Simulate reward amount (10 tokens with 18 decimals)
      const rewardAmount = "10000000000000000000";

      // Send transaction
      const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
        transaction: [
          {
            // ERC-20 contract address
            address: "0x0C964958A0a6bA84706b2C0C6547BDD24cb572Ac",
            abi: ERC20_ABI,
            functionName: "transfer",
            args: [userAddress, rewardAmount],
          },
        ],
      });

      if (finalPayload.status === "error") {
        setTxStatus((prev) => ({
          ...prev,
          [adId]: "error: " + JSON.stringify(finalPayload),
        }));
        throw new Error("Transaction error");
      } else {
        // Transaction successful
        setTxStatus((prev) => ({
          ...prev,
          [adId]: "success: " + finalPayload.transaction_id,
        }));

        // Update user reward records
        setUserRewards((prev) => [...prev, adId]);

        // Call API to update reward status
        const rewardParams: AdRewardParams = {
          adId,
          userId: userAddress,
          rewardedAmount: 10, // Simulate reward amount
          createdAt: new Date().toISOString(),
          chainId: "5", // Goerli testnet
          txHash: finalPayload.transaction_id,
        };

        await postAdReward(rewardParams);
        return finalPayload.transaction_id;
      }
    } catch (err: any) {
      // Transaction error
      setTxStatus((prev) => ({
        ...prev,
        [adId]: "error: " + (err.message || String(err)),
      }));
      throw err;
    }
  };

  const handleRewardComplete = useCallback((adId: string) => {
    setShowHtmlReward((prev) => ({ ...prev, [adId]: false }));
    setShowImageReward((prev) => ({ ...prev, [adId]: false }));
  }, []);

  const handleVideoRewardComplete = useCallback((adId: string) => {
    setShowVideoReward((prev) => ({ ...prev, [adId]: false }));
  }, []);

  const pauseAllVideos = useCallback(() => {
    // Store the current video ID before pausing
    const currentVideoId = currentVideoRef.current;
    
    // Pause all HTML5 videos
    document.querySelectorAll("video").forEach((video) => {
      try {
        video.pause();
        if (!video.paused) {
          video.pause();
        }
        // Paused HTML5 video element
      } catch (e) {
        // Error pausing video
      }
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
            // Error pausing YouTube player
          }
        });
    }

    // Don't clear the current video reference when pausing for comment drawer
    // This ensures we can resume the same video when the drawer is closed
    // currentVideoRef.current = null;
  }, []);

  const autoPlayCurrentVideo = useCallback(() => {
    if (!currentVideoRef.current) return;

    // Pause all other videos first to ensure only one plays at a time
    const pauseAllVideos = () => {
      const currentVideoId = currentVideoRef.current;

      // Find all video elements and pause them
      const videoElements = document.querySelectorAll("video");
      videoElements.forEach((video) => {
        try {
          const container = video.closest("[data-ad-id]");
          const adId = container?.getAttribute("data-ad-id");

          if (adId !== currentVideoId) {
            video.pause();
            // Paused HTML5 video
          }
        } catch (e) {
          // Error pausing video
        }
      });

      // Find all YouTube iframes and pause them if possible
      const youtubeIframes = document.querySelectorAll(
        'iframe[src*="youtube.com"]'
      );
      youtubeIframes.forEach((iframe) => {
        try {
          const container = iframe.closest("[data-ad-id]");
          const adId = container?.getAttribute("data-ad-id");

          if (adId !== currentVideoId) {
            // Try to access the contentWindow to send a postMessage
            const contentWindow = (iframe as HTMLIFrameElement).contentWindow;
            if (contentWindow) {
              contentWindow.postMessage(
                '{"event":"command","func":"pauseVideo","args":""}',
                "*"
              );
              // Paused YouTube video
            }
          }
        } catch (e) {
          // Could not pause YouTube iframe
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
        // Auto-playing video for ad

        // For YouTube Shorts, we need special handling
        if ((currentAd.creativeURL || "").includes("youtube.com/shorts/")) {
          // Detected YouTube Shorts URL, applying special handling

          // Find the specific iframe for this ad
          const adContainer = document.querySelector(
            `[data-ad-id="${currentAd._id}"]`
          );
          if (adContainer) {
            // Refresh the iframe - this is the most reliable method for Shorts
            const iframe = adContainer.querySelector("iframe");
            if (iframe) {
              // Refreshing YouTube Shorts iframe

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
          ((currentAd.creativeURL || "").includes("youtube.com") ||
            (currentAd.creativeURL || "").includes("youtu.be")) &&
          !(currentAd.creativeURL || "").includes("shorts")
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
                const contentWindow = (iframe as HTMLIFrameElement)
                  .contentWindow;
                if (contentWindow) {
                  contentWindow.postMessage(
                    '{"event":"command","func":"playVideo","args":""}',
                    "*"
                  );
                  // Sent playVideo command via postMessage
                }
              } catch (e) {
                // Error sending postMessage to YouTube iframe
              }
            }
          }
        }
        // For regular video elements, use the standard video API
        else if (
          (currentAd.creativeURL || "").match(/\.(mp4|webm|ogg|mov)$/i)
        ) {
          const adContainer = document.querySelector(
            `[data-ad-id="${currentAd._id}"]`
          );

          if (adContainer) {
            const video = adContainer.querySelector("video");
            if (video) {
              try {
                video
                  .play()
                  .then(() => {
                    /* Regular video playing successfully */
                  })
                  .catch((e) => {
                    /* Error playing regular video */
                  });
              } catch (e) {
                // Error with video.play()
              }
            }
          }
        }

        // Force a re-render of the video player to ensure it's properly initialized
        // But only for non-shorts videos to avoid conflicts
        if (!(currentAd.creativeURL || "").includes("youtube.com/shorts/")) {
          setAds((prevAds) => [...prevAds]);
        }
      }
    }, 500);
  }, [ads]);

  const handleSlideChange = (swiper: SwiperType) => {
    const newIndex = swiper.activeIndex;
    setActiveIndex(newIndex);

    const currentAd = ads[newIndex];
    const previousIndex = swiper.previousIndex;
    const previousAd = ads[previousIndex];

    if (previousAd) {
      // Previous ad info
    }
    if (currentAd) {
      // Current ad info
    }

    const isCurrentVideo =
      currentAd &&
      ((currentAd.creativeType || "").toLowerCase() === "video" ||
        (currentAd.creativeURL || "").match(/\.(mp4|webm|ogg|mov)$/i) ||
        (currentAd.creativeURL || "").includes("youtube.com") ||
        (currentAd.creativeURL || "").includes("youtu.be"));

    if (isCurrentVideo) {
      // Set current video reference
      currentVideoRef.current = currentAd._id;
      console.log("Setting current video reference to:", currentAd._id);
    }

    // Pause videos but don't clear the current video reference
    pauseAllVideos();

    if (
      previousAd &&
      ((previousAd.creativeType || "").toLowerCase() === "video" ||
        (previousAd.creativeURL || "").match(/\.(mp4|webm|ogg|mov)$/i) ||
        (previousAd.creativeURL || "").includes("youtube.com") ||
        (previousAd.creativeURL || "").includes("youtu.be"))
    ) {
      const prevAdContainer = document.querySelector(
        `[data-ad-id="${previousAd._id}"]`
      );

      if (prevAdContainer) {
        const video = prevAdContainer.querySelector("video");
        if (video) {
          try {
            video.pause();
            // Explicitly paused previous video
          } catch (e) {
            // Error pausing previous video
          }
        }

        const iframe = prevAdContainer.querySelector("iframe");
        if (
          iframe &&
          ((previousAd.creativeURL || "").includes("youtube.com") ||
            (previousAd.creativeURL || "").includes("youtu.be"))
        ) {
          try {
            const contentWindow = (iframe as HTMLIFrameElement).contentWindow;
            if (contentWindow) {
              contentWindow.postMessage(
                '{"event":"command","func":"pauseVideo","args":""}',
                "*"
              );
              // Explicitly paused previous YouTube video
            }
          } catch (e) {
            // Error pausing previous YouTube video
          }
        }
      }
    }

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Get the current ad
    if (!currentAd) return;

    // Set the view start time for the current ad
    setViewStartTime((prev) => ({ ...prev, [currentAd._id]: Date.now() }));

    // For HTML ads, set a timer to mark as completed after 10 seconds
    if ((currentAd.creativeType || "").toLowerCase() === "html") {
      // Setting timer for HTML ad
      timerRef.current = setTimeout(() => {
        // HTML ad viewed for 10 seconds
        handleContentComplete(currentAd._id);
      }, 10000);
    }
    // For Image ads, set a timer to mark as completed after 5 seconds
    else if (
      (currentAd.creativeType || "").toLowerCase() === "image" ||
      (currentAd.creativeURL || "").match(/\.(jpg|jpeg|png|gif|webp)$/i)
    ) {
      // Setting timer for Image ad
      timerRef.current = setTimeout(() => {
        // Image ad viewed for 5 seconds
        handleContentComplete(currentAd._id);
      }, 5000);
    }
    // For video ads, set the current video reference and auto-play
    else if (
      (currentAd.creativeType || "").toLowerCase() === "video" ||
      (currentAd.creativeURL || "").match(/\.(mp4|webm|ogg|mov)$/i) ||
      (currentAd.creativeURL || "").includes("youtube.com") ||
      (currentAd.creativeURL || "").includes("youtu.be")
    ) {
      currentVideoRef.current = currentAd._id;

      // Add a slight delay to ensure components are mounted
      setTimeout(() => {
        // Auto-playing video for slide change
        autoPlayCurrentVideo();
      }, 300);
    }
  };

  const renderAdContent = (ad: Ad) => {
    switch (ad.creativeType.toLowerCase()) {
      case "image":
        return (
          <div className="relative w-full h-full" data-ad-id={ad._id}>
            <Image
              src={ad.creativeURL || ""}
              alt={ad.adsName || ""}
              fill
              className="object-contain rounded-lg"
              onLoadingComplete={() => {
                // Image loaded
              }}
            />
          </div>
        );

      case "html":
        return (
          <div className="relative w-full h-full" data-ad-id={ad._id}>
            <HTMLContent
              htmlUrl={ad.creativeURL || ""}
              onLoad={() => {
                // HTML content loaded
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
                          ad.creativeURL || "",
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
              videoSrc={ad.creativeURL || ""}
              onVideoEnd={() => {
                handleContentComplete(ad._id);
              }}
              allowProgressControl={true}
              isActive={currentVideoRef.current === ad._id}
            />
          </div>
        );

      default:
        const creativeURL = ad.creativeURL || "";
        if (creativeURL.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return (
            <div className="relative w-full h-full" data-ad-id={ad._id}>
              <Image
                src={creativeURL}
                alt={ad.adsName || ""}
                fill
                className="object-contain rounded-lg"
                onLoadingComplete={() => {
                  // Image loaded
                }}
              />
            </div>
          );
        } else if (
          creativeURL.match(/\.(mp4|webm|ogg|mov)$/i) ||
          creativeURL.includes("youtube.com") ||
          creativeURL.includes("youtu.be")
        ) {
          return (
            <div className="relative w-full h-full" data-ad-id={ad._id}>
              <VideoPlayer
                videoSrc={ad.creativeURL || ""}
                onVideoEnd={() => {
                  handleContentComplete(ad._id);
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

      // For HTML ads, set a timer to mark as completed after 10 seconds
      if ((firstAd.creativeType || "").toLowerCase() === "html") {
        // Setting timer for HTML ad
        timerRef.current = setTimeout(() => {
          // HTML ad viewed for 10 seconds
          handleContentComplete(firstAd._id);
        }, 10000);
      }
      // For Image ads, set a timer to mark as completed after 5 seconds
      else if (
        (firstAd.creativeType || "").toLowerCase() === "image" ||
        (firstAd.creativeURL || "").match(/\.(jpg|jpeg|png|gif|webp)$/i)
      ) {
        // Setting timer for Image ad
        timerRef.current = setTimeout(() => {
          // Image ad viewed for 5 seconds
          handleContentComplete(firstAd._id);
        }, 5000);
      }
      // For video ads, set the current video reference and auto-play
      else if (
        (firstAd.creativeType || "").toLowerCase() === "video" ||
        (firstAd.creativeURL || "").match(/\.(mp4|webm|ogg|mov)$/i) ||
        (firstAd.creativeURL || "").includes("youtube.com") ||
        (firstAd.creativeURL || "").includes("youtu.be")
      ) {
        // Set current video reference to the first ad
        currentVideoRef.current = firstAd._id;

        // Add a slight delay to ensure components are mounted
        setTimeout(() => {
          // Auto-playing first video ad
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
  }, [ads, loading, autoPlayCurrentVideo, handleContentComplete]);

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
                      (ad.creativeType || "").toLowerCase() === "video" ||
                      (ad.creativeURL || "").match(/\.(mp4|webm|ogg|mov)$/i) ||
                      (ad.creativeURL || "").includes("youtube.com") ||
                      (ad.creativeURL || "").includes("youtu.be")
                        ? "none"
                        : "auto",
                  }}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      pointerEvents:
                        (ad.creativeType || "").toLowerCase() === "video" ||
                        (ad.creativeURL || "").match(
                          /\.(mp4|webm|ogg|mov)$/i
                        ) ||
                        (ad.creativeURL || "").includes("youtube.com") ||
                        (ad.creativeURL || "").includes("youtu.be")
                          ? "none"
                          : "auto",
                    }}
                    onClick={(e) => {
                      if (
                        (ad.creativeType || "").toLowerCase() !== "video" &&
                        !(ad.creativeURL || "").match(
                          /\.(mp4|webm|ogg|mov)$/i
                        ) &&
                        !(ad.creativeURL || "").includes("youtube.com") &&
                        !(ad.creativeURL || "").includes("youtu.be")
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
                {showHtmlReward[ad._id] && (
                  <HtmlRewardAnimation
                    amount={5}
                    onComplete={() => handleRewardComplete(ad._id)}
                  />
                )}
                {showImageReward[ad._id] && (
                  <ImageRewardAnimation
                    amount={5}
                    onComplete={() => handleRewardComplete(ad._id)}
                  />
                )}

                {/* Swipe detection overlay - only for videos */}
                {((ad.creativeType || "").toLowerCase() === "video" ||
                  (ad.creativeURL || "").match(/\.(mp4|webm|ogg|mov)$/i) ||
                  (ad.creativeURL || "").includes("youtube.com") ||
                  (ad.creativeURL || "").includes("youtu.be")) && (
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
                <h3 className="text-white font-bold text-xl">
                  {ad.adsName || ""}
                </h3>
              </div>

              <AdActionButtons
                adId={ad._id}
                completed={completedAds[ad._id]}
                onVideoStateChange={(shouldPause) => {
                  if (shouldPause) {
                    pauseAllVideos();
                  } else if (currentVideoRef.current === ad._id) {
                    autoPlayCurrentVideo();
                  }
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </main>
      <Footer />
    </div>
  );
}
