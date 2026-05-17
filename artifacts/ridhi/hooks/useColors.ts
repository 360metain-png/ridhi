import { useContext } from "react";
import { useColorScheme } from "react-native";
import colors from "@/constants/colors";
import { AppContext } from "@/contexts/AppContext";

/**
 * Returns design tokens for the currently active theme.
 * Prefers AppContext.activeTheme (which defaults to "dark" and handles
 * forced dark mode) over the OS-reported useColorScheme(), so the
 * premium black UI renders correctly even when the system scheme is light.
 */
export function useColors() {
  const systemScheme = useColorScheme();
  const appCtx = useContext(AppContext);

  const scheme: "light" | "dark" = appCtx
    ? appCtx.activeTheme
    : (systemScheme ?? "dark");

  const palette =
    scheme === "dark" && "dark" in colors
      ? (colors as Record<string, typeof colors.light>).dark
      : colors.light;

  return { ...palette, radius: colors.radius };
}
