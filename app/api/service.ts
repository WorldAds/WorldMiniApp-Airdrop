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

