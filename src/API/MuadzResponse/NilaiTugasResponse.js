// src/API/MuadzResponse/NilaiTugasResponse.js
import { AxiosConfig } from "../../Services/AxiosConfig";

/**
 * NilaiTugasResponse
 * Base endpoint : /nilai-tugas
 * Sinkron dengan NilaiTugasModel backend:
 *   - primary key  : id_nilai
 *   - fillable     : id_anggota, id_mapel, tugas_ke, nilai, id_guru, tanggal_input
 *   - relasi siswa : nama_siswa, nis_siswa (flat via withSiswa())
 *   - filter utama : per rombel + per mapel
 */
export const NilaiTugasResponse = {

    // ── GET semua data nilai tugas ─────────────
    getAll: async () => {
        try {
            const response = await AxiosConfig.get("/nilai-tugas");
            return response;
        } catch (error) {
            console.error("Gagal mengambil semua data nilai tugas:", error);
            throw error;
        }
    },

    // ── GET nilai tugas per rombel ─────────────
    getByRombel: async (idRombel) => {
        try {
            const response = await AxiosConfig.get(`/nilai-tugas/rombel/${idRombel}`);
            return response;
        } catch (error) {
            console.error(`Gagal mengambil nilai tugas rombel ${idRombel}:`, error);
            throw error;
        }
    },

    // ── GET nilai tugas per rombel + mapel ─────
    getByRombelAndMapel: async (idRombel, idMapel) => {
        try {
            const response = await AxiosConfig.get(
                `/nilai-tugas/rombel/${idRombel}/mapel/${idMapel}`
            );
            return response;
        } catch (error) {
            console.error(
                `Gagal mengambil nilai tugas rombel ${idRombel} mapel ${idMapel}:`,
                error
            );
            throw error;
        }
    },

    // ── POST tambah nilai tugas baru ───────────
    // payload: { id_anggota, id_mapel, tugas_ke, nilai, id_guru, tanggal_input }
    create: async (payload) => {
        try {
            const response = await AxiosConfig.post("/nilai-tugas", payload);
            return response;
        } catch (error) {
            console.error("Gagal menambah nilai tugas:", error);
            throw error;
        }
    },

    // ── PUT update nilai tugas ─────────────────
    update: async (id, payload) => {
        try {
            const response = await AxiosConfig.put(`/nilai-tugas/${id}`, payload);
            return response;
        } catch (error) {
            console.error(`Gagal mengupdate nilai tugas ${id}:`, error);
            throw error;
        }
    },

    // ── DELETE hapus nilai tugas ───────────────
    delete: async (id) => {
        try {
            const response = await AxiosConfig.delete(`/nilai-tugas/${id}`);
            return response;
        } catch (error) {
            console.error(`Gagal menghapus nilai tugas ${id}:`, error);
            throw error;
        }
    },
};