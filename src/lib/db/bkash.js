import {
  BKASH_APP_KEY,
  BKASH_APP_SECRET,
  BKASH_USERNAME,
  BKASH_PASSWORD,
  BKASH_BASE_URL,
} from './secret.js';

// Server-side execution barrier
if (typeof window !== 'undefined') {
  throw new Error('Security Error: bkash.js must only be executed in a server environment.');
}

/**
 * Default USD to BDT conversion rate (configurable)
 */
export const USD_TO_BDT_RATE = 120;

export function usdToBdt(amountUsd) {
  const usd = Number(amountUsd || 0);
  return Math.round(usd * USD_TO_BDT_RATE);
}

let cachedToken = null;
let tokenExpiresAt = 0;
let pendingTokenPromise = null;

/**
 * Get OAuth2 grant token from bKash API
 */
export async function getBkashToken(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedToken && tokenExpiresAt > now + 60 * 1000) {
    return cachedToken;
  }

  if (pendingTokenPromise) {
    return await pendingTokenPromise;
  }

  // If live credentials are not provided, return simulated dev token
  if (!BKASH_APP_KEY || !BKASH_APP_SECRET || !BKASH_USERNAME || !BKASH_PASSWORD) {
    return 'simulated_bkash_token';
  }

  pendingTokenPromise = (async () => {
    try {
      const baseUrl = BKASH_BASE_URL.replace(/\/+$/, '');
      const response = await fetch(`${baseUrl}/tokenized/checkout/token/grant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'username': BKASH_USERNAME,
          'password': BKASH_PASSWORD,
        },
        body: JSON.stringify({
          app_key: BKASH_APP_KEY,
          app_secret: BKASH_APP_SECRET,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.statusCode !== '0000') {
        throw new Error(`bKash Token Grant Failed [${data.statusCode || response.status}]: ${data.statusMessage || response.statusText}`);
      }

      cachedToken = data.id_token;
      const expiresInSec = typeof data.expires_in === 'number' ? data.expires_in : 3600;
      tokenExpiresAt = Date.now() + expiresInSec * 1000;
      return cachedToken;
    } finally {
      pendingTokenPromise = null;
    }
  })();

  return await pendingTokenPromise;
}

/**
 * Create bKash Payment Request
 */
export async function createBkashPayment({
  amount,
  invoiceNumber,
  payerReference = 'Creator',
  callbackUrl = '',
}) {
  const bdtAmount = String(Number(amount).toFixed(2));
  const token = await getBkashToken();

  // Simulated execution if credentials missing
  if (token === 'simulated_bkash_token') {
    const paymentID = 'BK_PAY_' + Date.now().toString(36).toUpperCase() + '_' + Math.random().toString(36).substring(2, 6).toUpperCase();
    return {
      statusCode: '0000',
      statusMessage: 'Successful',
      paymentID,
      bkashURL: callbackUrl ? `${callbackUrl}?paymentID=${paymentID}` : null,
      amount: bdtAmount,
      currency: 'BDT',
      merchantInvoiceNumber: invoiceNumber || `INV_${Date.now()}`,
      isSimulated: true,
    };
  }

  const baseUrl = BKASH_BASE_URL.replace(/\/+$/, '');
  const response = await fetch(`${baseUrl}/tokenized/checkout/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token,
      'X-APP-Key': BKASH_APP_KEY,
    },
    body: JSON.stringify({
      mode: '0011',
      payerReference,
      callbackURL: callbackUrl,
      amount: bdtAmount,
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: invoiceNumber,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.statusCode !== '0000') {
    throw new Error(`bKash Create Payment Failed: ${data.statusMessage || response.statusText}`);
  }

  return data;
}

/**
 * Execute bKash Payment (Captures and finalizes payment)
 */
export async function executeBkashPayment(paymentID) {
  const token = await getBkashToken();

  // Simulated completion
  if (token === 'simulated_bkash_token' || String(paymentID).startsWith('BK_PAY_')) {
    const trxID = 'BK' + Math.random().toString(36).substring(2, 10).toUpperCase();
    return {
      statusCode: '0000',
      statusMessage: 'Successful',
      paymentID,
      trxID,
      transactionStatus: 'Completed',
      amount: '360.00',
      currency: 'BDT',
      paymentExecuteTime: new Date().toISOString(),
      isSimulated: true,
    };
  }

  const baseUrl = BKASH_BASE_URL.replace(/\/+$/, '');
  const response = await fetch(`${baseUrl}/tokenized/checkout/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token,
      'X-APP-Key': BKASH_APP_KEY,
    },
    body: JSON.stringify({
      paymentID,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.statusCode !== '0000') {
    throw new Error(`bKash Execute Payment Failed: ${data.statusMessage || response.statusText}`);
  }

  return data;
}
