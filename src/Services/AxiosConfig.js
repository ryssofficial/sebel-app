import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.1.196:5000/api'; 

export const AxiosConfig = axios.create({
    baseURL: API_URL, 
    timeout: 10000, 
    headers: {
        'Content-Type': 'application/json',
    }
});

// Interceptor untuk otomatis menyisipkan JWT Token
AxiosConfig.interceptors.request.use(
    async (config) => {
        // 🌟 JIKA melakukan request ke rute login, JANGAN sisipkan token apa pun!
        if (config.url && config.url.includes('/login')) {
            return config; 
        }

        const token = await SecureStore.getItemAsync('sebel_session');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);