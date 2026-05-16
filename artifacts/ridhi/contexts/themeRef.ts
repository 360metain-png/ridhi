import { createRef } from "react";

// A plain ref that AppContext writes to on every render so useColors
// can read the resolved theme without creating a circular dependency.
export const activeThemeRef = { current: "light" as "light" | "dark" };
