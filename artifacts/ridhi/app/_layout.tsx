import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Feather } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { SplashAnimation } from "@/components/SplashAnimation";

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
      <Stack.Screen name="call-persona" options={{ presentation: "card" }} />
      <Stack.Screen name="vibe-stars" options={{ presentation: "card" }} />
      <Stack.Screen name="creator-marketplace" options={{ presentation: "card" }} />
      <Stack.Screen name="brand-register" options={{ presentation: "card" }} />
      <Stack.Screen name="brand-post-deal" options={{ presentation: "card" }} />
      <Stack.Screen name="podcasts" options={{ presentation: "card" }} />
      <Stack.Screen name="podcast-create" options={{ presentation: "modal" }} />
      <Stack.Screen name="ai-assistant" options={{ presentation: "card" }} />
      <Stack.Screen name="chatrooms" options={{ presentation: "card" }} />
      <Stack.Screen name="kyc" options={{ presentation: "card" }} />
      <Stack.Screen name="withdraw" options={{ presentation: "card" }} />
      <Stack.Screen name="help-support" options={{ presentation: "card" }} />
      <Stack.Screen name="about" options={{ presentation: "card" }} />
      <Stack.Screen name="terms" options={{ presentation: "card" }} />
      <Stack.Screen name="privacy-policy" options={{ presentation: "card" }} />
      <Stack.Screen name="community-guidelines" options={{ presentation: "card" }} />
      <Stack.Screen name="lead-form-builder" options={{ presentation: "card" }} />
      <Stack.Screen name="lead-form-fill" options={{ presentation: "card" }} />
      <Stack.Screen name="coin-store" options={{ presentation: "card" }} />
      <Stack.Screen name="missions" options={{ presentation: "card" }} />
      <Stack.Screen name="scheduled-content" options={{ presentation: "card" }} />
      <Stack.Screen name="report-history" options={{ presentation: "card" }} />
      <Stack.Screen name="ads-manager" options={{ presentation: "card" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    // Explicitly preload the Feather icon font so icons never flash as boxes
    ...Feather.font,
  });

  const [splashDone, setSplashDone] = useState(false);
  const appReady = !!(fontsLoaded || fontError);

  // Hide the native splash once fonts are loaded; our custom animation handles the rest
  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync();
    }
  }, [appReady]);

  const handleAnimationComplete = useCallback(() => {
    setSplashDone(true);
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  {/* Always mount nav so it's ready behind the splash */}
                  {appReady && <RootLayoutNav />}

                  {/* Custom animated splash overlays until complete */}
                  {!splashDone && (
                    <SplashAnimation
                      isReady={appReady}
                      onAnimationComplete={handleAnimationComplete}
                    />
                  )}
                </KeyboardProvider>
              </GestureHandlerRootView>
            </QueryClientProvider>
          </AuthProvider>
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
