import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { HappyHuesTheme } from '../Constants/Theme';
import { BrutalistCard, BrutalistButton } from '../Components/Brutalist';
import { handleLogout } from '../Services/HandleLogOut';

// TAMBAHKAN { onLogout } di parameter fungsi ini
export function DashboardSiswa({ onLogout }) { 
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.welcomeBox}>
                <Text style={styles.roleText}>SISWA SEBEL</Text>
                <Text style={styles.welcomeText}>Selamat Datang!</Text>
            </View>

            <View style={styles.grid}>
                <BrutalistCard title="Nilai Rata-Rata">
                    <Text style={styles.statValue}>88.5</Text>
                </BrutalistCard>
                
                <BrutalistCard title="Peringkat">
                    <Text style={styles.statValue}>#04</Text>
                </BrutalistCard>
            </View>

            <BrutalistButton label="Lihat Jadwal Hari Ini" onPress={() => {}} />
            
            {/* UBAH onPress ini agar mengirimkan fungsi onLogout */}
            <BrutalistButton 
                label="LOGOUT" 
                type="secondary" 
                onPress={() => handleLogout(onLogout)} 
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e8e4e1' },
    content: { padding: 20 },
    welcomeBox: { marginBottom: 30 },
    roleText: { color: HappyHuesTheme.secondary, fontWeight: 'bold', textTransform: 'uppercase' },
    welcomeText: { fontSize: 32, fontWeight: '900', color: HappyHuesTheme.background },
    grid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    statValue: { fontSize: 36, fontWeight: '900', color: HappyHuesTheme.background }
});