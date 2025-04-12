"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Reply } from "@/@types/data";
import { Heart, HeartCrack } from "lucide-react";
import { getRepliesByCommentId, getUserByWorldID } from "@/app/api/service";
import ReplyItem from "@/components/comments/ReplyItem";
import websocketService from "@/app/api/websocket";
import { useCommentReactions } from "@/utils/commentReactions";

interface CommentItemProps {
  id: string;
  content: string;
  username: string;
  worldId: string; // Changed from userId to worldId
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  replyCount: number; // We'll ignore this since backend returns 0
  mediaUrl?: string;
  onReplyClick: (commentId: string) => void;
  replies?: Reply[]; // Add optional replies property
}

interface ReplyResponse {
  replies: Reply[];
  total: number;
  page: number;
  limit: number;
}

const CommentItem: React.FC<CommentItemProps> = ({
  id,
  content,
  username,
  worldId,
  createdAt,
  likeCount,
  dislikeCount,
  replyCount: initialReplyCount,
  mediaUrl,
  onReplyClick,
  replies: initialReplies,
}) => {
  const [replies, setReplies] = useState<Reply[]>(initialReplies || []);
  const [loading, setLoading] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [userNickname, setUserNickname] = useState<string | null>(null);
  const [repliesExpanded, setRepliesExpanded] = useState(false); // Track if replies are expanded
  
  // Use the comment reactions hook
  const { 
    likeCount: currentLikeCount, 
    dislikeCount: currentDislikeCount,
    userReaction,
    isLoading: isReactionLoading,
    handleLike,
    handleDislike
  } = useCommentReactions(id, "Comment", likeCount, dislikeCount);

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

  // Update replies when initialReplies changes
  useEffect(() => {
    if (initialReplies) {
      setReplies(initialReplies);
      console.log(`Loaded ${initialReplies.length} replies for comment ${id}`);
    } else if (replies.length === 0) {
      // Only fetch replies if we don't have any yet
      fetchReplies();
    }
  }, [initialReplies, id]); // Removed fetchReplies and replies from dependencies to avoid unnecessary re-renders

  // Fetch replies for this comment
  const fetchReplies = async () => {
    if (replies.length === 0) {
      setLoading(true);
      try {
        const replyData = await getRepliesByCommentId(id);
        
        // Process reply data
        let fetchedReplies = [];
        if (replyData && typeof replyData === 'object') {
          if ('replies' in replyData && Array.isArray(replyData.replies)) {
            fetchedReplies = replyData.replies;
          } else if (Array.isArray(replyData)) {
            fetchedReplies = replyData;
          }
        }
        
        // Always update replies state, even if empty
        console.log(`Fetched ${fetchedReplies.length} replies for comment ${id}`);
        setReplies(fetchedReplies);
      } catch (error) {
        console.error(`Error fetching replies for comment ${id}:`, error);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="py-3 border-b border-gray-700">
      <div className="flex items-start">
        {/* User avatar - left side */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#AC54F1] to-[#EB489A] p-1 mr-3">
          <div className="w-full h-full rounded-full overflow-hidden bg-[#1E1B2E] flex items-center justify-center">
            {userAvatarUrl ? (
              <Image 
                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${userAvatarUrl}`}
                alt="User Avatar"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-bold">{username.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>
        
        {/* Right side content - 4 layers */}
        <div className="flex-1 flex flex-col">
          {/* Layer 1: Username */}
          <div className="flex items-center">
            <span className="font-semibold text-white">{userNickname || username}</span>
          </div>
          
          {/* Layer 2: Comment content and media */}
          <div className="mt-1">
            {/* For Emoticon type comments, display the emoji larger */}
            {content && content.length <= 2 && (
              <p className="text-white text-4xl">{content}</p>
            )}
            {/* For regular text comments */}
            {content && content.length > 2 && (
              <p className="text-white">{content}</p>
            )}
            
            {/* Add mediaUrl property to CommentItemProps */}
            {mediaUrl && mediaUrl.trim() !== "" && (
              <div className="mt-2">
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL}${mediaUrl}`} 
                  alt="Comment media" 
                  className="max-h-60 rounded-lg object-contain"
                />
              </div>
            )}
          </div>
          
          {/* Layer 3: Reply time, Reply button, Like/Dislike */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">{formatDate(createdAt)}</span>
            
            <button 
              className="text-blue-500 text-xs mx-2"
              onClick={() => onReplyClick(id)}
            >
              Reply
            </button>
            </div>

            
            {/* Like/Dislike buttons - horizontal layout */}
            <div className="flex items-center">
              <button 
                className={`${userReaction === "Like" ? "text-pink-500" : "text-gray-400"} hover:text-pink-500 ${isReactionLoading ? "opacity-50" : ""}`}
                onClick={handleLike}
                disabled={isReactionLoading}
              >
                <Heart size={16} className={userReaction === "Like" ? "fill-current" : ""} />
              </button>
              <span className="text-gray-400 text-xs mx-1">{currentLikeCount}</span>
              
              <button 
                className={`${userReaction === "Dislike" ? "text-gray-400" : "text-gray-400"} hover:text-gray-300 ml-3 ${isReactionLoading ? "opacity-50" : ""}`}
                onClick={handleDislike}
                disabled={isReactionLoading}
              >
                <HeartCrack size={16} className={userReaction === "Dislike" ? "fill-current" : ""} />
              </button>
              <span className="text-gray-400 text-xs mx-1">{currentDislikeCount}</span>
            </div>
          </div>
          
          {/* Layer 4: Collapsible replies section */}
          {(loading || replies.length > 0 || initialReplyCount > 0) && (
            <div className="mt-2">
              {loading ? (
                <p className="text-gray-400 text-sm">Loading replies...</p>
              ) : (
                <div className="mt-2">
                  {/* Toggle button for replies - use actual replyCount from API or replies.length */}
                  {(replies.length > 0 || initialReplyCount > 0) && (
                    <button 
                      onClick={() => {
                        // If replies aren't loaded yet but replyCount > 0, fetch them when expanding
                        if (initialReplyCount > 0 && replies.length === 0 && !loading) {
                          fetchReplies();
                        }
                        setRepliesExpanded(!repliesExpanded);
                      }}
                      className="text-blue-400 text-xs hover:text-blue-300 mb-2 flex items-center"
                    >
                      {repliesExpanded ? 'Hide' : 'Show'} {replies.length > 0 ? replies.length : initialReplyCount} {(replies.length === 1 || initialReplyCount === 1) ? 'reply' : 'replies'}
                      <svg 
                        className={`ml-1 w-3 h-3 transition-transform ${repliesExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                  )}
                  
                  {/* Show replies only when expanded */}
                  {repliesExpanded && replies.length > 0 ? (
                    <div className="pl-2">
                      {replies.map((reply) => (
                        <ReplyItem
                          key={reply._id}
                          _id={reply._id}
                          content={reply.content}
                          username={`User ${reply.worldId.slice(-4)}`} // Use last 4 chars of worldId for better variety
                          worldId={reply.worldId} // Pass the worldId to ReplyItem
                          createdAt={reply.createdAt}
                          likeCount={reply.likeCount}
                          dislikeCount={reply.dislikeCount}
                          mediaUrl={reply.mediaUrl}
                        />
                      ))}
                    </div>
                  ) : replies.length === 0 && !repliesExpanded ? (
                    <p className="text-gray-400 text-xs">No replies yet</p>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
