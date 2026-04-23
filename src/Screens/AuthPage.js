import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { HappyHuesTheme } from '../Constants/Theme';
import { BrutalistButton } from '../Components/Brutalist';

export function AuthPage({ onLoginSuccess }) {
    const [id, setId] = useState('');
    const [pass, setPass] = useState('');

    const handleAuth = async () => {
        if (!id || !pass) return Alert.alert("Error", "Isi identitas & password!");

        // SIMULASI LOGIKA ROLE (Nanti sesuaikan dengan response API)
        // Jika ID mengandung "guru" maka login sebagai Guru, selain itu Siswa
        const detectedRole = id.toLowerCase().includes('guru') ? 'Guru' : 'Siswa';
        
        const loginValid = true; // Anggap sukses

        if (loginValid) {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (hasHardware && isEnrolled) {
                const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: `Konfirmasi Login ${detectedRole}`,
                });
                if (!result.success) return Alert.alert("Gagal", "Biometrik tidak cocok!");
            }

            const dummyToken = "TOKEN_JWT_DARI_SERVER"; 
            
            // SIMPAN TOKEN & ROLE KE SECURE STORAGE
            await SecureStore.setItemAsync('sebel_session', dummyToken);
            await SecureStore.setItemAsync('sebel_role', detectedRole);
            
            // KIRIM KE APP.JS
            onLoginSuccess(dummyToken, detectedRole);
        }
    };

    return (
        <View style={styles.container}>
        <Text style={styles.title}>LOGIN SEBEL</Text>
        <TextInput 
            style={styles.input} 
            placeholder="NIS / Email" 
            onChangeText={setId} 
        />
        <TextInput 
            style={styles.input} 
            placeholder="Password" 
            secureTextEntry 
            onChangeText={setPass} 
        />
        <BrutalistButton label="VERIFIKASI & MASUK" onPress={handleAuth} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#e8e4e1' },
    title: { fontSize: 32, fontWeight: '900', marginBottom: 40, textAlign: 'center' },
    input: { 
        backgroundColor: 'white', 
        borderWidth: 3, 
        borderColor: HappyHuesTheme.stroke, 
        padding: 15, 
        marginBottom: 20, 
        fontWeight: 'bold' 
    }
});