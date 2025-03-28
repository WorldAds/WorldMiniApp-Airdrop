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
        console.log("Fetched ads:", adsData);

        // Ensure each ad has a description, add type annotation for ad
        const updatedAds = (adsData as Ad[]).map((ad: Ad) => ({
          ...ad,
          description:
            "Watch this ad to earn WLD tokens. Engage with content and boost your earnings!",
        }));

        setAds(updatedAds);
      } catch (error) {
        console.error("Failed to load ads:", error);
      }
    };

    fetchAds();
  }, []);

  // 格式化日期函数：将ISO日期字符串转换为 YYYY-MM-DD 格式
  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0]; // 提取 YYYY-MM-DD 部分
    } catch (error) {
      console.error("Date formatting error:", error);
      return dateString;
    }
  };

  // 获取广告缩略图的函数
  const getAdThumbnail = (ad: Ad) => {
    const type = ad.creativeType.toLowerCase();

    if (type === "video") {
      return ad.thumbnailURL || "/images/video-thumbnail.png";
    } else if (type === "html") {
      return ad.thumbnailURL || "/images/html-thumbnail.png";
    } else {
      // 图片类型
      return ad.thumbnailURL || ad.creativeURL || "/images/image-thumbnail.png";
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
