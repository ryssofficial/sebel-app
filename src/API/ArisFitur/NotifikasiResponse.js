// src/API/ArisFitur/NotifikasiResponse.js
import { AxiosConfig } from "../../Services/AxiosConfig";

const endpoint = "/notifikasi";

export const NotifikasiResponse = {
    getAll: async () => {
        const response = await AxiosConfig.get(endpoint);
        return response.data; // Mengambil isi sendResponse dari backend
    },

    markAsRead: async (id) => {
        const response = await AxiosConfig.put(`${endpoint}/${id}/read`, {});
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await AxiosConfig.put(`${endpoint}/read-all`, {});
        return response.data;
    },

    delete: async (id) => {
        const response = await AxiosConfig.delete(`${endpoint}/${id}`);
        return response.data;
    }
};