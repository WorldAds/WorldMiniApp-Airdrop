"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Heart, HeartCrack } from "lucide-react";

interface ReplyItemProps {
  content: string;
  username: string;
  userId?: string; // Added userId field, optional since it's derived from username in CommentItem
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  mediaUrl?: string;
}

const ReplyItem: React.FC<ReplyItemProps> = ({
  content,
  username,
  userId,
  createdAt,
  likeCount,
  dislikeCount,
  mediaUrl,
}) => {
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

  // Construct avatar URL based on userId
  useEffect(() => {
    if (userId) {
      // Assuming the avatar URL follows a pattern like /uploads/avatars/{userId}.png
      const avatarUrl = `/uploads/avatars/${userId}.png`;
      setUserAvatarUrl(avatarUrl);
    }
  }, [userId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="py-2 border-b border-gray-700">
      <div className="flex items-start">
        {/* User avatar - left side */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#AC54F1] to-[#EB489A] p-1 mr-3">
          <div className="w-full h-full rounded-full overflow-hidden bg-[#1E1B2E] flex items-center justify-center">
            {userAvatarUrl ? (
              <Image 
                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${userAvatarUrl}`}
                alt="User Avatar"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-sm">{username.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>
        
        {/* Right side content - 3 layers (no reply button for replies) */}
        <div className="flex-1 flex flex-col">
          {/* Layer 1: Username */}
          <div className="flex items-center">
            <span className="font-semibold text-white text-sm">{username}</span>
          </div>
          
          {/* Layer 2: Reply content and media */}
          <div className="mt-1">
            <p className="text-white text-sm">{content}</p>
            
            {/* Display media if available */}
            {mediaUrl && mediaUrl.trim() !== "" && (
              <div className="mt-2">
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${mediaUrl}`} 
                  alt="Reply media" 
                  className="max-h-48 rounded-lg object-contain"
                />
              </div>
            )}
          </div>
          
          {/* Layer 3: Reply time and Like/Dislike */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-400 text-xs">{formatDate(createdAt)}</span>
            
            {/* Like/Dislike buttons - horizontal layout */}
            <div className="flex items-center">
              <button className="text-gray-400 hover:text-pink-500">
                <Heart size={14} className="fill-current" />
              </button>
              <span className="text-gray-400 text-xs mx-1">{likeCount}</span>
              
              <button className="text-gray-400 hover:text-red-500 ml-3">
                <HeartCrack size={14} />
              </button>
              <span className="text-gray-400 text-xs mx-1">{dislikeCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyItem;
