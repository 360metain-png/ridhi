/**
 * useAnalyticsConfig — reads server-side analytics provider config
 *
 * GET /api/analytics-config returns:
 *   { googleAnalytics: { enabled, measurementId }, facebookPixel: { enabled, pixelId } }
 *
 * The mobile app can use this to decide whether to initialize gtag / fbq.
 */

import { useState, useEffect } from "react";
import { apiFetch } from "@/utils/api";

export interface AnalyticsConfig {
  googleAnalytics: {
    enabled: boolean;
    measurementId: string;
  };
  facebookPixel: {
    enabled: boolean;
    pixelId: string;
  };
}

const DEFAULT: AnalyticsConfig = {
  googleAnalytics: { enabled: false, measurementId: "" },
  facebookPixel: { enabled: false, pixelId: "" },
};

export function useAnalyticsConfig() {
  const [config, setConfig] = useState<AnalyticsConfig>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch<AnalyticsConfig>("/api/analytics-config");
        setConfig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics config");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { config, loading, error };
}
