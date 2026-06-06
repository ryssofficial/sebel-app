// src/Screens/NotifikasiPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    Alert, 
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import { HappyHuesTheme } from '../Constants/Theme';
import { BrutalistButton } from '../Components/Brutalist';
import { NotifikasiResponse } from '../API/ArisFitur/NotifikasiResponse';

const formatTanggal = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export function NotifikasiPage({ route }) {
    const role = route?.params?.role || "Siswa"; 

    const [notifikasi, setNotifikasi] = useState([]);
    const [filter, setFilter] = useState("semua");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Ambil data langsung dari Server API
    const fetchNotifikasi = useCallback(async () => {
        setLoading(true);
        try {
            const res = await NotifikasiResponse.getAll();
            // Server Anda membungkus payload array data di dalam properti .data
            const finalData = Array.isArray(res) ? res : res?.data ?? [];
            setNotifikasi(finalData);
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Gagal memuat notifikasi dari server.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifikasi();
    }, [fetchNotifikasi]);

    const handleMarkAsRead = async (id) => {
        try {
            await NotifikasiResponse.markAsRead(id);
            setNotifikasi(prev =>
                prev.map(n => n.id_notif === id ? { ...n, is_read: true } : n)
            );
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Gagal menandai telah dibaca di server.");
        }
    };

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0 || actionLoading) return;
        setActionLoading(true);
        try {
            await NotifikasiResponse.markAllAsRead();
            setNotifikasi(prev => prev.map(n => ({ ...n, is_read: true })));
            Alert.alert("Sukses", "Semua notifikasi telah ditandai dibaca.");
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Gagal memperbarui semua status data.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Hapus Notifikasi",
            "Apakah Anda yakin ingin menghapus notifikasi ini?",
            [
                { text: "Batal", style: "cancel" },
                { 
                    text: "Hapus", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            await NotifikasiResponse.delete(id);
                            setNotifikasi(prev => prev.filter(n => n.id_notif !== id));
                        } catch (err) {
                            console.error(err);
                            Alert.alert("Error", "Gagal menghapus data di server.");
                        }
                    }
                }
            ]
        );
    };

    // Filter logis berdasarkan properti database PostgreSQL (is_read)
    const unreadCount = notifikasi.filter(n => !n.is_read).length;
    const filteredData = notifikasi.filter(n => {
        if (filter === "belum") return !n.is_read;
        if (filter === "sudah") return n.is_read;
        return true;
    });

    const renderNotifItem = ({ item }) => {
        const isUnread = !item.is_read;

        return (
            <View style={[
                styles.notifContainer, 
                { 
                    backgroundColor: isUnread ? '#fff8f0' : HappyHuesTheme.main,
                    borderColor: isUnread ? HappyHuesTheme.highlight : HappyHuesTheme.stroke,
                    shadowColor: isUnread ? HappyHuesTheme.highlight : HappyHuesTheme.stroke,
                    elevation: isUnread ? 6 : 3
                }
            ]}>
                <View style={[
                    styles.dot, 
                    { backgroundColor: isUnread ? HappyHuesTheme.secondary : 'transparent' }
                ]} />

                <View style={styles.textContainer}>
                    <View style={styles.headerItem}>
                        <Text style={styles.judulText}>{item.judul}</Text>
                        <Text style={styles.tanggalText}>🕐 {formatTanggal(item.tanggal_notif)}</Text>
                    </View>
                    <Text style={styles.pesanText}>{item.pesan}</Text>

                    <View style={styles.actionRow}>
                        {isUnread && (
                            <TouchableOpacity 
                                style={[styles.miniButton, { backgroundColor: HappyHuesTheme.tertiary }]} 
                                onPress={() => handleMarkAsRead(item.id_notif)}
                            >
                                <Text style={styles.miniButtonText}>✓ Dibaca</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity 
                            style={[styles.miniButton, { backgroundColor: HappyHuesTheme.secondary }]} 
                            onPress={() => handleDelete(item.id_notif)}
                        >
                            <Text style={styles.miniButtonText}>🗑️ Hapus</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerCard}>
                <Text style={styles.screenTitle}>
                    🔔 NOTIFIKASI {unreadCount > 0 ? `(${unreadCount})` : ''}
                </Text>
                
                <View style={styles.tabContainer}>
                    {['semua', 'belum', 'sudah'].map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => setFilter(type)}
                            style={[
                                styles.tabButton,
                                { backgroundColor: filter === type ? HappyHuesTheme.highlight : HappyHuesTheme.main }
                            ]}
                        >
                            <Text style={[
                                styles.tabButtonText,
                                { color: filter === type ? HappyHuesTheme.buttonText : HappyHuesTheme.stroke }
                            ]}>
                                {type === 'semua' ? 'Semua' : type === 'belum' ? 'Belum' : 'Sudah'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ gap: 5, marginTop: 10 }}>
                    <BrutalistButton 
                        label={actionLoading ? "MEMPROSES..." : "✓ TANDAI SEMUA DIBACA"} 
                        onPress={handleMarkAllAsRead} 
                        type="primary"
                        disabled={unreadCount === 0 || actionLoading}
                    />
                    <BrutalistButton 
                        label="🔄 REFRESH DATA" 
                        onPress={fetchNotifikasi} 
                        type="secondary"
                        disabled={loading}
                    />
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color={HappyHuesTheme.button} style={{ marginTop: 40 }} />
            ) : filteredData.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={{ fontSize: 50, marginBottom: 10 }}>🔔</Text>
                    <Text style={styles.emptyText}>Tidak Ada Notifikasi</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item.id_notif.toString()}
                    renderItem={renderNotifItem}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e8e4e1' },
    headerCard: { padding: 15, backgroundColor: 'white', borderBottomWidth: 4, borderColor: HappyHuesTheme.stroke },
    screenTitle: { fontSize: 20, fontWeight: '900', color: HappyHuesTheme.stroke, marginBottom: 15 },
    tabContainer: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        borderWidth: 2,
        borderColor: HappyHuesTheme.stroke,
        alignItems: 'center',
    },
    tabButtonText: { fontWeight: '900', textTransform: 'uppercase', fontSize: 12 },
    listContent: { padding: 15, paddingBottom: 30 },
    notifContainer: {
        flexDirection: 'row',
        padding: 15,
        borderWidth: 3,
        borderColor: HappyHuesTheme.stroke,
        marginBottom: 12,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginTop: 4,
        marginRight: 12,
        borderWidth: 1,
        borderColor: HappyHuesTheme.stroke
    },
    textContainer: { flex: 1 },
    headerItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 5 },
    judulText: { fontWeight: '900', fontSize: 14, color: HappyHuesTheme.stroke, textTransform: 'uppercase' },
    tanggalText: { fontSize: 11, color: HappyHuesTheme.paragraph, fontWeight: 'bold' },
    pesanText: { fontSize: 13, color: HappyHuesTheme.stroke, lineHeight: 18, marginBottom: 10 },
    actionRow: { flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
    miniButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderWidth: 2,
        borderColor: HappyHuesTheme.stroke,
    },
    miniButtonText: { color: 'white', fontWeight: '900', fontSize: 11, textTransform: 'uppercase' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
    emptyText: { fontWeight: '900', fontSize: 16, color: HappyHuesTheme.paragraph, textTransform: 'uppercase' }
});