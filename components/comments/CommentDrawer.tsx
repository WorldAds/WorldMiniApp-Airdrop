"use client";

import React, { useEffect, useState } from "react";
import { Comment } from "@/@types/data";
import { getCommentsByAdvertisementId, getRepliesByCommentId } from "@/app/api/service";
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
import websocketService from "@/app/api/websocket";

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
      
      // Connect to WebSocket and join the room for this ad
      websocketService.connect().then(() => {
        websocketService.joinRoom(`ad:${adId}`);
      }).catch(error => {
        console.error("Failed to connect to WebSocket:", error);
      });
      
      // Subscribe to new comments
      const unsubscribeNewComment = websocketService.subscribe('new_comment', (data) => {
        if (data.advertisementId === adId) {
          // Add the new comment to the list
          setComments(prevComments => [data, ...prevComments]);
        }
      });
      
      // Subscribe to new replies - refetch replies when a new one is added
      const unsubscribeNewReply = websocketService.subscribe('new_reply', (data) => {
        if (data.advertisementId === adId) {
          console.log(`New reply for comment ${data.commentId} in ad ${adId}`);
          
          // Refetch replies for this comment instead of directly adding the reply
          fetchRepliesForComment(data.commentId);
        }
      });
      
      return () => {
        // Resume the video when comments drawer is closed with a slight delay
        // to ensure the drawer is fully closed before resuming the video
        setTimeout(() => {
          onVideoStateChange(false);
        }, 300);
        
        // Leave the room and unsubscribe from events
        websocketService.leaveRoom(`ad:${adId}`);
        unsubscribeNewComment();
        unsubscribeNewReply();
      };
    }
  }, [isOpen, adId, onVideoStateChange]);
  
  // Function to fetch replies for a specific comment
  const fetchRepliesForComment = async (commentId: string) => {
    try {
      console.log(`Fetching replies for comment ${commentId}`);
      const replyData = await getRepliesByCommentId(commentId);
      
      // Process reply data
      let replies = [];
      if (replyData && typeof replyData === 'object') {
        if ('replies' in replyData && Array.isArray(replyData.replies)) {
          replies = replyData.replies;
          console.log(`Got ${replies.length} replies from API response.replies`);
        } else if (Array.isArray(replyData)) {
          replies = replyData;
          console.log(`Got ${replies.length} replies from API response array`);
        }
      }
      
      console.log('Replies data:', replies);
      
      // Update the comment with the fetched replies
      setComments(prevComments => {
        const updatedComments = prevComments.map(comment => {
          if (comment._id === commentId) {
            console.log(`Updating comment ${commentId} with ${replies.length} replies`);
            return { 
              ...comment, 
              replies: replies,
              replyCount: replies.length
            };
          }
          return comment;
        });
        
        return updatedComments;
      });
    } catch (error) {
      console.error(`Error fetching replies for comment ${commentId}:`, error);
    }
  };
  
  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await getCommentsByAdvertisementId(adId);
      
      let commentsData: Comment[] = [];
      
      // Check if the response has a comments property (matches the API response structure)
      if (data && typeof data === 'object' && 'comments' in data && Array.isArray(data.comments)) {
        commentsData = data.comments;
      } else if (Array.isArray(data)) {
        // Fallback for direct array response
        commentsData = data;
      }
      
      // Set comments first
      setComments(commentsData);
      
      // Then fetch replies for each comment
      if (commentsData.length > 0) {
        // Fetch replies for all comments, not just those with replyCount > 0
        // since the backend might not be setting replyCount correctly
        const commentsWithReplies = commentsData;

        // Create an array of promises for fetching replies
        const replyPromises = commentsWithReplies.map(comment => 
          getRepliesByCommentId(comment._id)
            .then(replyData => {
              // Process reply data - the API returns an object with a 'replies' array
              let replies = [];
              if (replyData && typeof replyData === 'object') {
                if ('replies' in replyData && Array.isArray(replyData.replies)) {
                  // Standard response format: { replies: [...], total: number, page: number, limit: number }
                  replies = replyData.replies;
                } else if (Array.isArray(replyData)) {
                  // Fallback if the API returns an array directly
                  replies = replyData;
                }
              }
              
              // Return the comment ID and its replies
              return { commentId: comment._id, replies };
            })
            .catch(error => {
              console.error(`Error fetching replies for comment ${comment._id}:`, error);
              return { commentId: comment._id, replies: [] };
            })
        );
        
        // Wait for all reply fetches to complete
        const repliesResults = await Promise.all(replyPromises);
        
        // Log the results to help debug
        repliesResults.forEach(result => {
          console.log(`Comment ${result.commentId} has ${result.replies.length} replies`);
        });
        
        // Update the comments with their replies
        setComments(prevComments => {
          const updatedComments = prevComments.map(comment => {
            // Find the replies for this comment
            const replyResult = repliesResults.find(result => result.commentId === comment._id);
            
            // If we found replies for this comment, add a replies property
            if (replyResult && replyResult.replies.length > 0) {
              console.log(`Adding ${replyResult.replies.length} replies to comment ${comment._id}`);
              return { ...comment, replies: replyResult.replies };
            }
            
            // Otherwise, return the comment with an empty replies array
            return { ...comment, replies: [] };
          });
          
          console.log(`Updated ${updatedComments.length} comments with replies`);
          return updatedComments;
        });
      }
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCommentAdded = (newComment: Comment) => {
    // Add the new comment to the list (WebSocket will also handle this)
    setComments(prevComments => [newComment, ...prevComments]);
    
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
                      username={`User ${comment.worldId.slice(-4)}`} // We'll fetch the actual nickname in CommentItem
                      worldId={comment.worldId} // Pass the worldId to CommentItem
                      createdAt={comment.createdAt}
                      likeCount={comment.likeCount}
                      dislikeCount={comment.dislikeCount}
                      replyCount={comment.replyCount}
                      mediaUrl={comment.mediaUrl}
                      onReplyClick={handleReplyClick}
                      replies={(comment as any).replies} // Pass the replies if they exist
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
            onReplyAdded={(commentId, reply) => {
              console.log('Reply added, fetching replies for comment:', commentId);
              fetchRepliesForComment(commentId);
            }}
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
