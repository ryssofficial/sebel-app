// src/Manager/SessionManager.js
import * as SecureStore from 'expo-secure-store';

export const saveToken = async (token) => {
    // Poin Keamanan Penyimpanan Client: Data dienkripsi di perangkat fisik
    await SecureStore.setItemAsync('sebel_token', token);
};

export const getToken = async () => {
    return await SecureStore.getItemAsync('sebel_token');
};