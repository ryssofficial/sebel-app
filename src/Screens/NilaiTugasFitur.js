// src/Screens/NilaiTugasFitur.js
import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { NilaiTugasResponse } from '../API/MuadzResponse/NilaiTugasResponse';

// ── Helper warna nilai ────────────────────────────────────────────────────────
const getNilaiColor = (nilai) => {
    if (nilai >= 85) return { bg: '#d1fae5', text: '#065f46' }; // hijau
    if (nilai >= 70) return { bg: '#fef3c7', text: '#92400e' }; // kuning
    return { bg: '#fee2e2', text: '#991b1b' };                   // merah
};

const formatTanggal = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

// ── Komponen satu kartu nilai ─────────────────────────────────────────────────
const NilaiItem = ({ item, onEdit, onDelete }) => {
    const color = getNilaiColor(Number(item.nilai));
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.siswaInfo}>
                    <Text style={styles.namaSiswa}>{item.nama_siswa}</Text>
                    <Text style={styles.nisSiswa}>NIS: {item.nis_siswa}</Text>
                </View>
                <View style={[styles.nilaiBadge, { backgroundColor: color.bg }]}>
                    <Text style={[styles.nilaiText, { color: color.text }]}>
                        {item.nilai}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tugas ke</Text>
                    <Text style={styles.infoValue}>{item.tugas_ke}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tanggal Input</Text>
                    <Text style={styles.infoValue}>{formatTanggal(item.tanggal_input)}</Text>
                </View>
            </View>

            <View style={styles.cardActions}>
                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => onEdit(item)}
                >
                    <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => onDelete(item.id_nilai)}
                >
                    <Text style={styles.deleteBtnText}>Hapus</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

// ── Modal tambah / edit nilai ─────────────────────────────────────────────────
const NilaiModal = ({ visible, item, onClose, onSave }) => {
    const isEdit = !!item;
    const [nilai, setNilai] = useState('');
    const [tugaske, setTugaske] = useState('');

    useEffect(() => {
        if (item) {
            setNilai(String(item.nilai));
            setTugaske(String(item.tugas_ke));
        } else {
            setNilai('');
            setTugaske('');
        }
    }, [item, visible]);

    const handleSave = () => {
        const parsed = Number(nilai);
        if (!tugaske || isNaN(parsed) || parsed < 0 || parsed > 100) {
            Alert.alert('Validasi', 'Isi Tugas ke dan Nilai (0–100) dengan benar.');
            return;
        }
        onSave({ tugas_ke: Number(tugaske), nilai: parsed });
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <KeyboardAvoidingView
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.modalBox}>
                    <Text style={styles.modalTitle}>
                        {isEdit ? 'Edit Nilai Tugas' : 'Tambah Nilai Tugas'}
                    </Text>

                    <Text style={styles.fieldLabel}>Tugas ke</Text>
                    <TextInput
                        style={styles.input}
                        value={tugaske}
                        onChangeText={setTugaske}
                        keyboardType="numeric"
                        placeholder="Contoh: 1"
                    />

                    <Text style={styles.fieldLabel}>Nilai (0–100)</Text>
                    <TextInput
                        style={styles.input}
                        value={nilai}
                        onChangeText={setNilai}
                        keyboardType="numeric"
                        placeholder="Contoh: 85"
                    />

                    <View style={styles.modalActions}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                            <Text style={styles.cancelBtnText}>Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Text style={styles.saveBtnText}>Simpan</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

// ── Screen utama ──────────────────────────────────────────────────────────────
const NilaiTugasFitur = ({ route }) => {
    const idRombel = route?.params?.id_rombel ?? null;
    const idMapel  = route?.params?.id_mapel  ?? null;
    const idGuru   = route?.params?.id_guru   ?? null; // untuk payload create

    const [data, setData] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError]         = useState(null);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [editItem, setEditItem]         = useState(null);

    // ── Rata-rata nilai ────────────────────────────────────────────────────
    const rataRata = React.useMemo(() => {
        if (!data.length) return 0;
        return (data.reduce((sum, i) => sum + Number(i.nilai), 0) / data.length).toFixed(1);
    }, [data]);

    // ── Fetch ──────────────────────────────────────────────────────────────
    const fetchData = useCallback(async (isRefresh = false) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            setError(null);

            let res;
            if (idRombel && idMapel) {
                res = await NilaiTugasResponse.getByRombelAndMapel(idRombel, idMapel);
            } else if (idRombel) {
                res = await NilaiTugasResponse.getByRombel(idRombel);
            } else {
                res = await NilaiTugasResponse.getAll();
            }

            setData(res?.data ?? []);
        } catch (err) {
            setError('Gagal memuat data nilai tugas.');
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [idRombel, idMapel]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── Handler delete ─────────────────────────────────────────────────────
    const handleDelete = (id) => {
        Alert.alert(
            'Hapus Nilai',
            'Yakin ingin menghapus nilai tugas ini?',
            [
                { text: 'Batal', style: 'cancel' },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await NilaiTugasResponse.delete(id);
                            setData((prev) => prev.filter((i) => i.id_nilai !== id));
                        } catch {
                            Alert.alert('Error', 'Gagal menghapus nilai.');
                        }
                    },
                },
            ]
        );
    };

    // ── Handler save (create/update) ───────────────────────────────────────
    const handleSave = async ({ tugas_ke, nilai }) => {
        try {
            if (editItem) {
                const res = await NilaiTugasResponse.update(editItem.id_nilai, {
                    tugas_ke,
                    nilai,
                });
                // Update lokal
                setData((prev) =>
                    prev.map((i) =>
                        i.id_nilai === editItem.id_nilai
                            ? { ...i, tugas_ke, nilai, ...res?.data }
                            : i
                    )
                );
            } else {
                // Tambah baru — butuh id_anggota, id_mapel, id_guru dari context / route
                const payload = {
                    id_anggota: route?.params?.id_anggota ?? null,
                    id_mapel:   idMapel,
                    id_guru:    idGuru,
                    tugas_ke,
                    nilai,
                    tanggal_input: new Date().toISOString().split('T')[0],
                };
                await NilaiTugasResponse.create(payload);
                fetchData();
            }
            setModalVisible(false);
            setEditItem(null);
        } catch {
            Alert.alert('Error', 'Gagal menyimpan nilai tugas.');
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.loadingText}>Memuat data nilai tugas…</Text>
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
                <View>
                    <Text style={styles.headerTitle}>Nilai Tugas</Text>
                    {(idRombel || idMapel) && (
                        <Text style={styles.headerSubtitle}>
                            {[idRombel && `Kelas ${idRombel}`, idMapel && `Mapel ${idMapel}`]
                                .filter(Boolean)
                                .join(' · ')}
                        </Text>
                    )}
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => {
                        setEditItem(null);
                        setModalVisible(true);
                    }}
                >
                    <Text style={styles.addBtnText}>+ Tambah</Text>
                </TouchableOpacity>
            </View>

            {/* Ringkasan rata-rata */}
            {data.length > 0 && (
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryLabel}>Rata-rata Nilai</Text>
                    <Text
                        style={[
                            styles.summaryValue,
                            { color: getNilaiColor(Number(rataRata)).text },
                        ]}
                    >
                        {rataRata}
                    </Text>
                    <Text style={styles.summaryCount}>{data.length} siswa</Text>
                </View>
            )}

            {/* List */}
            <FlatList
                data={data}
                keyExtractor={(item) => String(item.id_nilai)}
                renderItem={({ item }) => (
                    <NilaiItem
                        item={item}
                        onEdit={(i) => {
                            setEditItem(i);
                            setModalVisible(true);
                        }}
                        onDelete={handleDelete}
                    />
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
                    <Text style={styles.emptyText}>Belum ada data nilai tugas.</Text>
                }
            />

            {/* Modal tambah/edit */}
            <NilaiModal
                visible={modalVisible}
                item={editItem}
                onClose={() => {
                    setModalVisible(false);
                    setEditItem(null);
                }}
                onSave={handleSave}
            />
        </SafeAreaView>
    );
};

export default NilaiTugasFitur;

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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    addBtn: {
        backgroundColor: '#4f46e5',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },

    // Summary
    summaryBox: {
        marginHorizontal: 16,
        marginVertical: 8,
        backgroundColor: '#eef2ff',
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    summaryLabel: {
        fontSize: 13,
        color: '#4338ca',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: '800',
    },
    summaryCount: {
        fontSize: 12,
        color: '#818cf8',
        marginLeft: 'auto',
    },

    // List
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
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
    nilaiBadge: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nilaiText: {
        fontSize: 18,
        fontWeight: '800',
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
    cardActions: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 8,
    },
    editBtn: {
        flex: 1,
        backgroundColor: '#eef2ff',
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
    },
    editBtnText: {
        color: '#4f46e5',
        fontWeight: '600',
        fontSize: 13,
    },
    deleteBtn: {
        flex: 1,
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

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    modalBox: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        paddingBottom: 36,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 20,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 15,
        color: '#1e293b',
        marginBottom: 16,
        backgroundColor: '#f8fafc',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },
    cancelBtn: {
        flex: 1,
        backgroundColor: '#f1f5f9',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#475569',
        fontWeight: '600',
    },
    saveBtn: {
        flex: 1,
        backgroundColor: '#4f46e5',
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#fff',
        fontWeight: '700',
    },
});