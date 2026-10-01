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

/**
 * Check if live or sandbox bKash API credentials are configured in environment
 */
export function isBkashConfigured() {
  return Boolean(
    BKASH_APP_KEY &&
    BKASH_APP_SECRET &&
    BKASH_USERNAME &&
    BKASH_PASSWORD &&
    BKASH_BASE_URL
  );
}

/**
 * Validate Bangladeshi mobile number format
 * bKash operates on 11-digit numbers starting with 013-019:
 * 017, 013: Grameenphone
 * 019, 014: Banglalink
 * 018: Robi
 * 016: Airtel
 * 015: Teletalk
 */
export function validateBangladeshiMobile(phoneNumber) {
  const clean = String(phoneNumber || '').replace(/\D/g, '');
  // Normalize if +880 or 880 prefix was entered
  let normalized = clean;
  if (normalized.startsWith('880')) {
    normalized = normalized.slice(2);
  }

  const isValid = /^01[3-9]\d{8}$/.test(normalized);
  let operator = 'Unknown';
  if (isValid) {
    const prefix = normalized.slice(0, 3);
    if (prefix === '017' || prefix === '013') operator = 'Grameenphone';
    else if (prefix === '019' || prefix === '014') operator = 'Banglalink';
    else if (prefix === '018') operator = 'Robi';
    else if (prefix === '016') operator = 'Airtel';
    else if (prefix === '015') operator = 'Teletalk';
  }

  return {
    isValid,
    number: normalized,
    operator,
    masked: isValid ? `${normalized.slice(0, 3)}****${normalized.slice(7)}` : '',
  };
}

/**
 * Validate bKash 6-digit verification code (OTP)
 */
export function validateBkashOtp(otp) {
  const clean = String(otp || '').trim();
  return /^\d{6}$/.test(clean);
}

/**
 * Validate bKash 5-digit account PIN
 */
export function validateBkashPin(pin) {
  const clean = String(pin || '').trim();
  return /^\d{5}$/.test(clean);
}

// In-memory token cache
let cachedToken = null;
let cachedRefreshToken = null;
let tokenExpiresAt = 0;
let pendingTokenPromise = null;

/**
 * Get OAuth2 grant token from bKash Tokenized Checkout API
 */
export async function getBkashToken(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedToken && tokenExpiresAt > now + 60 * 1000) {
    return cachedToken;
  }

  if (pendingTokenPromise) {
    return await pendingTokenPromise;
  }

  // If live credentials are not configured, return simulated token
  if (!isBkashConfigured()) {
    cachedToken = 'simulated_bkash_token';
    tokenExpiresAt = Date.now() + 3600 * 1000;
    return cachedToken;
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
        const errorMsg = data.statusMessage || response.statusText || 'Token grant failed';
        throw new Error(`bKash Token Grant Failed [${data.statusCode || response.status}]: ${errorMsg}`);
      }

      cachedToken = data.id_token;
      cachedRefreshToken = data.refresh_token || null;
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
 * Refresh OAuth2 token from bKash API
 */
export async function refreshBkashToken() {
  if (!isBkashConfigured() || !cachedRefreshToken) {
    return await getBkashToken(true);
  }

  try {
    const baseUrl = BKASH_BASE_URL.replace(/\/+$/, '');
    const response = await fetch(`${baseUrl}/tokenized/checkout/token/refresh`, {
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
        refresh_token: cachedRefreshToken,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.statusCode !== '0000') {
      return await getBkashToken(true);
    }

    cachedToken = data.id_token;
    if (data.refresh_token) cachedRefreshToken = data.refresh_token;
    const expiresInSec = typeof data.expires_in === 'number' ? data.expires_in : 3600;
    tokenExpiresAt = Date.now() + expiresInSec * 1000;
    return cachedToken;
  } catch (err) {
    console.warn('bKash token refresh warning, falling back to full grant:', err.message);
    return await getBkashToken(true);
  }
}

/**
 * Create bKash Payment Request
 * @param {Object} params
 * @param {number|string} params.amount - Total BDT amount
 * @param {string} params.invoiceNumber - Merchant invoice / reference
 * @param {string} [params.payerReference] - Customer / Creator identifier
 * @param {string} [params.callbackUrl] - Callback URL upon completion
 */
export async function createBkashPayment({
  amount,
  invoiceNumber,
  payerReference = 'Creator',
  callbackUrl = '',
}) {
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    throw new Error('bKash create payment failed: Invalid amount. Must be greater than 0 BDT.');
  }

  const bdtAmount = String(numericAmount.toFixed(2));
  const token = await getBkashToken();

  // Simulated execution if credentials missing
  if (token === 'simulated_bkash_token' || !isBkashConfigured()) {
    const paymentID = 'BK_PAY_' + Date.now().toString(36).toUpperCase() + '_' + Math.random().toString(36).substring(2, 7).toUpperCase();
    return {
      statusCode: '0000',
      statusMessage: 'Successful',
      paymentID,
      bkashURL: callbackUrl ? `${callbackUrl}?paymentID=${paymentID}&status=success` : null,
      amount: bdtAmount,
      currency: 'BDT',
      merchantInvoiceNumber: invoiceNumber || `INV_${Date.now()}`,
      intent: 'sale',
      transactionStatus: 'Initiated',
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
      payerReference: String(payerReference).slice(0, 50),
      callbackURL: callbackUrl,
      amount: bdtAmount,
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: String(invoiceNumber).slice(0, 50),
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.statusCode !== '0000') {
    const errorMsg = data.statusMessage || response.statusText || 'Payment creation failed';
    throw new Error(`bKash Create Payment Failed [${data.statusCode || response.status}]: ${errorMsg}`);
  }

  return {
    ...data,
    isSimulated: false,
  };
}

/**
 * Execute bKash Payment (Captures, debits customer, and finalizes payment)
 * @param {string} paymentID - Payment ID obtained from createBkashPayment
 * @param {Object} [options]
 * @param {number|string} [options.expectedAmount] - Expected amount in BDT for validation
 * @param {string} [options.customerMsisdn] - Customer's mobile number
 * @param {string} [options.invoiceNumber] - Merchant invoice number
 */
export async function executeBkashPayment(paymentID, options = {}) {
  if (!paymentID) {
    throw new Error('bKash execute payment failed: Missing paymentID.');
  }

  const token = await getBkashToken();
  const expectedAmountFormatted = options.expectedAmount
    ? String(Number(options.expectedAmount).toFixed(2))
    : '300.00';

  // Simulated completion
  if (token === 'simulated_bkash_token' || !isBkashConfigured() || String(paymentID).startsWith('BK_PAY_')) {
    const trxID = 'BK' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    return {
      statusCode: '0000',
      statusMessage: 'Successful',
      paymentID,
      trxID,
      transactionStatus: 'Completed',
      amount: expectedAmountFormatted,
      currency: 'BDT',
      customerMsisdn: options.customerMsisdn || '01700000000',
      merchantInvoiceNumber: options.invoiceNumber || `INV_${Date.now()}`,
      payerReference: options.customerMsisdn || 'Creator',
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
    const errorMsg = data.statusMessage || response.statusText || 'Payment execution failed';
    throw new Error(`bKash Execute Payment Failed [${data.statusCode || response.status}]: ${errorMsg}`);
  }

  return {
    ...data,
    isSimulated: false,
  };
}

/**
 * Query bKash Payment Status
 * @param {string} paymentID - The bKash payment ID
 */
export async function queryBkashPayment(paymentID) {
  if (!paymentID) throw new Error('Payment ID is required to query status');
  const token = await getBkashToken();

  if (token === 'simulated_bkash_token' || !isBkashConfigured() || String(paymentID).startsWith('BK_PAY_')) {
    return {
      statusCode: '0000',
      statusMessage: 'Successful',
      paymentID,
      transactionStatus: 'Completed',
      amount: '300.00',
      currency: 'BDT',
      isSimulated: true,
    };
  }

  const baseUrl = BKASH_BASE_URL.replace(/\/+$/, '');
  const response = await fetch(`${baseUrl}/tokenized/checkout/payment/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token,
      'X-APP-Key': BKASH_APP_KEY,
    },
    body: JSON.stringify({ paymentID }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.statusCode !== '0000') {
    throw new Error(`bKash Query Payment Failed: ${data.statusMessage || response.statusText}`);
  }

  return data;
}

/**
 * Search Transaction by bKash trxID
 * @param {string} trxID - bKash transaction ID (e.g. BKA1234567)
 */
export async function searchBkashTransaction(trxID) {
  if (!trxID) throw new Error('Transaction ID is required to search');
  const token = await getBkashToken();

  if (token === 'simulated_bkash_token' || !isBkashConfigured() || String(trxID).startsWith('BK')) {
    return {
      statusCode: '0000',
      statusMessage: 'Successful',
      trxID,
      transactionStatus: 'Completed',
      currency: 'BDT',
      isSimulated: true,
    };
  }

  const baseUrl = BKASH_BASE_URL.replace(/\/+$/, '');
  const response = await fetch(`${baseUrl}/tokenized/checkout/general/searchTransaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token,
      'X-APP-Key': BKASH_APP_KEY,
    },
    body: JSON.stringify({ trxID }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.statusCode !== '0000') {
    throw new Error(`bKash Search Transaction Failed: ${data.statusMessage || response.statusText}`);
  }

  return data;
}

/**
 * Refund a bKash Payment
 * @param {Object} params
 * @param {string} params.paymentID - The payment ID
 * @param {string} params.trxID - Original transaction ID
 * @param {number|string} params.amount - Refund amount in BDT
 * @param {string} [params.sku] - Product / package SKU
 * @param {string} [params.reason] - Reason for refund
 */
export async function refundBkashPayment({
  paymentID,
  trxID,
  amount,
  sku = 'Subscription',
  reason = 'Customer request',
}) {
  const token = await getBkashToken();
  const bdtAmount = String(Number(amount).toFixed(2));

  if (token === 'simulated_bkash_token' || !isBkashConfigured() || String(paymentID).startsWith('BK_PAY_')) {
    return {
      statusCode: '0000',
      statusMessage: 'Successful',
      originalTrxID: trxID,
      refundTrxID: 'BK_REF_' + Date.now().toString(36).toUpperCase(),
      transactionStatus: 'Completed',
      amount: bdtAmount,
      currency: 'BDT',
      isSimulated: true,
    };
  }

  const baseUrl = BKASH_BASE_URL.replace(/\/+$/, '');
  const response = await fetch(`${baseUrl}/tokenized/checkout/payment/refund`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token,
      'X-APP-Key': BKASH_APP_KEY,
    },
    body: JSON.stringify({
      paymentID,
      amount: bdtAmount,
      trxID,
      sku,
      reason,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.statusCode !== '0000') {
    throw new Error(`bKash Refund Failed: ${data.statusMessage || response.statusText}`);
  }

  return data;
}
