import { AdRewardParams } from '@/@types/data';
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
    const response = await apiClient.post('/api/v1/rewards', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    throw error;
  }
};

export const getAdsReward = async (id:string) => {
  try {
    const response = await apiClient.get(`/api/v1/rewards/user/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching advertisement by id:', error);
    throw error;
  }
};
