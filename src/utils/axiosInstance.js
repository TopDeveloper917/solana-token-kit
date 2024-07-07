import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://devnet.helius-rpc.com/?api-key=ff11e47b-f217-4498-9cba-0daf7a3e8164',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosInstance;