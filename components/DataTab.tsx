"use client";

import { Ad } from "@/@types/data";
import { getAdsList } from "@/app/api/service";
import { useState, useEffect } from "react";

export default function DataTab() {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const adsData = await getAdsList();
        // Fetched ads data

        // Ensure each ad has a description, add type annotation for ad
        const updatedAds = (adsData as Ad[]).map((ad: Ad) => ({
          ...ad,
          description:
            "Watch this ad to earn WLD tokens. Engage with content and boost your earnings!",
        }));

        setAds(updatedAds);
      } catch (error) {
        // Failed to load ads
      }
    };

    fetchAds();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0]; 
    } catch (error) {
      // Date formatting error
      return dateString;
    }
  };

  const getAdThumbnail = (ad: Ad) => {
    const type = ad.creativeType.toLowerCase();
    const url = ad.creativeURL;

    if (type === "video" || url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes("youtube.com") || url.includes("youtu.be")) {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        let videoId = "";
      
        if (url.includes("youtube.com/watch")) {
          const urlObj = new URL(url);
          videoId = urlObj.searchParams.get("v") || "";
        } 
  
        else if (url.includes("youtube.com/shorts/")) {
          const shortsPath = url.split("youtube.com/shorts/")[1];
          videoId = shortsPath.split("?")[0];
        }

        else if (url.includes("youtu.be")) {
          const parts = url.split("/");
          videoId = parts[parts.length - 1].split("?")[0];
        }
        
        if (videoId) {
          return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
      }
      
      return "/images/video-thumbnail.png";
    } 
  
    else if (type === "html") {

      try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      } catch (e) {
      
        return "/images/html-thumbnail.png";
      }
    } 
   
    else {
      return ad.creativeURL || "/images/image-thumbnail.png";
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 pb-24 overflow-y-auto max-h-[calc(100vh-380px)] px-1">
      {ads.map((ad) => (
        <div
          key={ad._id}
          className="bg-gradient-to-r from-[#AC54F1]/10 to-[#EB489A]/10 
                     rounded-lg p-3 backdrop-blur-sm border border-white/10
                     hover:border-white/20 transition-all cursor-pointer
                     flex flex-col"
        >
          <div className="relative aspect-video w-full mb-2 rounded-lg overflow-hidden">
            {ad.creativeType.toLowerCase() === "video" ? (
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                poster={getAdThumbnail(ad)}
              >
                <source src={ad.creativeURL} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={getAdThumbnail(ad)}
                alt={ad.adsName}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold bg-gradient-to-r from-[#AC54F1] to-[#EB489A] bg-clip-text text-transparent truncate">
              {ad.adsName}
            </h3>
            <p className="text-xs text-gray-300 mt-1.5 line-clamp-2">
              {ad.description}
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">
                {formatDate(ad.endDate)}
              </span>
              <span className="text-xs font-semibold bg-gradient-to-r from-[#AC54F1] to-[#EB489A] bg-clip-text text-transparent">
                {ad.budget}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
