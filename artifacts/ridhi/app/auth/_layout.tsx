import { Stack } from "expo-router";
import { PrivateHead } from "@/components/PrivateHead";

export default function AuthLayout() {
  return (
    <>
      <PrivateHead />
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="profile-setup" />
      </Stack>
    </>
  );
}
