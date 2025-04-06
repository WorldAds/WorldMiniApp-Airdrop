import { AdRewardParams, CreateUserParams, LoginUserParams } from '@/@types/data';
import axios from 'axios';

axios.defaults.withCredentials = false;

const apiClient = axios.create({
  baseURL: 'https://world-backend-v1-6a037ce588aa.herokuapp.com',
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
