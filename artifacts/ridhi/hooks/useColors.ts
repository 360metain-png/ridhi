import { useColorScheme } from "react-native";
import colors from "@/constants/colors";

/**
 * Returns design tokens for the currently active theme (light/dark).
 * AppContext calls Appearance.setColorScheme() when the user picks a theme,
 * which makes useColorScheme() re-render with the correct value automatically.
 */
export function useColors() {
  const scheme = useColorScheme();
  const palette =
    scheme === "dark" && "dark" in colors
      ? (colors as Record<string, typeof colors.light>).dark
      : colors.light;
  return { ...palette, radius: colors.radius };
}
