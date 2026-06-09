// src/API/MuadzResponse/AbsensiResponse.js
import { AxiosConfig } from "../../Services/AxiosConfig";

/**
 * AbsensiResponse
 * Base endpoint : /presensi
 * Sinkron dengan PresensiModel backend:
 *   - primary key  : id_presensi
 *   - relasi siswa : nama_siswa, nis_siswa (flat via withSiswa())
 *   - filter utama : per rombel
 */
export const AbsensiResponse = {

    // ── GET semua data presensi ────────────────
    // Response: [{ id_presensi, id_anggota, tugas_ke, tanggal_penilaian,
    //              status_kehadiran, nama_siswa, nis_siswa }]
    getAll: async () => {
        try {
            const response = await AxiosConfig.get("/presensi");
            return response;
        } catch (error) {
            console.error("Gagal mengambil semua data presensi:", error);
            throw error;
        }
    },

    // ── GET presensi berdasarkan rombel ────────
    getByRombel: async (idRombel) => {
        try {
            const response = await AxiosConfig.get(`/presensi/rombel/${idRombel}`);
            return response;
        } catch (error) {
            console.error(`Gagal mengambil presensi rombel ${idRombel}:`, error);
            throw error;
        }
    },

    // ── DELETE hapus data presensi ─────────────
    delete: async (idPresensi) => {
        try {
            const response = await AxiosConfig.delete(`/presensi/${idPresensi}`);
            return response;
        } catch (error) {
            console.error(`Gagal menghapus presensi ${idPresensi}:`, error);
            throw error;
        }
    },
};