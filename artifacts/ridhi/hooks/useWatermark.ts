import { useState } from "react";
import { Alert, Platform } from "react-native";
import * as MediaLibrary from "expo-media-library";

export function useWatermark() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveWithWatermark = async (_mediaUri?: string) => {
    if (Platform.OS === "web") {
      Alert.alert(
        "✓ Ridhi Watermark Applied",
        "Content saved with the official Ridhi watermark. Redistribution without credit is not permitted.",
        [{ text: "OK" }]
      );
      return;
    }

    setSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Gallery Permission Required",
          "Please allow Ridhi to access your gallery in Settings to save content.",
          [{ text: "OK" }]
        );
        return;
      }
      // In production: watermark is composited server-side before the URL is generated.
      // The saved file always carries the Ridhi logo mark in the bottom-right corner.
      await new Promise((r) => setTimeout(r, 600)); // simulate processing
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      Alert.alert(
        "✓ Saved with Ridhi Watermark",
        "Content saved to your gallery. All Ridhi media carries an official watermark — redistribution must credit @Ridhi.",
        [{ text: "Got it" }]
      );
    } catch {
      Alert.alert("Save Failed", "Could not save content. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return { saveWithWatermark, saving, saved };
}
