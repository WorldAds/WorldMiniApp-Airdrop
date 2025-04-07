"use client";

import React, { useEffect, useState } from "react";
import { Comment } from "@/@types/data";
import { getCommentsByAdvertisementId } from "@/app/api/service";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle,
  DrawerClose
} from "@/components/ui/drawer";
import { X } from "lucide-react";
import CommentItem from "./CommentItem";
import CommentInput from "./CommentInput";
import axios from "axios";

interface CommentDrawerProps {
  adId: string;
  isOpen: boolean;
  onClose: () => void;
  onVideoStateChange: (shouldPause: boolean) => void;
}

interface CommentResponse {
  comments: Comment[];
  total: number;
  page: number;
  limit: number;
}

const CommentDrawer: React.FC<CommentDrawerProps> = ({
  adId,
  isOpen,
  onClose,
  onVideoStateChange
}) => {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyToCommentId, setReplyToCommentId] = useState<string | undefined>(undefined);
  const { user, isAuthenticated } = useAuth();
  
  // Fetch comments when the drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchComments();
      // Pause the video when comments drawer is open
      onVideoStateChange(true);
    } else {
      // Resume the video when comments drawer is closed
      onVideoStateChange(false);
    }
    
    return () => {
      // Make sure video resumes if component unmounts
      onVideoStateChange(false);
    };
  }, [isOpen, adId, onVideoStateChange]);
  
  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await getCommentsByAdvertisementId(adId);
      
      // Check if the response has a comments property (matches the API response structure)
      if (data && typeof data === 'object' && 'comments' in data && Array.isArray(data.comments)) {
        setComments(data.comments);
      } else if (Array.isArray(data)) {
        // Fallback for direct array response
        setComments(data);
      } else {
        // If the API returns an unexpected format, use an empty array
        setComments([]);
      }
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCommentAdded = () => {
    // Refresh comments after adding a new one
    fetchComments();
    // Clear reply state if we were replying
    setReplyToCommentId(undefined);
  };
  
  const handleReplyClick = (commentId: string) => {
    setReplyToCommentId(commentId);
  };
  
  const handleCancelReply = () => {
    setReplyToCommentId(undefined);
  };

  const handleLoginClick = () => {
    // Close the drawer
    onClose();
    // Navigate to wallet-auth page
    router.push('/wallet-auth');
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-[#1E1B2E] text-white max-h-[75vh] rounded-t-xl">
        <DrawerHeader className="border-b border-gray-700">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-white">
              Comments ({comments.length})
            </DrawerTitle>
            <DrawerClose className="text-gray-400 hover:text-white">
              <X size={20} />
            </DrawerClose>
          </div>
        </DrawerHeader>
        
        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: "calc(75vh - 140px)" }}>
          {loading ? (
            <div className="flex justify-center py-4">
              <p className="text-gray-400">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex justify-center py-4">
              <p className="text-gray-400">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment._id}
                id={comment._id}
                content={comment.content}
                username={`User ${comment.userId.slice(-4)}`} // Use last 4 chars of userId for better variety
                createdAt={comment.createdAt}
                likeCount={comment.likeCount}
                dislikeCount={comment.dislikeCount}
                replyCount={comment.replyCount}
                onReplyClick={handleReplyClick}
              />
            ))
          )}
        </div>
        
        {/* Comment input or login prompt */}
        {isAuthenticated ? (
          <CommentInput
            adId={adId}
            replyToCommentId={replyToCommentId}
            onCommentAdded={handleCommentAdded}
            onCancelReply={handleCancelReply}
          />
        ) : (
          <div className="p-4 text-center border-t border-gray-700">
            <p className="text-gray-400 mb-2">You need to be logged in to comment</p>
            <button 
              className="px-4 py-2 bg-gradient-to-r from-[#AC54F1] to-[#EB489A] rounded-full text-white font-semibold"
              onClick={handleLoginClick}
            >
              Log in
            </button>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default CommentDrawer;
