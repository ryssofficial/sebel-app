import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';

// Import Halaman Utama
import { LandingPage } from './src/Screens/LandingPage';
import { AuthPage } from './src/Screens/AuthPage';
import DashboardPage from './src/Screens/DashboardPage';
import { NotifikasiPage } from './src/Screens/NotifikasiPage';

// Import Fitur Muadz
import AbsensiFitur from './src/Screens/AbsensiFitur';
import NilaiTugasFitur from './src/Screens/NilaiTugasFitur';

const Stack = createStackNavigator();

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      let token, role;
      try {
        token = await SecureStore.getItemAsync('sebel_session');
        role = await SecureStore.getItemAsync('sebel_role');
      } catch (e) {
        console.log("Gagal restore session");
      }
      setUserToken(token);
      setUserRole(role);
      setIsLoading(false);
    };
    bootstrapAsync();
  }, []);

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          <>
            <Stack.Screen name="Landing" component={LandingPage} />
            <Stack.Screen name="Login">
              {(props) => (
                <AuthPage
                  {...props}
                  onLoginSuccess={(token, role) => {
                    setUserToken(token);
                    setUserRole(role);
                  }}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="MainApp">
              {(props) => (
                <DashboardPage
                  {...props}
                  currentRole={userRole}
                  onLogout={() => {
                    setUserToken(null);
                    setUserRole(null);
                  }}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Notifikasi" component={NotifikasiPage} />

            {/* ── Fitur Muadz ── */}
            <Stack.Screen
              name="Absensi"
              component={AbsensiFitur}
              options={{ headerShown: true, title: 'Data Presensi' }}
            />
            <Stack.Screen
              name="NilaiTugas"
              component={NilaiTugasFitur}
              options={{ headerShown: true, title: 'Nilai Tugas' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}