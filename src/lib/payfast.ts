/**
 * PayFast payment redirect for South African invoices.
 * See https://developers.payfast.co.za/
 */

function getBaseUrl(): string {
  const mode = process.env.PAYFAST_MODE ?? "sandbox";
  return mode === "live"
    ? "https://www.payfast.co.za/eng/process"
    : "https://sandbox.payfast.co.za/eng/process";
}

export function isPayFastConfigured(): boolean {
  return !!(
    process.env.PAYFAST_MERCHANT_ID &&
    process.env.PAYFAST_MERCHANT_KEY
  );
}

export type PayFastPaymentParams = {
  amount: number;
  itemName: string;
  itemDescription?: string;
  emailAddress: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  mPaymentId?: string; // Our reference (e.g. invoice id)
};

/**
 * Build the PayFast payment URL. Caller redirects user to this URL.
 */
export async function buildPayFastPaymentUrl(
  params: PayFastPaymentParams
): Promise<string> {
  const merchantId = process.env.PAYFAST_MERCHANT_ID;
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
  const passphrase = process.env.PAYFAST_PASSPHRASE ?? "";

  if (!merchantId || !merchantKey) {
    throw new Error("PayFast not configured");
  }

  const data: Record<string, string> = {
    merchant_id: merchantId,
    merchant_key: merchantKey,
    return_url: params.returnUrl,
    cancel_url: params.cancelUrl,
    notify_url: params.notifyUrl,
    name_first: params.itemName.slice(0, 100),
    email_address: params.emailAddress,
    m_payment_id: params.mPaymentId ?? "",
    amount: params.amount.toFixed(2),
    item_name: params.itemName,
  };
  if (params.itemDescription) {
    data.item_description = params.itemDescription;
  }

  // Remove empty values
  const filtered: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v != null && v !== "") filtered[k] = v;
  }

  // Create signature
  const pfParamString = Object.keys(filtered)
    .sort()
    .map((k) => `${k}=${encodeURIComponent(filtered[k]).replace(/%20/g, "+")}`)
    .join("&");

  const signature =
    passphrase !== ""
      ? `${pfParamString}&passphrase=${encodeURIComponent(passphrase)}`
      : pfParamString;

  const crypto = await import("crypto");
  const md5 = crypto.createHash("md5").update(signature).digest("hex");

  const query = new URLSearchParams({ ...filtered, signature: md5 });
  return `${getBaseUrl()}?${query.toString()}`;
}
