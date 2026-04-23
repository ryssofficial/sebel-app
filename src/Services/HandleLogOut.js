import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

export const handleLogout = async (onLogoutReset) => {
    Alert.alert(
        "Logout",
        "Apakah Anda yakin ingin keluar?",
        [
            { text: "Batal", style: "cancel" },
            { 
                text: "Ya, Keluar", 
                onPress: async () => {
                    // 1. Hapus data di memori HP
                    await SecureStore.deleteItemAsync('sebel_session');
                    await SecureStore.deleteItemAsync('sebel_role');
                    
                    // 2. Panggil fungsi reset state di App.js agar layar berpindah
                    if (onLogoutReset) onLogoutReset(); 
                }
            }
        ]
    );
};