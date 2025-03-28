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
    const url = ad.creativeURL;

    // 处理视频类型广告
    if (type === "video" || url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes("youtube.com") || url.includes("youtu.be")) {
      // 处理 YouTube 视频，提取视频 ID 并生成缩略图 URL
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        let videoId = "";
        
        // 从 youtube.com/watch?v=VIDEO_ID 格式提取
        if (url.includes("youtube.com/watch")) {
          const urlObj = new URL(url);
          videoId = urlObj.searchParams.get("v") || "";
        } 
        // 从 youtube.com/shorts/VIDEO_ID 格式提取
        else if (url.includes("youtube.com/shorts/")) {
          const shortsPath = url.split("youtube.com/shorts/")[1];
          videoId = shortsPath.split("?")[0]; // 移除可能的查询参数
        }
        // 从 youtu.be/VIDEO_ID 格式提取
        else if (url.includes("youtu.be")) {
          const parts = url.split("/");
          videoId = parts[parts.length - 1].split("?")[0];
        }
        
        if (videoId) {
          // 使用高质量的 YouTube 缩略图
          return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
      }
      
      // 如果无法提取 YouTube 缩略图，使用默认视频缩略图
      return "/images/video-thumbnail.png";
    } 
    // 处理 HTML 类型广告
    else if (type === "html") {
      // 对于 HTML 内容，可以考虑使用网站的 favicon 或截图服务
      // 这里使用一个简单的方法：从 URL 中提取域名，并使用 Google 的 favicon 服务
      try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      } catch (e) {
        // 如果 URL 解析失败，使用默认 HTML 缩略图
        return "/images/html-thumbnail.png";
      }
    } 
    // 处理图片类型广告
    else {
      // 对于图片类型，直接使用创意 URL 作为缩略图
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
