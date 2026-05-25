/**
 * Runtime payment provider configuration.
 * Super Admin can switch between: razorpay, cashfree, phonepe, instamojo.
 * Defaults to "razorpay".
 */

export type PaymentProvider = "razorpay" | "cashfree" | "phonepe" | "instamojo";

interface PaymentConfig {
  activeProvider: PaymentProvider;
  lastChangedAt: string;
  changedBy: string;
}

let config: PaymentConfig = {
  activeProvider: "razorpay",
  lastChangedAt: new Date().toISOString(),
  changedBy: "system",
};

/** Read the active payment provider configuration */
export function getPaymentConfig(): PaymentConfig {
  return { ...config };
}

/** Set the active payment provider (Super Admin) */
export function setPaymentProvider(
  provider: PaymentProvider,
  changedBy: string,
): void {
  config = {
    activeProvider: provider,
    lastChangedAt: new Date().toISOString(),
    changedBy,
  };
}

/** Check which providers are actually configured via env vars */
export function getProviderAvailability() {
  const rzKeyId     = process.env["RAZORPAY_KEY_ID"];
  const rzKeySecret = process.env["RAZORPAY_KEY_SECRET"];

  const cfClientId     = process.env["CASHFREE_CLIENT_ID"];
  const cfClientSecret = process.env["CASHFREE_CLIENT_SECRET"];

  const ppMerchantId = process.env["PHONEPE_MERCHANT_ID"];
  const ppSaltKey    = process.env["PHONEPE_SALT_KEY"];

  const ijApiKey    = process.env["INSTAMOJO_API_KEY"];
  const ijAuthToken = process.env["INSTAMOJO_AUTH_TOKEN"];

  return {
    razorpay: {
      available: !!(rzKeyId && rzKeySecret),
      configured: !!(rzKeyId && rzKeySecret),
    },
    cashfree: {
      available: !!(cfClientId && cfClientSecret),
      configured: !!(cfClientId && cfClientSecret),
    },
    phonepe: {
      available: !!(ppMerchantId && ppSaltKey),
      configured: !!(ppMerchantId && ppSaltKey),
    },
    instamojo: {
      available: !!(ijApiKey && ijAuthToken),
      configured: !!(ijApiKey && ijAuthToken),
    },
  };
}
