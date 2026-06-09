// src/Screens/DashboardPage.js
import React, { useEffect, useState, useCallback } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    ScrollView, 
    ActivityIndicator, 
    Alert,
    RefreshControl
} from 'react-native';
import { HappyHuesTheme } from '../Constants/Theme';
import { BrutalistCard, BrutalistButton } from '../Components/Brutalist';
import { handleLogout } from '../Services/HandleLogOut';
import { AxiosConfig } from '../Services/AxiosConfig';

// ==========================================
// SUB-KOMPONEN: STAT HIGHLIGHT
// ==========================================
const StatHighlight = ({ label, value, icon, accentColor, subtext }) => (
    <BrutalistCard title={label} accentColor={accentColor}>
        <View style={styles.statHeaderRow}>
            <View style={[styles.statIconContainer, { backgroundColor: accentColor }]}>
                <Text style={styles.statIcon}>{icon}</Text>
            </View>
            <Text style={styles.statValue}>{value}</Text>
        </View>
        {subtext && <Text style={styles.statSubtext}>{subtext}</Text>}
    </BrutalistCard>
);

// ==========================================
// SUB-KOMPONEN: PREVIEW NOTIFIKASI
// ==========================================
const NotifPreviewList = ({ notifikasi }) => {
    if (!notifikasi || notifikasi.length === 0) {
        return <Text style={styles.emptyText}>Tidak ada pemberitahuan baru.</Text>;
    }

    return notifikasi.slice(0, 3).map((notif, index) => (
        <View 
            key={index} 
            style={[
                styles.notifItemBox, 
                { borderLeftColor: index % 2 === 0 ? HappyHuesTheme.highlight : HappyHuesTheme.tertiary }
            ]}
        >
            <Text style={styles.notifItemJudul}>{notif.judul}</Text>
            <Text style={styles.notifItemPesan} numberOfLines={2}>{notif.pesan}</Text>
        </View>
    ));
};

// ==========================================
// KURSOR LOGIKA STATUS JADWAL
// ==========================================
const determineScheduleStatus = (jamMulai, jamSelesai) => {
    if (!jamMulai || !jamSelesai) return "-";
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); 

    const getMinutes = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return (hours * 60) + minutes;
    };

    const start = getMinutes(jamMulai);
    const end = getMinutes(jamSelesai);

    if (currentTime < start) return "Belum Mulai";
    if (currentTime >= start && currentTime <= end) return "Berlangsung";
    return "Selesai";
};

// ==========================================
// DASHBOARD VIEW FOR GURU
// ==========================================
export function DashboardGuru({ navigation, onLogout, data, onRefresh, refreshing }) {
    const stats = data?.stats || {};
    const jadwal = data?.jadwal || [];

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.welcomeBox}>
                <Text style={styles.roleText}>PORTAL GURU SEBEL</Text>
                <Text style={styles.welcomeText}>Halo, Pengajar!</Text>
            </View>

            {/* SEKSI STATISTIK DARI DATABASE */}
            <View style={styles.statGrid}>
                <StatHighlight 
                    label="Kehadiran Siswa" 
                    value={stats.kehadiran || "0%"} 
                    icon="📍" 
                    accentColor={HappyHuesTheme.highlight}
                    subtext="Presensi hari ini"
                />
                <StatHighlight 
                    label="Total Kelas" 
                    value={stats.totalKelas || "0"} 
                    icon="⏳" 
                    accentColor={HappyHuesTheme.tertiary}
                    subtext="Yang diampu"
                />
                <StatHighlight 
                    label="Tugas Aktif" 
                    value={stats.tugasAktif || "0"} 
                    icon="📚" 
                    accentColor={HappyHuesTheme.secondary}
                    subtext="Perlu dinilai"
                />
            </View>

            {/* JADWAL MENGAJAR */}
            <BrutalistCard title="📅 Jadwal Mengajar Hari Ini">
                {jadwal.length > 0 ? jadwal.map((j, idx) => (
                    <View key={idx} style={styles.tableRow}>
                        <Text style={styles.tableCellMain}>{j.jamMulai?.slice(0, 5)} - {j.jamSelesai?.slice(0, 5)}</Text>
                        <Text style={styles.tableCellSub}>{j.mataPelajaran}</Text>
                        <Text style={styles.tableCellSide}>{j.kelas}{j.kategori} ({determineScheduleStatus(j.jamMulai, j.jamSelesai)})</Text>
                    </View>
                )) : <Text style={styles.emptyText}>Tidak ada jadwal mengajar hari ini.</Text>}
            </BrutalistCard>

            {/* NOTIFIKASI TERBARU */}
            <BrutalistCard title="🔔 Pemberitahuan Terbaru" accentColor={HappyHuesTheme.secondary}>
                <NotifPreviewList notifikasi={data?.notifikasi} />
                <View style={{ marginTop: 10 }}>
                    <BrutalistButton 
                        label="LIHAT SEMUA NOTIFIKASI" 
                        onPress={() => navigation.navigate('Notifikasi', { role: 'Guru' })} 
                    />
                </View>
            </BrutalistCard>

            <View style={{ gap: 10, marginTop: 15 }}>
                    <BrutalistButton 
                        label="MULAI PRESENSI KELAS" 
                        onPress={() => navigation.navigate('Absensi')} 
                    />
                    <BrutalistButton 
                        label="NILAI TUGAS" 
                        onPress={() => navigation.navigate('NilaiTugas')} 
                    />
                    <BrutalistButton label="LOGOUT" type="secondary" onPress={() => handleLogout(onLogout)} />
            </View>
        </ScrollView>
    );
}

// ==========================================
// DASHBOARD VIEW FOR SISWA
// ==========================================
export function DashboardSiswa({ navigation, onLogout, data, onRefresh, refreshing }) {
    const stats = data?.stats || {};
    const jadwal = data?.jadwal || [];

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.welcomeBox}>
                <Text style={styles.roleText}>PORTAL SISWA SEBEL</Text>
                <Text style={styles.welcomeText}>Selamat Datang!</Text>
            </View>

            {/* SEKSI STATISTIK DARI DATABASE */}
            <View style={styles.statGrid}>
                <StatHighlight 
                    label="Tabungan Anda" 
                    value={`Rp ${parseInt(stats.saldoTabungan || 0).toLocaleString('id-ID')}`} 
                    icon="💰" 
                    accentColor={HappyHuesTheme.highlight}
                    subtext="Saldo terkini"
                />
                <StatHighlight 
                    label="Tugas Baru" 
                    value={stats.tugasBaru || "0"} 
                    icon="📝" 
                    accentColor={HappyHuesTheme.secondary}
                    subtext="Belum dikerjakan"
                />
                <StatHighlight 
                    label="Persentase Hadir" 
                    value={stats.persentaseHadir || "0%"} 
                    icon="📅" 
                    accentColor={HappyHuesTheme.tertiary}
                    subtext="Semester ini"
                />
            </View>

            {/* JADWAL PELAJARAN */}
            <BrutalistCard title="📅 Jadwal Pelajaran Hari Ini">
                {jadwal.length > 0 ? jadwal.map((j, idx) => (
                    <View key={idx} style={styles.tableRow}>
                        <Text style={styles.tableCellMain}>{j.jamMulai?.slice(0, 5)} - {j.jamSelesai?.slice(0, 5)}</Text>
                        <Text style={styles.tableCellSub}>{j.mataPelajaran}</Text>
                        <Text style={styles.tableCellSide}>Kelas {j.kelas}{j.kategori} ({determineScheduleStatus(j.jamMulai, j.jamSelesai)})</Text>
                    </View>
                )) : <Text style={styles.emptyText}>Tidak ada jadwal pelajaran hari ini.</Text>}
            </BrutalistCard>

            {/* NOTIFIKASI TERBARU */}
            <BrutalistCard title="🔔 Kotak Masuk Notifikasi" accentColor={HappyHuesTheme.secondary}>
                <NotifPreviewList notifikasi={data?.notifikasi} />
                <View style={{ marginTop: 10 }}>
                    <BrutalistButton 
                        label="LIHAT SEMUA NOTIFIKASI" 
                        onPress={() => navigation.navigate('Notifikasi', { role: 'Siswa' })} 
                    />
                </View>
            </BrutalistCard>

            <View style={{ gap: 10, marginTop: 15 }}>
                <BrutalistButton label="Lihat Jadwal Lengkap" onPress={() => {}} />
                <BrutalistButton label="LIHAT PRESENSI SAYA"  onPress={() => navigation.navigate('Absensi')} />
                <BrutalistButton label="LIHAT NILAI TUGAS" onPress={() => navigation.navigate('NilaiTugas')} />
                <BrutalistButton label="LOGOUT" type="secondary" onPress={() => handleLogout(onLogout)} />
            </View>
        </ScrollView>
    );
}

// ==========================================
// UTAMA: CONTAINER ENGINE UNTUK HIT API
// ==========================================
export default function DashboardPage({ route, navigation, onLogout, currentRole }) {
    // 🌟 Cek dari props 'currentRole' dulu, jika tidak ada baru fallback ke route params atau siswa
    const rawRole = currentRole || route?.params?.role || 'siswa';
    const isGuru = rawRole.toLowerCase() === 'guru';

    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [dashboardData, setDashboardData] = useState({ stats: {}, jadwal: [], notifikasi: [] });

    const fetchDashboardData = useCallback(async (showIndicator = true) => {
        if (showIndicator) setIsLoading(true);
        try {
            const endpoint = isGuru ? "/dashboard/guru" : "/dashboard/siswa";
            const response = await AxiosConfig.get(endpoint);
            
            if (response.data && response.data.success) {
                setDashboardData(response.data.data);
            } else if (response.data) {
                setDashboardData(response.data); 
            }
        } catch (error) {
            console.error("Gagal mengambil data dashboard:", error);
            Alert.alert("Koneksi Gagal", "Gagal menyinkronkan data dengan database server.");
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [isGuru]);

    // Tambahkan log kecil ini untuk memantau jika Anda sedang menguji via terminal simulator
    useEffect(() => {
        console.log("Dashboard dirender untuk role:", rawRole, "| Menembak endpoint Guru?", isGuru);
        fetchDashboardData();
    }, [fetchDashboardData, rawRole]); // 🌟 Masukkan rawRole ke dependency agar refetch jika role berganti

    const handleRefresh = () => {
        setRefreshing(true);
        fetchDashboardData(false);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={HappyHuesTheme.stroke} />
                <Text style={styles.loadingText}>Memuat Data Dashboard...</Text>
            </View>
        );
    }

    if (isGuru) {
        return (
            <DashboardGuru 
                navigation={navigation} 
                onLogout={onLogout} 
                data={dashboardData} 
                refreshing={refreshing}
                onRefresh={handleRefresh}
            />
        );
    }

    return (
        <DashboardSiswa 
            navigation={navigation} 
            onLogout={onLogout} 
            data={dashboardData} 
            refreshing={refreshing}
            onRefresh={handleRefresh}
        />
    );
}

// ==========================================
// STYLES BRUTALIST ADJUSTMENT
// ==========================================
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e8e4e1' },
    content: { padding: 15, paddingBottom: 40 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e8e4e1' },
    loadingText: { marginTop: 10, fontWeight: 'bold', color: HappyHuesTheme.stroke },
    welcomeBox: { marginBottom: 20 },
    roleText: { color: HappyHuesTheme.secondary, fontWeight: '900', letterSpacing: 1 },
    welcomeText: { fontSize: 28, fontWeight: '900', color: HappyHuesTheme.stroke },
    statGrid: { gap: 12, marginBottom: 15 },
    statHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 5 },
    statIconContainer: {
        width: 45, height: 45, borderRadius: 6,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: HappyHuesTheme.stroke
    },
    statIcon: { fontSize: 20 },
    statValue: { fontSize: 28, fontWeight: '900', color: HappyHuesTheme.stroke },
    statSubtext: { fontSize: 11, fontWeight: 'bold', color: HappyHuesTheme.paragraph, marginTop: 5 },
    emptyText: { fontSize: 13, color: HappyHuesTheme.paragraph, fontStyle: 'italic', paddingVertical: 10 },
    
    // Desain Table list item untuk Jadwal
    tableRow: { 
        paddingVertical: 10, 
        borderBottomWidth: 2, 
        borderColor: '#ccc',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    tableCellMain: { fontWeight: '900', color: HappyHuesTheme.stroke, fontSize: 13, width: '30%' },
    tableCellSub: { fontWeight: 'bold', color: HappyHuesTheme.stroke, fontSize: 13, flex: 1 },
    tableCellSide: { fontSize: 11, color: HappyHuesTheme.secondary, fontWeight: 'bold' },

    // Desain item preview Notifikasi
    notifItemBox: {
        borderLeftWidth: 4,
        paddingLeft: 10,
        paddingVertical: 8,
        backgroundColor: 'rgba(255, 137, 6, 0.05)',
        marginBottom: 10
    },
    notifItemJudul: { fontWeight: 'bbold', fontSize: 14, color: HappyHuesTheme.stroke, marginBottom: 2 },
    notifItemPesan: { fontSize: 12, color: HappyHuesTheme.paragraph }
});