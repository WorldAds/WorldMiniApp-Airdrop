export interface Ad {
    adsName: string;
    budget: number;
    startDate: string;
    endDate: string;
    targetAudience: string;
    locations: string[];
    creativeType: string; // Image/Html/Video
    creativeURL: string;
    _id: string; // MongoDB ID from the API
    description?: string
}

export interface AdRewardParams {
  adId: string;
  userId: string;
  rewardedAmount: number;
  createdAt: string;
  chainId: string;
  txHash: string;
}

export interface CreateUserParams {
worldId: string;
nickname: string;
walletAddress: string;
avatar?: string;
}

export interface LoginUserParams {
  worldId: string;
  walletAddress: string
}
  
export interface Comment{
  _id: string;
  advertisementId: string;
  worldId: string; // Changed from userId to worldId
  content: string;
  commentType: string;
  mediaUrl: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  dislikeCount: number;
  replyCount: number
}

export interface Reply{
  _id: string;
  commentId: string;
  worldId: string; // Changed from userId to worldId
  content: string;
  commentType: string;
  mediaUrl: string;
  createdAt: string;
  updatedAt: string;
  likeCount: number;
  dislikeCount: number;
}


export interface PostCommentParams{
  advertisementId: string;
  content:string;
  commentType:string;
  mediaUrl: string;
  worldId:string;
}

export interface PostReplyParams{
  commentId: string;
  content:string;
  commentType:string;
  mediaUrl: string;
  worldId:string;
  advertisementId?: string; // Add optional advertisementId to ensure it's included in the reply
}

export interface ReactionParams {
  targetId: string;
  targetType: "Comment" | "Reply";
  worldId: string;
  reactionType: "Like" | "Dislike";
}
