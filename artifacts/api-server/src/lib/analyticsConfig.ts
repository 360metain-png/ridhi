/**
 * Analytics Provider Configuration — runtime configurable via Super Admin
 *
 * Supports Google Analytics 4 and Facebook Pixel.
 * Config is stored in-memory with audit trail.
 * Super Admin changes it via POST /api/admin/analytics-config.
 */

export interface AnalyticsConfig {
  googleAnalytics: {
    enabled: boolean;
    measurementId: string;
    apiSecret: string;
  };
  facebookPixel: {
    enabled: boolean;
    pixelId: string;
    accessToken: string;
  };
  lastChangedAt: string;
  changedBy: string;
}

const DEFAULT: AnalyticsConfig = {
  googleAnalytics: {
    enabled: false,
    measurementId: "",
    apiSecret: "",
  },
  facebookPixel: {
    enabled: false,
    pixelId: "",
    accessToken: "",
  },
  lastChangedAt: new Date().toISOString(),
  changedBy: "system",
};

let config: AnalyticsConfig = structuredClone(DEFAULT);

export function getAnalyticsConfig(): AnalyticsConfig {
  return structuredClone(config);
}

export function setAnalyticsConfig(
  updates: Partial<AnalyticsConfig>,
  changedBy: string,
): void {
  config = {
    ...config,
    ...updates,
    googleAnalytics: {
      ...config.googleAnalytics,
      ...(updates.googleAnalytics || {}),
    },
    facebookPixel: {
      ...config.facebookPixel,
      ...(updates.facebookPixel || {}),
    },
    lastChangedAt: new Date().toISOString(),
    changedBy,
  };
}

export function isAnalyticsConfigured(): boolean {
  return (
    (config.googleAnalytics.enabled && !!config.googleAnalytics.measurementId) ||
    (config.facebookPixel.enabled && !!config.facebookPixel.pixelId)
  );
}
