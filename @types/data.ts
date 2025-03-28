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