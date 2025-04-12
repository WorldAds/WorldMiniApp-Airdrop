import { AdRewardParams, CreateUserParams, FavoriteParams, LoginUserParams, PostCommentParams, PostReplyParams, ReactionParams } from '@/@types/data';
import axios from 'axios';

axios.defaults.withCredentials = false;

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
  timeout: 10000,
  withCredentials: false, 
  headers: {
    'accept': 'application/json'
  }
});

apiClient.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {    
    return Promise.reject(error);
  }
);


export const getAdsList = async () => {
  try {
    const response = await apiClient.get('/api/v1/advertisements');
    return response.data;
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    throw error;
  }
};

export const postAdReward = async (params: AdRewardParams) => {
  try {
    const response = await apiClient.post('/api/v1/rewards', params);
    return response.data;
  } catch (error) {
    console.error('Error posting ad reward:', error);
    throw error;
  }
};

export const getAdsReward = async (id:string) => {
  try {
    const response = await apiClient.get(`/api/v1/rewards/user/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rewards for user:', error);
    throw error;
  }
};


// user

// Create a new user
//201 The user has been successfully created.
//400 Invalid input data.
//409	User with this World ID already exists.
export const createUser = async(params: CreateUserParams) =>{
  try {
    const response = await apiClient.post('/api/v1/users', params);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Login a user or create if not exists
//201 The user has been successfully created.
//400 Invalid input data.
export const loginUser = async(params: LoginUserParams) =>{
  try {
    const response = await apiClient.post('/api/v1/users/login', params);
    return response.data;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
}

export const getUserByWorldID = async (id:string) => {
  try {
    const response = await apiClient.get(`/api/v1/users/world/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user by World ID:', error);
    throw error;
  }
};

export const uploadUserAvatar = async (userId: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(
      `/api/v1/users/${userId}/avatar/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};


export const getCommentsByAdvertisementId = async (
  advertisementId: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const response = await apiClient.get(`/api/v1/comments/advertisement/${advertisementId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching comments by advertisement ID:', error);
    throw error;
  }
};

export const postComment = async(params: PostCommentParams) =>{
  try {
    const response = await apiClient.post('/api/v1/comments', params);
    return response.data;
  } catch (error) {
    console.error('Error posting comment:', error);
    throw error;
  }
}

export const postCommentWithMedia = async (
  advertisementId: string,
  content: string,
  commentType: string,
  mediaFile: File,
  worldId?: string
) => {
  try {
    const formData = new FormData();
    formData.append('advertisementId', advertisementId);
    formData.append('content', content);
    formData.append('commentType', commentType);
    formData.append('media', mediaFile); // Changed back to 'media' based on backend error
    
    // Add worldId if provided
    if (worldId) {
      formData.append('worldId', worldId);
    }

    const response = await apiClient.post('/api/v1/comments/with-media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error posting comment with media:', error);
    throw error;
  }
};

export const getRepliesByCommentId = async (
  commentId: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const response = await apiClient.get(`/api/v1/comments/reply/comment/${commentId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching replies by comment ID:', error);
    throw error;
  }
};

export const postReply = async(params: PostReplyParams) =>{
  try {
    const response = await apiClient.post('/api/v1/comments/reply', params);
    return response.data;
  } catch (error) {
    console.error('Error posting reply:', error);
    throw error;
  }
}

export const postReplyWithMedia = async (
  commentId: string,
  content: string,
  commentType: string,
  mediaFile: File,
  worldId?: string,
  advertisementId?: string
) => {
  try {
    const formData = new FormData();
    formData.append('commentId', commentId);
    formData.append('content', content);
    formData.append('commentType', commentType);
    formData.append('media', mediaFile); // Changed back to 'media' based on backend error
    
    // Add worldId if provided
    if (worldId) {
      formData.append('worldId', worldId);
    }
    
    // Add advertisementId if provided
    if (advertisementId) {
      formData.append('advertisementId', advertisementId);
    }

    const response = await apiClient.post('/api/v1/comments/reply/with-media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error posting reply with media:', error);
    throw error;
  }
};

// Add reaction (like/dislike) to a comment or reply
export const postReaction = async (params: ReactionParams) => {
  try {
    const response = await apiClient.post('/api/v1/comments/reaction', params);
    return response.data;
  } catch (error) {
    console.error('Error posting reaction:', error);
    throw error;
  }
};

// Delete a reaction from a comment or reply
export const deleteReaction = async (targetId: string, targetType: "Comment" | "Reply", worldId: string) => {
  try {
    const response = await apiClient.delete('/api/v1/comments/reaction', {
      params: { targetId, targetType, worldId }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting reaction:', error);
    throw error;
  }
};

// Get user's reaction to a comment or reply
export const getUserReaction = async (targetId: string, targetType: "Comment" | "Reply", worldId: string) => {
  try {
    const response = await apiClient.get('/api/v1/comments/reaction/user', {
      params: { targetId, targetType, worldId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user reaction:', error);
    return null; // Return null if there's no reaction or an error
  }
};

// Get all user reactions for an advertisement's comments and replies
export const getAdReactions = async (advertisementId: string, worldId: string) => {
  try {
    const response = await apiClient.get(`/api/v1/comments/reactions/advertisement/${advertisementId}/user/${worldId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ad reactions:', error);
    return { commentReactions: {}, replyReactions: {} }; // Return empty objects if there's an error
  }
};

// Add an advertisement to favorites
export const postFavorite = async (params: FavoriteParams) => {
  try {
    const response = await apiClient.post('/api/v1/favorites', params);
    return response.data;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};

// Get all favorites for a specific world-id
export const getUserFavorites = async (worldId: string) => {
  try {
    const response = await apiClient.get(`/api/v1/favorites/user/${worldId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    throw error;
  }
};
