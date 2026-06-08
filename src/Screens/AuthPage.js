import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { HappyHuesTheme } from '../Constants/Theme';
import { BrutalistButton } from '../Components/Brutalist';
import { AxiosConfig } from '../Services/AxiosConfig'; 

export function AuthPage({ onLoginSuccess }) {
    const [id, setId] = useState('');
    const [pass, setPass] = useState('');
    const [isLoading, setIsLoading] = useState(false); 
    const [guruEmail, setGuruEmail] = useState('');
    const [guruPass, setGuruPass] = useState('');

    const handleGuruLoginManual = async () => {
        if (!guruEmail.trim() || !guruPass) {
            return Alert.alert("Error", "Isi Email dan Password!");
        }

        setIsLoading(true);
        try {
            // Panggil endpoint login manual guru yang sudah ada di GuruAuthController
            const response = await AxiosConfig.post('/auth/login/guru', { 
                identifier: guruEmail.trim(), 
                password: guruPass 
            });

            if (response.status === 200) {
                const token = response.data.token || response.data.data?.token;
                // Gunakan helper yang sudah Anda miliki untuk biometrik & session
                await handleSuccessSession(token, 'Guru');
            }
        } catch (error) {
            console.log("Error Guru Login:", error.response?.data);
            Alert.alert("Login Gagal", error.response?.data?.message || "Kredensial salah.");
        } finally {
            setIsLoading(false);
        }
    };

    // 🌟 FUNGSI KHUSUS LOGIN SISWA (MANUAL)
    const handleSiswaLogin = async () => {
        console.log("Data yang terbaca saat klik:", { nis: id, password: pass });
        if (!id.trim() || !pass) {
            return Alert.alert("Error", "Isi NIS dan Password!");
        }

        setIsLoading(true);
        try {
            const response = await AxiosConfig.post('/auth/login/siswa', { 
                identifier: id.trim(), // Backend mencari 'identifier'
                password: pass         // Backend mencari 'password'
            });

            if (response.status === 200) {
                // Ambil token dari response.data (sesuaikan struktur data backend kamu)
                const token = response.data.token || response.data.data?.token; 
                await handleSuccessSession(token, 'Siswa');
            } else {
                Alert.alert("Gagal", "Respon server tidak valid.");
            }
        } catch (error) {
            console.log("Error detail:", error.response?.data);
            Alert.alert("Koneksi Gagal", error.response?.data?.message || "Gangguan jaringan.");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper untuk memproses penyimpanan session & biometrik
    const handleSuccessSession = async (token, finalRole) => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && isEnrolled) {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: `Konfirmasi Biometrik Login ${finalRole}`,
                fallbackLabel: 'Gunakan Password Utama',
            });
            if (!result.success) {
                return Alert.alert("Gagal", "Autentikasi biometrik dibatalkan.");
            }
        }

        await SecureStore.setItemAsync('sebel_session', token);
        await SecureStore.setItemAsync('sebel_role', finalRole);
        onLoginSuccess(token, finalRole);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>LOGIN SEBEL</Text>
            
            {/* FORM LOGIN UNTUK SISWA */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>AREA SISWA</Text>
                        <TextInput 
                            style={styles.input} 
                            placeholder="Masukkan NIS Siswa" 
                            placeholderTextColor="#a09a96"
                            value={id}
                            onChangeText={(text) => setId(text)} // 🌟 Jadikan fungsi eksplisit
                            keyboardType="numeric"
                            editable={!isLoading} // 🌟 Ganti 'disabled' menjadi 'editable'
                        />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Masukkan Password Siswa" 
                            placeholderTextColor="#a09a96"
                            secureTextEntry 
                            value={pass}
                            onChangeText={(text) => setPass(text)} // 🌟 Jadikan fungsi eksplisit
                            autoCapitalize="none"
                            editable={!isLoading} // 🌟 Ganti 'disabled' menjadi 'editable'
                        />
                        {isLoading ? (
                            <ActivityIndicator size="small" color={HappyHuesTheme.stroke} />
                        ) : (
                            <BrutalistButton label="MASUK SEBAGAI SISWA" onPress={handleSiswaLogin} />
                        )}
                    </View>

                    <View style={styles.divider} />

                    {/* TOMBOL LOGIN UNTUK GURU */}
                    <View style={styles.section}>
                <Text style={styles.sectionTitle}>AREA GURU</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="Masukkan Email Guru" 
                    placeholderTextColor="#a09a96"
                    value={guruEmail}
                    onChangeText={setGuruEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                />
                <TextInput 
                    style={styles.input} 
                    placeholder="Masukkan Password" 
                    placeholderTextColor="#a09a96"
                    secureTextEntry 
                    value={guruPass}
                    onChangeText={setGuruPass}
                    autoCapitalize="none"
                    editable={!isLoading}
                />
                {isLoading ? (
                    <ActivityIndicator size="small" color={HappyHuesTheme.stroke} />
                ) : (
                    <BrutalistButton label="MASUK SEBAGAI GURU" onPress={handleGuruLoginManual} />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#e8e4e1' },
    title: { fontSize: 32, fontWeight: '900', marginBottom: 30, textAlign: 'center', color: HappyHuesTheme.stroke },
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 14, fontWeight: '900', marginBottom: 10, color: HappyHuesTheme.stroke },
    input: { backgroundColor: 'white', borderWidth: 3, borderColor: HappyHuesTheme.stroke, padding: 15, marginBottom: 15, fontWeight: 'bold' },
    divider: { height: 3, backgroundColor: HappyHuesTheme.stroke, marginVertical: 20 }
});