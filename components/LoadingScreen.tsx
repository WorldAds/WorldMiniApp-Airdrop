"use client";

import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md px-4">
      <div className="relative w-[79px] h-[79px] mb-6 group">
        <div className="absolute w-full h-full bg-gradient-to-r from-[#AC54F1] to-[#EB489A] rounded-lg 
                      animate-pulse shadow-lg shadow-[#AC54F1]/20">
          <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-[40px] font-inter">
            W
          </span>
        </div>
      </div>
      
      <h1 className="text-[36px] font-semibold font-inter leading-[44px] tracking-[0.03em] text-center mb-8 
                     bg-gradient-to-r from-[#AC54F1] to-[#EB489A] bg-clip-text text-transparent">
        Welcome to WorldAds
      </h1>
      
      <div className="w-full max-w-[226px]">
        <div className="relative h-2.5 bg-gray-700/30 rounded-full overflow-hidden backdrop-blur-sm
                      before:absolute before:inset-0 before:bg-gray-700/20 before:rounded-full">
          <div 
            className="absolute top-0 left-0 h-full loading-shimmer rounded-full rainbow-glow"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-1 mt-3">
          <span className="text-white/90 text-sm font-medium loading-dots">
            Loading
          </span>
        </div>
      </div>
    </div>
  );
}