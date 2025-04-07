"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { postComment, postReply } from "@/app/api/service";
import { useAuth } from "@/contexts/AuthContext";
import { Comment } from "@/@types/data";
import websocketService from "@/app/api/websocket";

interface CommentInputProps {
  adId: string;
  replyToCommentId?: string;
  onCommentAdded: (newComment: Comment) => void;
  onCancelReply?: () => void;
}

const CommentInput: React.FC<CommentInputProps> = ({
  adId,
  replyToCommentId,
  onCommentAdded,
  onCancelReply,
}) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || !user) return;
    
    setIsSubmitting(true);
    
    try {
      if (replyToCommentId) {
        // This is a reply to a comment
        const replyData = {
          commentId: replyToCommentId,
          content,
          commentType: "text",
          mediaUrl: "",
        };
        
        const response = await postReply(replyData);
        
        // Notify via WebSocket (backend will also broadcast this)
        websocketService.send('new_reply', {
          ...response,
          advertisementId: adId,
          commentId: replyToCommentId
        });
        
        // Notify parent component
        onCommentAdded(response);
      } else {
        // This is a new comment on the ad
        const commentData = {
          advertisementId: adId,
          content,
          commentType: "text",
          mediaUrl: "",
        };
        
        const response = await postComment(commentData);
        
        // Notify via WebSocket (backend will also broadcast this)
        websocketService.send('new_comment', response);
        
        // Notify parent component
        onCommentAdded(response);
      }
      
      // Clear the input
      setContent("");
    } catch (error: any) {
      console.error("Error posting comment/reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center p-3 border-t border-gray-700">
      {replyToCommentId && (
        <button
          type="button"
          className="text-gray-400 text-xs mr-2"
          onClick={onCancelReply}
        >
          Cancel
        </button>
      )}
      
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={replyToCommentId ? "Add a reply..." : "Add a comment..."}
        className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
      />
      
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        className="ml-2 text-purple-500"
        disabled={!content.trim() || isSubmitting}
      >
        <Send size={20} />
      </Button>
    </form>
  );
};

export default CommentInput;
