"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, Image, X, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { postComment, postReply, postCommentWithMedia, postReplyWithMedia } from "@/app/api/service";
import { useAuth } from "@/contexts/AuthContext";
import { Comment } from "@/@types/data";
import websocketService from "@/app/api/websocket";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CommentInputProps {
  adId: string;
  replyToCommentId?: string;
  onCommentAdded: (newComment: Comment) => void;
  onCancelReply?: () => void;
  onReplyAdded?: (commentId: string, reply: any) => void; // Add new callback for replies
}

const CommentInput: React.FC<CommentInputProps> = ({
  adId,
  replyToCommentId,
  onCommentAdded,
  onCancelReply,
  onReplyAdded,
}) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    // Add emoji to the current content
    setContent(prev => prev + emojiData.emoji);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!content.trim() && !selectedImage) || !user) return;
    
    setIsSubmitting(true);
    setUploadError(null);
    
    try {
      let response;
      let commentType = "Text";
      
      // Check if content is a single emoji (or two emoji characters)
      // Simple emoji detection - check if content is short and contains non-alphanumeric characters
      const isEmoticon = content.trim().length <= 2 && !/^[a-zA-Z0-9\s]+$/.test(content);
      if (isEmoticon) {
        commentType = "Emoticon";
      }
      
      if (replyToCommentId) {
        // This is a reply to a comment
        if (selectedImage) {
          try {
            // Reply with image
            response = await postReplyWithMedia(
              replyToCommentId,
              content,
              "Image",
              selectedImage,
              user.worldId,
              adId // Pass the advertisementId
            );
          } catch (error: any) {
            console.error("Error posting reply with media:", error);
            // If image upload fails, try posting as text-only reply
            if (content.trim()) {
              const replyData = {
                commentId: replyToCommentId,
                content,
                commentType,
                mediaUrl: "",
                worldId: user.worldId,
                advertisementId: adId, // Add advertisementId here too
              };
              
              response = await postReply(replyData);
              setUploadError("Image upload failed, but your reply was posted.");
            } else {
              throw error; // Re-throw if we don't have text content to fall back to
            }
          }
        } else {
          // Text-only reply (including emoji)
          const replyData = {
            commentId: replyToCommentId,
            content,
            commentType,
            mediaUrl: "",
            worldId: user.worldId,
            advertisementId: adId, // Add advertisementId to ensure it's included in the reply
          };
          
          response = await postReply(replyData);
        }
        
        // Ensure the response has all the necessary fields for WebSocket
        const replyData = {
          ...response,
          advertisementId: adId,
          commentId: replyToCommentId
        };
        
        // Send only once via WebSocket - the backend will broadcast to all clients
        // and the parent component will handle the UI update
        console.log('Sending new reply via WebSocket:', replyData);
        websocketService.send('new_reply', replyData);
      } else {
        // This is a new comment on the ad
        if (selectedImage) {
          try {
            // Comment with image
            response = await postCommentWithMedia(
              adId,
              content,
              "Image",
              selectedImage,
              user.worldId
            );
          } catch (error: any) {
            console.error("Error posting comment with media:", error);
            // If image upload fails, try posting as text-only comment
            if (content.trim()) {
              const commentData = {
                advertisementId: adId,
                content,
                commentType,
                mediaUrl: "",
                worldId: user.worldId,
              };
              
              response = await postComment(commentData);
              setUploadError("Image upload failed, but your comment was posted.");
            } else {
              throw error; // Re-throw if we don't have text content to fall back to
            }
          }
        } else {
          // Text-only comment (including emoji)
          const commentData = {
            advertisementId: adId,
            content,
            commentType,
            mediaUrl: "",
            worldId: user.worldId,
          };
          
          response = await postComment(commentData);
        }
        
        // Notify via WebSocket (backend will also broadcast this)
        websocketService.send('new_comment', response);
      }
      
      // Notify parent component
      // For comments, directly add to the list
      // For replies, call onReplyAdded to trigger immediate update
      if (!replyToCommentId) {
        onCommentAdded(response);
      } else {
        // For replies, call onReplyAdded if available
        if (onReplyAdded) {
          console.log('Calling onReplyAdded with commentId:', replyToCommentId);
          onReplyAdded(replyToCommentId, response);
        }
        
        // Clear the reply state
        if (onCancelReply) {
          onCancelReply();
        }
      }
      
      // Clear the input
      setContent("");
      setSelectedImage(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error("Error posting comment/reply:", error);
      setUploadError("Failed to post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-t border-gray-700">
      {/* Image preview area (only shown when an image is selected) */}
      {previewUrl && (
        <div className="p-3 relative">
          <div className="relative inline-block">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-h-32 rounded-lg object-contain"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1 text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {uploadError && (
        <div className="px-3 pb-2">
          <p className="text-red-400 text-xs">{uploadError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-center p-3">
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
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
          id="image-upload"
        />
        
        {/* Emoji picker button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="ml-2 text-gray-400 hover:text-yellow-500"
              disabled={isSubmitting}
            >
              <Smile size={20} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 border-none" align="end">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width="100%"
              height="350px"
            />
          </PopoverContent>
        </Popover>
        
        {/* Image upload button */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="ml-2 text-gray-400 hover:text-purple-500"
          onClick={() => fileInputRef.current?.click()}
          disabled={isSubmitting}
        >
          <Image size={20} />
        </Button>
        
        {/* Send button */}
        <Button
          type="submit"
          size="icon"
          variant="ghost"
          className="ml-2 text-purple-500"
          disabled={((!content.trim() && !selectedImage) || isSubmitting)}
        >
          <Send size={20} />
        </Button>
      </form>
    </div>
  );
};

export default CommentInput;
