import axios from 'axios';

const API_URL = 'http://localhost:3001/api'; // Replace with your actual API URL

export const fetchStatistics = async () => {
  const response = await axios.get(`${API_URL}/statistics/dashboard`);
  return response.data; // Adjust based on the actual response structure
};

export const fetchNotifications = async () => {
  const response = await axios.get(`${API_URL}/notifications`);
  return response.data; // This should match the expected structure from the notifications API
};
