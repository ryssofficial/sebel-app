// App.js
import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Import Halaman Utama
import { LandingPage } from './src/Screens/LandingPage';
import { AuthPage } from './src/Screens/AuthPage';
import DashboardPage from './src/Screens/DashboardPage'; 
import { NotifikasiPage } from './src/Screens/NotifikasiPage';

const Stack = createStackNavigator();

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    GoogleSignin.configure({
      webClientId: '62197177120-995s2a9411qjk2g2qjmoj9bl3b3f92sk.apps.googleusercontent.com', // 🌟 WAJIB DIISI
      offlineAccess: true,
    });
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
            {/* 🌟 Hapus initialParams di sini karena tidak reaktif */}
            <Stack.Screen name="MainApp">
              {(props) => (
                <DashboardPage 
                  {...props} 
                  currentRole={userRole} // 🌟 Lempar state role yang reaktif sebagai custom props
                  onLogout={() => { 
                    setUserToken(null); 
                    setUserRole(null); 
                  }} 
                />
              )}
            </Stack.Screen>
            
            <Stack.Screen name="Notifikasi" component={NotifikasiPage} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}