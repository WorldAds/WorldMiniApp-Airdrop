"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Heart, HeartCrack } from "lucide-react";
import { getUserByWorldID } from "@/app/api/service";
import { useCommentReactions } from "@/utils/commentReactions";

interface ReplyItemProps {
  _id?: string; // Add optional _id property
  content: string;
  username: string;
  worldId?: string; // Changed from userId to worldId, optional since it's derived from username in CommentItem
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  mediaUrl?: string;
}

const ReplyItem: React.FC<ReplyItemProps> = ({
  _id,
  content,
  username,
  worldId,
  createdAt,
  likeCount,
  dislikeCount,
  mediaUrl,
}) => {
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [userNickname, setUserNickname] = useState<string | null>(null);
  
  // Use the comment reactions hook for replies
  const { 
    likeCount: currentLikeCount, 
    dislikeCount: currentDislikeCount,
    userReaction,
    isLoading: isReactionLoading,
    handleLike,
    handleDislike
  } = useCommentReactions(
    // We need to ensure we have a valid ID for the reply
    // If _id is not available, we'll use a combination of worldId and createdAt as a fallback
    // This is not ideal but should work for the UI demonstration
    _id || `${worldId}-${new Date(createdAt).getTime()}`,
    "Reply", 
    likeCount, 
    dislikeCount
  );

  // Get user data based on worldId
  useEffect(() => {
    const fetchUserData = async () => {
      if (worldId) {
        try {
          const userData = await getUserByWorldID(worldId);
          if (userData) {
            if (userData.avatarUrl) {
              setUserAvatarUrl(userData.avatarUrl);
            }
            if (userData.nickname) {
              setUserNickname(userData.nickname);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    
    fetchUserData();
  }, [worldId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="py-2">
      {/* Simplified styling with just indentation, no connecting lines */}
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
            <span className="font-semibold text-white text-sm">{userNickname || username}</span>
          </div>
          
          {/* Layer 2: Reply content and media */}
          <div className="mt-1">
            {/* For Emoticon type replies, display the emoji larger */}
            {content && content.length <= 2 && (
              <p className="text-white text-3xl">{content}</p>
            )}
            {/* For regular text replies */}
            {content && content.length > 2 && (
              <p className="text-white text-sm">{content}</p>
            )}
            
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
              <button 
                className={`${userReaction === "Like" ? "text-pink-500" : "text-gray-400"} hover:text-pink-500 ${isReactionLoading ? "opacity-50" : ""}`}
                onClick={handleLike}
                disabled={isReactionLoading}
              >
                <Heart size={14} className={userReaction === "Like" ? "fill-current" : ""} />
              </button>
              <span className="text-gray-400 text-xs mx-1">{currentLikeCount}</span>
              
              <button 
                className={`${userReaction === "Dislike" ? "text-gray-400" : "text-gray-400"} hover:text-gray-300 ml-3 ${isReactionLoading ? "opacity-50" : ""}`}
                onClick={handleDislike}
                disabled={isReactionLoading}
              >
                <HeartCrack size={14} className={userReaction === "Dislike" ? "fill-current" : ""} />
              </button>
              <span className="text-gray-400 text-xs mx-1">{currentDislikeCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyItem;
