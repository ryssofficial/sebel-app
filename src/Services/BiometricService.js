// src/Services/BiometricService.js
import * as LocalAuthentication from 'expo-local-authentication';

export const BiometricService = {
    checkHardware: async () => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        return hasHardware && isEnrolled;
    },
    authenticate: async () => {
        const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autentikasi Biometrik SEBEL',
        fallbackLabel: 'Gunakan PIN',
        });
        return result.success;
    }
};