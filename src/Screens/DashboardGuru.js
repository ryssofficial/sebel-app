import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { HappyHuesTheme } from '../Constants/Theme';
import { BrutalistCard, BrutalistButton } from '../Components/Brutalist';

export function DashboardGuru() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.welcomeBox}>
                <Text style={styles.roleText}>PORTAL GURU SEBEL</Text>
                <Text style={styles.welcomeText}>Halo, Pengajar!</Text>
            </View>

            <View style={styles.grid}>
                <BrutalistCard title="Total Kelas">
                    <Text style={styles.statValue}>12</Text>
                </BrutalistCard>
                
                <BrutalistCard title="Input Nilai">
                    <Text style={styles.statValue}>85%</Text>
                </BrutalistCard>
            </View>

            <BrutalistButton label="Mulai Presensi Kelas" onPress={() => {}} />
            <BrutalistButton label="Rekap Laporan" type="secondary" onPress={() => {}} />
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