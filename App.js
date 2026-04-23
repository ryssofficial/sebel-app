import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';

import { LandingPage } from './src/Screens/LandingPage';
import { AuthPage } from './src/Screens/AuthPage';
import { DashboardSiswa } from './src/Screens/DashboardSiswa';
import { DashboardGuru } from './src/Screens/DashboardGuru'; // Pastikan file ini ada nanti

const Stack = createStackNavigator();

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null); // Tambahkan state Role
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
          // JALUR PRIVATE BERDASARKAN ROLE
          <Stack.Screen name="MainApp">
            {(props) => (
              userRole === 'Guru' ? 
              <DashboardGuru {...props} onLogout={() => { setUserToken(null); setUserRole(null); }} /> : 
              <DashboardSiswa {...props} onLogout={() => { setUserToken(null); setUserRole(null); }} />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}