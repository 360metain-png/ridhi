import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="wallet" options={{ presentation: "card" }} />
      <Stack.Screen name="notifications" options={{ presentation: "card" }} />
      <Stack.Screen name="chat" />
      <Stack.Screen name="explore" options={{ presentation: "card" }} />
      <Stack.Screen name="communities" options={{ presentation: "card" }} />
      <Stack.Screen name="settings" options={{ presentation: "card" }} />
      <Stack.Screen name="creator-dashboard" options={{ presentation: "card" }} />
      <Stack.Screen name="create-post" options={{ presentation: "modal" }} />
      <Stack.Screen name="random-call" options={{ presentation: "card" }} />
      <Stack.Screen name="live-stream" options={{ presentation: "card" }} />
      <Stack.Screen name="leaderboard" options={{ presentation: "card" }} />
      <Stack.Screen name="referral" options={{ presentation: "card" }} />
      <Stack.Screen name="audio-room" options={{ presentation: "card" }} />
      <Stack.Screen name="story-viewer" options={{ presentation: "modal" }} />
      <Stack.Screen name="group-chat" options={{ presentation: "card" }} />
      <Stack.Screen name="subscription" options={{ presentation: "card" }} />
      <Stack.Screen name="pk-battle" options={{ presentation: "card" }} />
      <Stack.Screen name="agent-dashboard" options={{ presentation: "card" }} />
      <Stack.Screen name="host-profile" options={{ presentation: "card" }} />
      <Stack.Screen name="games" options={{ presentation: "card" }} />
      <Stack.Screen name="game-room" options={{ presentation: "card" }} />
      <Stack.Screen name="tournaments" options={{ presentation: "card" }} />
      <Stack.Screen name="ads-create" options={{ presentation: "card" }} />
      <Stack.Screen name="ads-manager" options={{ presentation: "card" }} />
      <Stack.Screen name="ai-assistant" options={{ presentation: "card" }} />
      <Stack.Screen name="chatrooms" options={{ presentation: "card" }} />
      <Stack.Screen name="kyc" options={{ presentation: "card" }} />
      <Stack.Screen name="withdraw" options={{ presentation: "card" }} />
      <Stack.Screen name="jobs" options={{ presentation: "card" }} />
      <Stack.Screen name="jobs-post" options={{ presentation: "card" }} />
      <Stack.Screen name="help-support" options={{ presentation: "card" }} />
      <Stack.Screen name="about" options={{ presentation: "card" }} />
      <Stack.Screen name="terms" options={{ presentation: "card" }} />
      <Stack.Screen name="privacy-policy" options={{ presentation: "card" }} />
      <Stack.Screen name="lead-form-builder" options={{ presentation: "card" }} />
      <Stack.Screen name="lead-form-fill" options={{ presentation: "card" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </QueryClientProvider>
          </AuthProvider>
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
