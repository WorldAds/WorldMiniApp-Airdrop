import { useAuth } from "@/contexts/AuthContext";
import { postReaction } from "@/app/api/service";
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

    try {
      // If user already reacted with the same reaction, remove it
      if (userReaction === reactionType) {
        // Remove the reaction (API doesn't support this yet, so we just update UI)
        if (reactionType === "Like") {
          setLikeCount(prev => Math.max(0, prev - 1));
        } else {
          setDislikeCount(prev => Math.max(0, prev - 1));
        }
        setUserReaction(null);
      } 
      // If user already reacted with the opposite reaction, switch it
      else if (userReaction !== null) {
        // Switch from one reaction to another
        if (reactionType === "Like") {
          setLikeCount(prev => prev + 1);
          setDislikeCount(prev => Math.max(0, prev - 1));
        } else {
          setDislikeCount(prev => prev + 1);
          setLikeCount(prev => Math.max(0, prev - 1));
        }
        setUserReaction(reactionType);
      } 
      // If user hasn't reacted yet, add the reaction
      else {
        // Add new reaction
        if (reactionType === "Like") {
          setLikeCount(prev => prev + 1);
        } else {
          setDislikeCount(prev => prev + 1);
        }
        setUserReaction(reactionType);
      }

      // Call the API to update the reaction
      await postReaction({
        targetId: id,
        targetType: targetType,
        worldId: user.worldId,
        reactionType: reactionType
      });
    } catch (error) {
      console.error("Error handling reaction:", error);
      // Revert UI changes on error
      setLikeCount(initialLikeCount);
      setDislikeCount(initialDislikeCount);
      setUserReaction(initialUserReaction || null);
      alert("Failed to update reaction. Please try again.");
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
