"use client";

import React, { useState } from "react";
import { Reply } from "@/@types/data";
import { ChevronDown, ChevronUp, Heart, HeartCrack } from "lucide-react";
import { getRepliesByCommentId } from "@/app/api/service";
import ReplyItem from "@/components/comments/ReplyItem";
import axios from "axios";

interface CommentItemProps {
  id: string;
  content: string;
  username: string;
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  replyCount: number;
  onReplyClick: (commentId: string) => void;
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
  createdAt,
  likeCount,
  dislikeCount,
  replyCount,
  onReplyClick,
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleReplies = async () => {
    if (!showReplies && replyCount > 0 && replies.length === 0) {
      setLoading(true);
      try {
        const data = await getRepliesByCommentId(id);
        
        // Check if the response has a replies property (matches the API response structure)
        if (data && typeof data === 'object' && 'replies' in data && Array.isArray(data.replies)) {
          setReplies(data.replies);
        } else if (Array.isArray(data)) {
          // Fallback for direct array response
          setReplies(data);
        } else {
          // If the API returns an unexpected format, use an empty array
          setReplies([]);
        }
      } catch (error: any) {
        console.error("Error fetching replies:", error);
        setReplies([]);
      } finally {
        setLoading(false);
      }
    }
    setShowReplies(!showReplies);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="py-3 border-b border-gray-700">
      <div className="flex items-start">
        {/* User avatar - left side */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#AC54F1] to-[#EB489A] flex items-center justify-center mr-3">
          <span className="text-white font-bold">{username.charAt(0).toUpperCase()}</span>
        </div>
        
        {/* Right side content - 4 layers */}
        <div className="flex-1 flex flex-col">
          {/* Layer 1: Username */}
          <div className="flex items-center">
            <span className="font-semibold text-white">{username}</span>
          </div>
          
          {/* Layer 2: Comment content */}
          <p className="text-white mt-1">{content}</p>
          
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
              <button className="text-gray-400 hover:text-pink-500">
                <Heart size={16} className="fill-current" />
              </button>
              <span className="text-gray-400 text-xs mx-1">{likeCount}</span>
              
              <button className="text-gray-400 hover:text-red-500 ml-3">
                <HeartCrack size={16} />
              </button>
              <span className="text-gray-400 text-xs mx-1">{dislikeCount}</span>
            </div>
          </div>
          
          {/* Layer 4: Expand replies (only if there are replies) */}
          {replyCount > 0 && (
            <div className="mt-2">
              <button 
                className="flex items-center text-gray-400 text-sm"
                onClick={toggleReplies}
                disabled={loading}
              >
                {loading ? (
                  "Loading..."
                ) : (
                  <>
                    {showReplies ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    <span className="ml-1">
                      {showReplies ? "Hide replies" : `View ${replyCount} replies`}
                    </span>
                  </>
                )}
              </button>
              
              {showReplies && (
                <div className="mt-2">
                  {replies.map((reply) => (
                    <ReplyItem
                      key={reply._id}
                      content={reply.content}
                      username={`User ${reply.userId.slice(-4)}`} // Use last 4 chars of userId for better variety
                      createdAt={reply.createdAt}
                      likeCount={reply.likeCount}
                      dislikeCount={reply.dislikeCount}
                    />
                  ))}
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
