"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, Image, X } from "lucide-react";
import { postComment, postReply, postCommentWithMedia, postReplyWithMedia } from "@/app/api/service";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!content.trim() && !selectedImage) || !user) return;
    
    setIsSubmitting(true);
    setUploadError(null);
    
    try {
      let response;
      
      if (replyToCommentId) {
        // This is a reply to a comment
        if (selectedImage) {
          try {
            // Reply with image
            response = await postReplyWithMedia(
              replyToCommentId,
              content,
              "Image", // Changed from "image" to "Image" to match the expected enum values
              selectedImage
            );
          } catch (error: any) {
            console.error("Error posting reply with media:", error);
            // If image upload fails, try posting as text-only reply
            if (content.trim()) {
              const replyData = {
                commentId: replyToCommentId,
                content,
                commentType: "Text", // Changed from "text" to "Text" to match the expected enum values
                mediaUrl: "",
              };
              
              response = await postReply(replyData);
              setUploadError("Image upload failed, but your reply was posted.");
            } else {
              throw error; // Re-throw if we don't have text content to fall back to
            }
          }
        } else {
          // Text-only reply
          const replyData = {
            commentId: replyToCommentId,
            content,
            commentType: "Text", // Changed from "text" to "Text" to match the expected enum values
            mediaUrl: "",
          };
          
          response = await postReply(replyData);
        }
        
        // Notify via WebSocket (backend will also broadcast this)
        websocketService.send('new_reply', {
          ...response,
          advertisementId: adId,
          commentId: replyToCommentId
        });
      } else {
        // This is a new comment on the ad
        if (selectedImage) {
          try {
            // Comment with image
            response = await postCommentWithMedia(
              adId,
              content,
              "Image", // Changed from "image" to "Image" to match the expected enum values
              selectedImage
            );
          } catch (error: any) {
            console.error("Error posting comment with media:", error);
            // If image upload fails, try posting as text-only comment
            if (content.trim()) {
              const commentData = {
                advertisementId: adId,
                content,
                commentType: "Text", // Changed from "text" to "Text" to match the expected enum values
                mediaUrl: "",
              };
              
              response = await postComment(commentData);
              setUploadError("Image upload failed, but your comment was posted.");
            } else {
              throw error; // Re-throw if we don't have text content to fall back to
            }
          }
        } else {
          // Text-only comment
          const commentData = {
            advertisementId: adId,
            content,
            commentType: "Text", // Changed from "text" to "Text" to match the expected enum values
            mediaUrl: "",
          };
          
          response = await postComment(commentData);
        }
        
        // Notify via WebSocket (backend will also broadcast this)
        websocketService.send('new_comment', response);
      }
      
      // Notify parent component
      onCommentAdded(response);
      
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
