"use client";

import { useState, useEffect } from 'react';

interface Ad {
  id: number;
  title: string;
  description: string;
  reward: string;
  duration: string;
  mediaType: 'video' | 'image';
  mediaUrl: string;
}

export default function DataTab() {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    // Helper function to randomly choose media type
    const getRandomMediaType = () => Math.random() < 0.5 ? 'video' : 'image';
    
    // Generate ads only on client side
    const generatedAds: Ad[] = Array(12).fill(null).map((_, i) => {
      const mediaType = getRandomMediaType();
      return {
        id: i + 1,
        title: `Advertisement ${i + 1}`,
        description: 'Watch this ad to earn WLD tokens. Engage with content and boost your earnings!',
        reward: `${(Math.random() * (0.5 - 0.1) + 0.1).toFixed(2)} WLD`,
        duration: `${Math.floor(Math.random() * (120 - 30) + 30)} seconds`,
        mediaType,
        mediaUrl: mediaType === 'video' 
          ? `/videos/${Math.floor(Math.random() * 20) + 1}.mp4`
          : `/images/${Math.floor(Math.random() * 20) + 1}.webp`
      };
    });

    setAds(generatedAds);
  }, []); // Run once on mount

  return (
    <div className="grid grid-cols-2 gap-3 pb-24 overflow-y-auto max-h-[calc(89vh-380px)] px-1 hide-scrollbar">
      {ads.map((ad) => (
        <div
          key={ad.id}
          className="bg-gradient-to-r from-[#AC54F1]/10 to-[#EB489A]/10 
                     rounded-lg p-3 backdrop-blur-sm border border-white/10
                     hover:border-white/20 transition-all cursor-pointer
                     flex flex-col"
        >
          <div className="relative aspect-video w-full mb-2 rounded-lg overflow-hidden">
            {ad.mediaType === 'video' ? (
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster={`/images/${Math.floor(Math.random() * 20) + 1}.webp`}
              >
                <source src={ad.mediaUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={ad.mediaUrl}
                alt={ad.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold bg-gradient-to-r from-[#AC54F1] to-[#EB489A] bg-clip-text text-transparent truncate">
              {ad.title}
            </h3>
            <p className="text-xs text-gray-300 mt-1.5 line-clamp-2">
              {ad.description}
            </p>
          </div>
          
          <div className="mt-3 pt-2 border-t border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">{ad.duration}</span>
              <span className="text-xs font-semibold bg-gradient-to-r from-[#AC54F1] to-[#EB489A] bg-clip-text text-transparent">
                {ad.reward}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}