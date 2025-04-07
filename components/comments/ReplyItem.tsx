"use client";

import React from "react";
import { Heart, HeartCrack } from "lucide-react";

interface ReplyItemProps {
  content: string;
  username: string;
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
}

const ReplyItem: React.FC<ReplyItemProps> = ({
  content,
  username,
  createdAt,
  likeCount,
  dislikeCount,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="py-2 border-b border-gray-700">
      <div className="flex items-start">
        {/* User avatar - left side */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#AC54F1] to-[#EB489A] flex items-center justify-center mr-3">
          <span className="text-white font-bold text-sm">{username.charAt(0).toUpperCase()}</span>
        </div>
        
        {/* Right side content - 3 layers (no reply button for replies) */}
        <div className="flex-1 flex flex-col">
          {/* Layer 1: Username */}
          <div className="flex items-center">
            <span className="font-semibold text-white text-sm">{username}</span>
          </div>
          
          {/* Layer 2: Reply content */}
          <p className="text-white text-sm mt-1">{content}</p>
          
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
