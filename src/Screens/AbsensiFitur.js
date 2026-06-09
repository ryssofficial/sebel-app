// src/Screens/AbsensiFitur.js
import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    RefreshControl,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { AbsensiResponse } from '../API/MuadzResponse/AbsensiResponse';

// ── Konstanta warna status kehadiran ──────────────────────────────────────────
const STATUS_COLOR = {
    Hadir: { bg: '#d1fae5', text: '#065f46' },
    Izin:  { bg: '#fef3c7', text: '#92400e' },
    Sakit: { bg: '#dbeafe', text: '#1e40af' },
    Alpha: { bg: '#fee2e2', text: '#991b1b' },
};

// ── Helper format tanggal ─────────────────────────────────────────────────────
const formatTanggal = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

// ── Komponen badge status ─────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const color = STATUS_COLOR[status] ?? { bg: '#f3f4f6', text: '#374151' };
    return (
        <View style={[styles.badge, { backgroundColor: color.bg }]}>
            <Text style={[styles.badgeText, { color: color.text }]}>{status}</Text>
        </View>
    );
};

// ── Komponen satu baris presensi ──────────────────────────────────────────────
const AbsensiItem = ({ item, onDelete }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={styles.siswaInfo}>
                <Text style={styles.namaSiswa}>{item.nama_siswa}</Text>
                <Text style={styles.nisSiswa}>NIS: {item.nis_siswa}</Text>
            </View>
            <StatusBadge status={item.status_kehadiran} />
        </View>

        <View style={styles.cardBody}>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tugas ke</Text>
                <Text style={styles.infoValue}>{item.tugas_ke}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tanggal</Text>
                <Text style={styles.infoValue}>{formatTanggal(item.tanggal_penilaian)}</Text>
            </View>
        </View>

        <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => onDelete(item.id_presensi)}
        >
            <Text style={styles.deleteBtnText}>Hapus</Text>
        </TouchableOpacity>
    </View>
);

// ── Screen utama ──────────────────────────────────────────────────────────────
const AbsensiFitur = ({ route }) => {
    // Opsional: terima id_rombel dari navigasi
    const idRombel = route?.params?.id_rombel ?? null;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // ── Statistik ringkas ─────────────────────────────────────────────────────
    const stats = React.useMemo(() => {
    const counts = { Hadir: 0, Izin: 0, Sakit: 0, Alpha: 0 };
    if (!Array.isArray(data)) return counts; // ← tambah ini
    data.forEach(({ status_kehadiran }) => {
        if (counts[status_kehadiran] !== undefined) counts[status_kehadiran]++;
    });
    return counts;
    }, [data]);

    // ── Fetch data ────────────────────────────────────────────────────────────
    const fetchData = useCallback(async (isRefresh = false) => {
    try {
        isRefresh ? setRefreshing(true) : setLoading(true);
        setError(null);

        const res = idRombel
            ? await AbsensiResponse.getByRombel(idRombel)
            : await AbsensiResponse.getAll();

        // Tangani berbagai kemungkinan struktur response
        const result = Array.isArray(res) ? res 
                     : Array.isArray(res?.data) ? res.data 
                     : [];
        setData(result);
    } catch (err) {
        setError('Gagal memuat data presensi.');
        console.error(err);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
    }, [idRombel]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── Handler delete ────────────────────────────────────────────────────────
    const handleDelete = (id) => {
        Alert.alert(
            'Hapus Presensi',
            'Yakin ingin menghapus data presensi ini?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AbsensiResponse.delete(id);
                            setData((prev) => prev.filter((item) => item.id_presensi !== id));
                        } catch {
                            Alert.alert('Error', 'Gagal menghapus data presensi.');
                        }
                    },
                },
            ]
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.loadingText}>Memuat data presensi…</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={() => fetchData()}>
                    <Text style={styles.retryText}>Coba Lagi</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Data Presensi</Text>
                {idRombel && (
                    <Text style={styles.headerSubtitle}>Kelas {idRombel}</Text>
                )}
            </View>

            {/* Statistik */}
            <View style={styles.statsRow}>
                {Object.entries(stats).map(([key, val]) => (
                    <View
                        key={key}
                        style={[
                            styles.statCard,
                            { backgroundColor: STATUS_COLOR[key]?.bg ?? '#f3f4f6' },
                        ]}
                    >
                        <Text
                            style={[
                                styles.statNum,
                                { color: STATUS_COLOR[key]?.text ?? '#374151' },
                            ]}
                        >
                            {val}
                        </Text>
                        <Text
                            style={[
                                styles.statLabel,
                                { color: STATUS_COLOR[key]?.text ?? '#374151' },
                            ]}
                        >
                            {key}
                        </Text>
                    </View>
                ))}
            </View>

            {/* List */}
            <FlatList
                data={data}
                keyExtractor={(item) => String(item.id_presensi)}
                renderItem={({ item }) => (
                    <AbsensiItem item={item} onDelete={handleDelete} />
                )}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchData(true)}
                        colors={['#4f46e5']}
                    />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Tidak ada data presensi.</Text>
                }
            />
        </SafeAreaView>
    );
};

export default AbsensiFitur;

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        marginTop: 12,
        color: '#6b7280',
        fontSize: 14,
    },
    errorText: {
        color: '#dc2626',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    retryBtn: {
        backgroundColor: '#4f46e5',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontWeight: '600',
    },

    // Header
    header: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1e293b',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 2,
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
    },
    statCard: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
    },
    statNum: {
        fontSize: 20,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '500',
        marginTop: 2,
    },

    // List
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
        gap: 10,
    },
    emptyText: {
        textAlign: 'center',
        color: '#94a3b8',
        marginTop: 40,
        fontSize: 14,
    },

    // Card
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    siswaInfo: {
        flex: 1,
        marginRight: 8,
    },
    namaSiswa: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    nisSiswa: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    cardBody: {
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 10,
        gap: 6,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoLabel: {
        fontSize: 13,
        color: '#64748b',
    },
    infoValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#334155',
    },
    deleteBtn: {
        marginTop: 12,
        backgroundColor: '#fee2e2',
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
    },
    deleteBtnText: {
        color: '#dc2626',
        fontWeight: '600',
        fontSize: 13,
    },
});