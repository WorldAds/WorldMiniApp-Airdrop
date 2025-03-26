// 'use client';

// import { useState, useEffect } from 'react';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import 'swiper/css';
// import 'swiper/css/navigation';
// import 'swiper/css/pagination';
// import 'swiper/css/scrollbar';

// import WelcomeMessage from './WelcomeMessage';
// import ClaimButton from './buttons/ClaimButton';
// import CommentButton from './buttons/CommentButton';
// import TaskButton from './buttons/TaskButton';
// import Image from 'next/image';
// import Footer from './Footer';
// import Header from './Header';

// const NUM_IMAGES = 20;
// const VIDEO_ADS = [1, 2, 5, 7, 9, 4, 11, 12, 13, 14, 15, 16, 17, 18];

// interface Ad {
//   id: number;
//   isVideo: boolean;
// }

// export default function AdsComponent() {
//   const [ads, setAds] = useState<Ad[]>([]);

//   useEffect(() => {
//     const allAds = Array.from({ length: NUM_IMAGES }, (_, i) => ({
//       id: i + 1,
//       isVideo: VIDEO_ADS.includes(i + 1),
//     }));
//     setAds(allAds);
//   }, []);

//   return (
//     <div className="min-h-screen bg-[#2A203B]">
//       <Header />
//       <main className="flex flex-col items-center justify-start py-20">
//         <Swiper
//           direction="vertical"
//           slidesPerView={1}
//           spaceBetween={0}
//           className="w-full h-screen"
//         >
//           {ads.map((ad) => (
//             <SwiperSlide key={ad.id}>
//               <div className="relative w-full h-screen flex items-center justify-center">
//                 {/* Display Ad */}
//                 {ad.isVideo ? (
//                   <video
//                     src={`/videos/${ad.id}.mp4`}
//                     className="w-auto h-auto max-w-full max-h-full rounded-lg"
//                     controls
//                     autoPlay
//                     muted
//                     loop
//                   />
//                 ) : (
//                   <Image
//                     src={`/images/${ad.id}.webp`}
//                     alt={`Advertisement ${ad.id}`}
//                     fill
//                     className="object-cover"
//                   />
//                 )}

//                 {/* Welcome Message */}
//                 <div
//                   className="absolute"
//                   style={{
//                     top: '67%',
//                     left: '5%',
//                     transform: 'translateY(-50%)',
//                   }}
//                 >
//                   <WelcomeMessage />
//                 </div>

//                 {/* Action Buttons */}
//                 <div
//                   className="absolute flex flex-col space-y-2"
//                   style={{
//                     top: '67%',
//                     right: '5%',
//                     transform: 'translateY(-50%)',
//                   }}
//                 >
//                   <div>
//                     <ClaimButton imageNumber={ad.id} />
//                   </div>
//                   <div>
//                     <CommentButton />
//                   </div>
//                   <div>
//                     <TaskButton onReturn={() => {}} />
//                   </div>
//                 </div>
//               </div>
//             </SwiperSlide>
//           ))}
//         </Swiper>
//       </main>
//       <Footer />
//     </div>
//   );
// }
"use client";

import React, { useState, useEffect, lazy, Suspense, useRef } from "react";
import WelcomeMessage from "./WelcomeMessage";
import ClaimButton from "./buttons/ClaimButton";
import FavouriteButton from "./buttons/FavouriteButton";
import ReturnButton from "./buttons/ReturnButton";
import Footer from "./Footer";
import Header from "./Header";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from 'swiper';
import "swiper/css";
import "swiper/css/mousewheel";
import "swiper/css/keyboard";
import { getAdsList } from "@/app/api/service";
import VideoPlayer from "./VideoPlayer";
import HTMLContent from "./HTMLContent";
import Image from "next/image";

interface Ad {
  adsName: string;
  budget: number;
  startDate: string;
  endDate: string;
  targetAudience: string;
  locations: string[];
  creativeType: string; // Image/Html/Video
  creativeURL: string;
  _id: string; // MongoDB ID from the API
}

export default function AdsComponent() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const adsData = await getAdsList();
        console.log("Fetched ads:", adsData);
        
        setAds(adsData);
      } catch (error) {
        console.error('Failed to load ads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  // Track which ads have been viewed completely
  const [completedAds, setCompletedAds] = useState<Record<string, boolean>>({});

  // Mark an ad as completed when its content is fully viewed
  const handleContentComplete = (adId: string) => {
    setCompletedAds((prev) => ({
      ...prev,
      [adId]: true,
    }));
  };

  // Check if content is HTML
  const isHtmlContent = (content: string): boolean => {
    const trimmed = content.trim();
    return (
      trimmed.startsWith('<!DOCTYPE') || 
      trimmed.startsWith('<html') || 
      (trimmed.includes('<') && trimmed.includes('>') && trimmed.includes('</'))
    );
  };

  // Render the appropriate content based on creativeType
  const renderAdContent = (ad: Ad) => {
    switch (ad.creativeType.toLowerCase()) {
      case 'image':
        return (
          <div className="relative w-full h-full">
            <Image
              src={ad.creativeURL}
              alt={ad.adsName}
              fill
              className="object-contain rounded-lg"
              onLoadingComplete={() => handleContentComplete(ad._id)}
            />
          </div>
        );
      
      case 'html':
        return (
          <div className="relative w-full h-full">
            <HTMLContent 
              htmlUrl={ad.creativeURL} 
              onLoad={() => handleContentComplete(ad._id)}
              fallbackContent={
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <div className="text-center p-4">
                    <h3 className="text-white font-bold text-xl mb-2">{ad.adsName}</h3>
                    <p className="text-gray-300">
                      This content cannot be displayed in the app.
                    </p>
                    <button 
                      onClick={() => window.open(ad.creativeURL, '_blank', 'noopener,noreferrer')}
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
      
      case 'video':
        return (
          <VideoPlayer 
            videoSrc={ad.creativeURL}
            onVideoEnd={() => handleContentComplete(ad._id)}
          />
        );
      
      default:
        // Try to guess the type from the URL
        if (ad.creativeURL.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return (
            <div className="relative w-full h-full">
              <Image
                src={ad.creativeURL}
                alt={ad.adsName}
                fill
                className="object-contain rounded-lg"
                onLoadingComplete={() => handleContentComplete(ad._id)}
              />
            </div>
          );
        } else if (ad.creativeURL.match(/\.(mp4|webm|ogg|mov)$/i) || 
                  ad.creativeURL.includes('youtube.com') || 
                  ad.creativeURL.includes('youtu.be')) {
          return (
            <VideoPlayer 
              videoSrc={ad.creativeURL}
              onVideoEnd={() => handleContentComplete(ad._id)}
            />
          );
        }
        
        return (
          <div className="flex items-center justify-center w-full h-full">
            <p className="text-white text-xl">Unsupported ad type: {ad.creativeType}</p>
          </div>
        );
    }
  };

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
      {/* <Header /> */}
      <main className="flex flex-col items-center justify-center">
        <Swiper
          modules={[Mousewheel, Keyboard]}
          direction="vertical"
          spaceBetween={0}
          slidesPerView={1}
          mousewheel={{
            sensitivity: 1,
            thresholdDelta: 50
          }}
          keyboard={{
            enabled: true,
          }}
          threshold={20} // Lower threshold for swipe detection
          resistance={false} // No resistance at the edges
          touchReleaseOnEdges={true} // Release touch events on edges
          longSwipes={true} // Enable long swipes
          longSwipesRatio={0.1} // Swipe ratio for long swipes (lower = more sensitive)
          followFinger={true} // Follow finger movement
          speed={300} // Transition speed in ms
          simulateTouch={true} // Simulate touch events on desktop
          className="w-full h-[calc(100vh-8rem)]"
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper: SwiperType) => {
            // Update active index
            setActiveIndex(swiper.activeIndex);
            
            // Get the current ad
            const currentAd = ads[swiper.activeIndex];
            if (!currentAd) return;
            
            // Auto-play videos when they become visible
            if (currentAd.creativeType.toLowerCase() === 'video' || 
                currentAd.creativeURL.match(/\.(mp4|webm|ogg|mov)$/i) || 
                currentAd.creativeURL.includes('youtube.com') || 
                currentAd.creativeURL.includes('youtu.be')) {
              // The VideoPlayer component will handle autoplay
              console.log(`Auto-playing video for ad: ${currentAd.adsName}`);
            }
          }}
        >
          {ads.map((ad) => (
            <SwiperSlide
              key={ad._id}
              className="flex items-center justify-center"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Content Container */}
                <div className="relative w-full h-full">
                  <Suspense fallback={<div className="text-white">Loading ad content...</div>}>
                    {renderAdContent(ad)}
                  </Suspense>
                  
                  {/* Swipe Overlay - Transparent layer to capture swipes but allow clicks to pass through */}
                  {/* Only add swipe overlay for videos, not for HTML content as per user request */}
                  {ad.creativeType.toLowerCase() === 'video' && (
                    <div 
                      className="absolute inset-0 z-10"
                      style={{ 
                        pointerEvents: 'none', // Allow clicks to pass through to the video
                      }}
                    >
                      {/* Swipe areas - these capture swipe gestures but allow clicks to pass through */}
                      <div 
                        className="absolute left-0 top-0 w-1/5 h-full" 
                        style={{ pointerEvents: 'auto' }}
                        onClick={(e) => e.stopPropagation()} // Prevent click from reaching video
                      />
                      <div 
                        className="absolute right-0 top-0 w-1/5 h-full" 
                        style={{ pointerEvents: 'auto' }}
                        onClick={(e) => e.stopPropagation()} // Prevent click from reaching video
                      />
                      <div 
                        className="absolute left-0 top-0 w-full h-1/5" 
                        style={{ pointerEvents: 'auto' }}
                        onClick={(e) => e.stopPropagation()} // Prevent click from reaching video
                      />
                      <div 
                        className="absolute left-0 bottom-0 w-full h-1/5" 
                        style={{ pointerEvents: 'auto' }}
                        onClick={(e) => e.stopPropagation()} // Prevent click from reaching video
                      />
                    </div>
                  )}
                </div>

                {/* Ad Info */}
                <div className="absolute bottom-10 left-4 z-20 p-2 rounded-lg">
                  <h3 className="text-white font-bold text-xl">{ad.adsName}</h3>
                </div>
                
                {/* No continue button needed since HTML is treated as static image */}

                {/* Welcome Message */}
                {/* <div className="absolute bottom-[33%] left-4 z-20">
                  <WelcomeMessage />
                </div> */}

                {/* Action Buttons */}
                <div className="absolute bottom-[33%] right-4 flex flex-col space-y-2 z-20">
                  <ClaimButton
                    disabled={!completedAds[ad._id]}
                    imageNumber={parseInt(ad._id.substring(0, 2), 16) || 1}
                  />
                  <FavouriteButton />
                  <ReturnButton onReturn={() => {}} />
                </div>

                {/* No swipe indicators as per user request */}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </main>
      <Footer />
    </div>
  );
}
