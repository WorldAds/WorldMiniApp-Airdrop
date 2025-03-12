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

import React, { useState, useEffect, lazy, Suspense } from "react";
import WelcomeMessage from "./WelcomeMessage";
import ClaimButton from "./buttons/ClaimButton";
import FavouriteButton from "./buttons/FavouriteButton";
import ReturnButton from "./buttons/ReturnButton";
import Footer from "./Footer";
import Header from "./Header";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const NUM_IMAGES = 20;
const VIDEO_ADS = [1, 2, 5, 7, 9, 4, 11, 12, 13, 14, 15, 16, 17, 18];

// Lazy-loaded components for ads
const LazyImage = lazy(() => import("./LazyImage")); // For images
const LazyVideo = lazy(() => import("./LazyVideo")); // For videos

interface Ad {
  id: number;
  isVideo: boolean;
}

export default function AdsComponent() {
  const [ads, setAds] = useState<Ad[]>([]);

  // A record of which videos are watched completely:
  // e.g. { 1: true, 3: false, 4: true, ... }
  const [completedVideos, setCompletedVideos] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    const allAds = Array.from({ length: NUM_IMAGES }, (_, i) => ({
      id: i + 1,
      isVideo: VIDEO_ADS.includes(i + 1),
    }));
    setAds(allAds);
  }, []);

  // Helper to mark a specific ad's video as completed
  const handleVideoEnd = (adId: number) => {
    setCompletedVideos((prev) => ({
      ...prev,
      [adId]: true,
    }));
  };

  return (
    <div className="max-h-screen min-h-screen bg-[#2A203B] overflow-y-hidden">
      <Header />
      <main className="flex flex-col items-center justify-center py-10">
        <Swiper
          direction="vertical"
          spaceBetween={0}
          slidesPerView={1}
          className="w-full h-screen"
        >
          {ads.map((ad) => (
            <SwiperSlide
              key={ad.id}
              className="flex items-center justify-center"
            >
              <div className="relative w-full max-w-5xl h-screen flex items-center justify-center">
                <Suspense fallback={<div>Loading ad...</div>}>
                  {ad.isVideo ? (
                    <LazyVideo
                      onVideoEnd={() => handleVideoEnd(ad.id)}
                      videoId={ad.id}
                    />
                  ) : (
                    <LazyImage imageId={ad.id} />
                  )}
                </Suspense>

                {/* Welcome Message */}
                <div className="w-full items-center absolute bottom-[68%] ">
                  <WelcomeMessage />
                </div>

                {/* Action Buttons */}
                <div className="absolute bottom-[38%] right-3 flex flex-col space-y-2">
                  <ClaimButton
                    disabled={ad.isVideo && !completedVideos[ad.id]}
                    imageNumber={ad.id}
                  />
                  <FavouriteButton />
                  <ReturnButton onReturn={() => {}} />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </main>
      <Footer />
    </div>
  );
}
