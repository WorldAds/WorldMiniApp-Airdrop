import { useAuth } from "@/contexts/AuthContext";
import { postReaction, deleteReaction, getUserReaction } from "@/app/api/service";
import { useState } from "react";

// Custom hook for handling comment and reply reactions
export const useCommentReactions = (
  id: string,
  targetType: "Comment" | "Reply",
  initialLikeCount: number,
  initialDislikeCount: number,
  initialUserReaction?: "Like" | "Dislike" | null
) => {
  const { user, isAuthenticated } = useAuth();
  const [likeCount, setLikeCount] = useState<number>(initialLikeCount);
  const [dislikeCount, setDislikeCount] = useState<number>(initialDislikeCount);
  const [userReaction, setUserReaction] = useState<"Like" | "Dislike" | null>(initialUserReaction || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Handle reaction (like or dislike)
  const handleReaction = async (reactionType: "Like" | "Dislike") => {
    if (!isAuthenticated || !user?.worldId) {
      // User needs to be logged in to react
      alert("Please log in to like or dislike");
      return;
    }

    if (isLoading) return; // Prevent multiple clicks while processing

    setIsLoading(true);

    // Store previous state to revert in case of error
    const previousUserReaction = userReaction;
    const previousLikeCount = likeCount;
    const previousDislikeCount = dislikeCount;

    try {
      // Calculate new state based on current state and action
      let newUserReaction: "Like" | "Dislike" | null = null;
      let newLikeCount = likeCount;
      let newDislikeCount = dislikeCount;

      // If user already reacted with the same reaction, remove it
      if (userReaction === reactionType) {
        // Remove the reaction
        newUserReaction = null;
        if (reactionType === "Like") {
          newLikeCount = Math.max(0, likeCount - 1);
        } else {
          newDislikeCount = Math.max(0, dislikeCount - 1);
        }
      } 
      // If user already reacted with the opposite reaction, switch it
      else if (userReaction !== null) {
        // Switch from one reaction to another
        newUserReaction = reactionType;
        if (reactionType === "Like") {
          newLikeCount = likeCount + 1;
          newDislikeCount = Math.max(0, dislikeCount - 1);
        } else {
          newDislikeCount = dislikeCount + 1;
          newLikeCount = Math.max(0, likeCount - 1);
        }
      } 
      // If user hasn't reacted yet, add the reaction
      else {
        // Add new reaction
        newUserReaction = reactionType;
        if (reactionType === "Like") {
          newLikeCount = likeCount + 1;
        } else {
          newDislikeCount = dislikeCount + 1;
        }
      }

      // Update UI state first (optimistic update)
      setUserReaction(newUserReaction);
      setLikeCount(newLikeCount);
      setDislikeCount(newDislikeCount);

      // Call the API to update the reaction
      if (userReaction !== null) {
        // Get the reaction ID first
        const reactionData = await getUserReaction(id, targetType, user.worldId);
        
        if (reactionData && reactionData._id) {
          // If we have a reaction ID, delete it
          await deleteReaction(reactionData._id);
        }
      }
      
      if (newUserReaction !== null) {
        // If adding or changing a reaction, call the post endpoint
        await postReaction({
          targetId: id,
          targetType: targetType,
          worldId: user.worldId,
          reactionType: newUserReaction
        });
      }
    } catch (error) {
      console.error("Error handling reaction:", error);
      // Revert UI changes on error
      setUserReaction(previousUserReaction);
      setLikeCount(previousLikeCount);
      setDislikeCount(previousDislikeCount);
      console.error("Failed to update reaction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    likeCount,
    dislikeCount,
    userReaction,
    isLoading,
    handleLike: () => handleReaction("Like"),
    handleDislike: () => handleReaction("Dislike")
  };
};
