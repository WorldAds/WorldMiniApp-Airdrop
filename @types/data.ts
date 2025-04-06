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
walletAddress: string
}

export interface LoginUserParams {
  worldId: string;
  walletAddress: string
}
  
