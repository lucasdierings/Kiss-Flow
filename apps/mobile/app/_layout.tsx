import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/components/useColorScheme';
import { AppProvider } from '@/context/AppContext';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    async function checkConsent() {
      try {
        const consent = await AsyncStorage.getItem('lgpd_consent');
        if (consent === 'true') {
          setIsFirstLaunch(false);
        } else {
          setIsFirstLaunch(true);
        }

        const session = await AsyncStorage.getItem('user_session');
        setIsAuthenticated(!!session);
      } catch (err) {
        setIsFirstLaunch(true);
        setIsAuthenticated(false);
      }
    }
    checkConsent();
  }, []);

  useEffect(() => {
    if (loaded && isFirstLaunch !== null && isAuthenticated !== null) {
      SplashScreen.hideAsync();
      if (isFirstLaunch) {
        router.replace('/onboarding');
      } else if (!isAuthenticated) {
        router.replace('/login');
      }
    }
  }, [loaded, isFirstLaunch, isAuthenticated]);

  if (!loaded || isFirstLaunch === null || isAuthenticated === null) {
    return null;
  }

  return (
    <AppProvider>
      <RootLayoutNav />
    </AppProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="terms" options={{ presentation: 'modal' }} />
        <Stack.Screen name="privacy" options={{ presentation: 'modal' }} />
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
