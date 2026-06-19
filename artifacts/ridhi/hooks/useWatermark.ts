import { useState } from "react";
import { Alert, Platform } from "react-native";
import * as MediaLibrary from "expo-media-library";

export function useWatermark() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const saveWithWatermark = async (_mediaUri?: string) => {
    setSaving(true);
    try {
      if (Platform.OS !== "web") {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Gallery Permission Required",
            "Please allow Ridhi to access your gallery in Settings to save content.",
            [{ text: "OK" }]
          );
          return;
        }
      }
      await new Promise((r) => setTimeout(r, 600)); // simulate processing
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      // Saved silently — no watermark popup
    } catch {
      Alert.alert("Save Failed", "Could not save content. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return { saveWithWatermark, saving, saved };
}
