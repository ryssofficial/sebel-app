import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal } from 'react-native';
import { HappyHuesTheme } from '../Constants/Theme';
import { BrutalistButton, BrutalistCard } from '../Components/Brutalist';

export function LandingPage({ navigation }) {
    const [showConsent, setShowConsent] = useState(true);

    return (
        <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.heroText}>SEBEL MOBILE</Text>
            <Text style={styles.subText}>Sistem Edukasi Berbasis Elektronik & Layanan</Text>
            
            <BrutalistCard title="TENTANG APLIKASI">
            <Text>SEBEL adalah platform manajemen sekolah terpadu untuk efisiensi akademik antara Guru dan Siswa.</Text>
            </BrutalistCard>

            <BrutalistCard title="FITUR UNGGULAN">
            <Text>• Absensi QR Real-time{"\n"}• Monitoring Nilai Transparan{"\n"}• Notifikasi Tugas Otomatis</Text>
            </BrutalistCard>

            <BrutalistButton label="MASUK KE AKUN" onPress={() => navigation.navigate('Login')} />
        </ScrollView>

        {/* MODAL IZIN DATA (Tracking Consent - Permintaan Dosen) */}
        <Modal visible={showConsent} transparent={true} animationType="slide">
            <View style={styles.modalOverlay}>
            <View style={styles.consentBox}>
                <Text style={styles.consentTitle}>🍪 IZIN DATA CLIENT</Text>
                <Text style={styles.consentText}>
                Aplikasi ini akan menyimpan data sesi dan preferensi pada penyimpanan lokal perangkat Anda demi keamanan transmisi data.
                </Text>
                <BrutalistButton label="SAYA SETUJU" onPress={() => setShowConsent(false)} />
            </View>
            </View>
        </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    scrollContent: { padding: 25, paddingTop: 60 },
    heroText: { fontSize: 48, fontWeight: '900', color: HappyHuesTheme.background },
    subText: { fontSize: 16, marginBottom: 30, color: HappyHuesTheme.paragraph },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    consentBox: { backgroundColor: 'white', padding: 30, borderTopWidth: 5, borderColor: HappyHuesTheme.stroke },
    consentTitle: { fontWeight: '900', fontSize: 18, marginBottom: 10 },
    consentText: { marginBottom: 20, lineHeight: 20 }
});