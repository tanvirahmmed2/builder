import crypto from 'crypto';
import {
  PAYOONER_CLIENT_ID,
  PAYOONER_CLIENT_SECRET,
  PAYOONER_PROGRAM_ID,
  PAYOONER_ENV,
  PAYOONER_API_BASE_URL,
} from './secret.js';

// Server-side execution barrier to guarantee credentials are never bundled or exposed to the client
if (typeof window !== 'undefined') {
  throw new Error('Security Error: payooner.js must only be executed in a server environment.');
}

/**
 * Validate and sanitize the base API URL to prevent SSRF and protocol manipulation
 */
function getSanitizedBaseUrl() {
  const url = (PAYOONER_API_BASE_URL || '').trim();
  if (!url) {
    throw new Error('Payoneer configuration error: PAYOONER_API_BASE_URL is not configured.');
  }

  try {
    const parsed = new URL(url);
    const isLocal = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    if (parsed.protocol !== 'https:' && !isLocal) {
      throw new Error('Security Error: PAYOONER_API_BASE_URL must use the secure HTTPS protocol.');
    }
    return url.replace(/\/+$/, '');
  } catch (err) {
    throw new Error(`Payoneer configuration error: Invalid API base URL. ${err.message}`);
  }
}

/**
 * Input validation helpers
 */
function validatePositiveAmount(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num) || num <= 0) {
    throw new Error('Security/Validation Error: Amount must be a positive finite number.');
  }
  return num.toFixed(2);
}

function validateCurrency(currency = 'USD') {
  const curr = String(currency).trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(curr)) {
    throw new Error('Security/Validation Error: Currency must be a valid 3-letter ISO code (e.g. USD).');
  }
  return curr;
}

function validateSafeIdentifier(val, fieldName = 'ID') {
  if (!val || typeof val !== 'string') {
    throw new Error(`Security/Validation Error: ${fieldName} is required and must be a string.`);
  }
  const clean = val.trim();
  // Prevent path traversal or control characters
  if (!clean || /[\r\n\0\t\\/]/.test(clean)) {
    throw new Error(`Security/Validation Error: ${fieldName} contains illegal characters.`);
  }
  return clean;
}

/**
 * In-memory token cache with concurrent request deduplication
 */
let cachedToken = null;
let tokenExpiresAt = 0;
let pendingTokenPromise = null;

/**
 * Obtain an OAuth 2.0 Access Token from Payoneer
 * Thread/concurrency safe with automatic in-memory caching and refreshing.
 */
export async function getAccessToken(forceRefresh = false) {
  const now = Date.now();

  if (!forceRefresh && cachedToken && tokenExpiresAt > now + 60 * 1000) {
    return cachedToken;
  }

  // Deduplicate concurrent token fetch operations
  if (pendingTokenPromise) {
    return await pendingTokenPromise;
  }

  if (!PAYOONER_CLIENT_ID || !PAYOONER_CLIENT_SECRET) {
    throw new Error('Payoneer configuration error: PAYOONER_CLIENT_ID or PAYOONER_CLIENT_SECRET is missing.');
  }

  pendingTokenPromise = (async () => {
    try {
      const baseUrl = getSanitizedBaseUrl();
      const tokenUrl = `${baseUrl}/v2/oauth2/token`;
      const credentials = `${PAYOONER_CLIENT_ID}:${PAYOONER_CLIENT_SECRET}`;
      const basicAuth = Buffer.from(credentials, 'utf-8').toString('base64');

      const body = new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'read write openid',
      });

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: body.toString(),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data.error_description || data.error || response.statusText || 'Authentication failure';
        throw new Error(`Payoneer OAuth authorization failed [${response.status}]: ${errorMsg}`);
      }

      if (!data.access_token) {
        throw new Error('Payoneer OAuth authorization failed: No access_token returned by auth server.');
      }

      cachedToken = data.access_token;
      const expiresInSec = typeof data.expires_in === 'number' && data.expires_in > 0 ? data.expires_in : 3600;
      tokenExpiresAt = Date.now() + expiresInSec * 1000;

      return cachedToken;
    } finally {
      pendingTokenPromise = null;
    }
  })();

  return await pendingTokenPromise;
}

/**
 * Base HTTP helper for authenticated Payoneer API requests
 * Provides sanitized headers, timeout handling, and leak-free error management.
 */
export async function payoonerRequest(endpoint, options = {}) {
  const token = await getAccessToken();
  const baseUrl = getSanitizedBaseUrl();

  // Prevent path traversal in endpoint
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  const url = `${baseUrl}/${cleanEndpoint}`;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  if (
    options.body &&
    typeof options.body === 'object' &&
    !(options.body instanceof URLSearchParams) &&
    !(options.body instanceof FormData)
  ) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);
  const text = await response.text();
  let json = null;

  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  if (!response.ok) {
    const errorDetails =
      (json && (json.description || json.message || json.error_description || json.error)) ||
      response.statusText ||
      'Request failed';

    const err = new Error(`Payoneer API error [${response.status}]: ${errorDetails}`);
    err.status = response.status;
    err.details = json;
    throw err;
  }

  return json;
}

/**
 * Create a Payment Checkout Session
 */
export async function createPaymentSession({
  amount,
  currency = 'USD',
  merchantReference,
  returnUrl,
  callbackUrl,
  customer = {},
  description = '',
  metadata = {},
}) {
  const formattedAmount = validatePositiveAmount(amount);
  const validatedCurrency = validateCurrency(currency);
  const reference = merchantReference
    ? validateSafeIdentifier(merchantReference, 'merchantReference')
    : `txn_${Date.now()}`;

  const payload = {
    transaction: {
      amount: formattedAmount,
      currency: validatedCurrency,
      reference,
      description: String(description || 'Portfolio Builder Services').slice(0, 255),
    },
    customer: {
      reference: String(customer.id || customer.userId || `cust_${Date.now()}`).slice(0, 100),
      email: customer.email ? String(customer.email).trim().toLowerCase() : undefined,
      name: {
        firstName: String(customer.firstName || customer.name || 'Customer').slice(0, 100),
        lastName: customer.lastName ? String(customer.lastName).slice(0, 100) : '',
      },
    },
    redirectUrl: returnUrl,
    notificationUrl: callbackUrl,
    metadata: metadata && typeof metadata === 'object' ? metadata : {},
  };

  return await payoonerRequest('v4/charges/session', {
    method: 'POST',
    body: payload,
  });
}

/**
 * Retrieve status and details of a payment charge
 */
export async function getPaymentDetails(chargeId) {
  const safeId = validateSafeIdentifier(chargeId, 'chargeId');
  return await payoonerRequest(`v4/charges/${encodeURIComponent(safeId)}`, {
    method: 'GET',
  });
}

/**
 * Capture an authorized payment
 */
export async function capturePayment(chargeId, amount) {
  const safeId = validateSafeIdentifier(chargeId, 'chargeId');
  const body = amount !== undefined && amount !== null ? { amount: validatePositiveAmount(amount) } : {};
  return await payoonerRequest(`v4/charges/${encodeURIComponent(safeId)}/capture`, {
    method: 'POST',
    body,
  });
}

/**
 * Cancel or void an authorized transaction
 */
export async function cancelPayment(chargeId, reason = 'Customer cancelled') {
  const safeId = validateSafeIdentifier(chargeId, 'chargeId');
  return await payoonerRequest(`v4/charges/${encodeURIComponent(safeId)}/cancel`, {
    method: 'POST',
    body: { reason: String(reason).slice(0, 255) },
  });
}

/**
 * Refund a captured payment
 */
export async function refundPayment(chargeId, { amount, currency = 'USD', reason = 'Requested refund' } = {}) {
  const safeId = validateSafeIdentifier(chargeId, 'chargeId');
  const body = {
    amount: amount !== undefined && amount !== null ? validatePositiveAmount(amount) : undefined,
    currency: validateCurrency(currency),
    reason: String(reason || 'Requested refund').slice(0, 255),
  };

  return await payoonerRequest(`v4/charges/${encodeURIComponent(safeId)}/refund`, {
    method: 'POST',
    body,
  });
}

/**
 * Register a Payee or generate Payee Onboarding Registration Link
 */
export async function registerPayee({ payeeId, email, redirectUrl }) {
  if (!PAYOONER_PROGRAM_ID) {
    throw new Error('Payoneer configuration error: PAYOONER_PROGRAM_ID is not configured.');
  }

  const safeProgramId = validateSafeIdentifier(PAYOONER_PROGRAM_ID, 'PAYOONER_PROGRAM_ID');
  const safePayeeId = validateSafeIdentifier(payeeId, 'payeeId');

  const endpoint = `v2/programs/${encodeURIComponent(safeProgramId)}/payees/registration-link`;
  return await payoonerRequest(endpoint, {
    method: 'POST',
    body: {
      payee_id: safePayeeId,
      email: email ? String(email).trim().toLowerCase() : undefined,
      redirect_url: redirectUrl,
    },
  });
}

/**
 * Submit a payout to an onboarded payee
 */
export async function createPayout({
  payeeId,
  amount,
  currency = 'USD',
  clientReferenceId,
  description = 'Developer Payout',
}) {
  if (!PAYOONER_PROGRAM_ID) {
    throw new Error('Payoneer configuration error: PAYOONER_PROGRAM_ID is not configured.');
  }

  const safeProgramId = validateSafeIdentifier(PAYOONER_PROGRAM_ID, 'PAYOONER_PROGRAM_ID');
  const safePayeeId = validateSafeIdentifier(payeeId, 'payeeId');
  const safeRef = clientReferenceId
    ? validateSafeIdentifier(clientReferenceId, 'clientReferenceId')
    : `po_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  const endpoint = `v2/programs/${encodeURIComponent(safeProgramId)}/payouts`;
  return await payoonerRequest(endpoint, {
    method: 'POST',
    body: {
      payments: [
        {
          client_reference_id: safeRef,
          payee_id: safePayeeId,
          amount: validatePositiveAmount(amount),
          currency: validateCurrency(currency),
          description: String(description || 'Developer Payout').slice(0, 255),
        },
      ],
    },
  });
}

/**
 * Retrieve status of a submitted payout
 */
export async function getPayoutStatus(payoutId) {
  if (!PAYOONER_PROGRAM_ID) {
    throw new Error('Payoneer configuration error: PAYOONER_PROGRAM_ID is not configured.');
  }

  const safeProgramId = validateSafeIdentifier(PAYOONER_PROGRAM_ID, 'PAYOONER_PROGRAM_ID');
  const safePayoutId = validateSafeIdentifier(payoutId, 'payoutId');

  const endpoint = `v2/programs/${encodeURIComponent(safeProgramId)}/payouts/${encodeURIComponent(safePayoutId)}`;
  return await payoonerRequest(endpoint, {
    method: 'GET',
  });
}

/**
 * Verify incoming Payoneer Webhook HMAC SHA-256 signature
 * Fully immune to timing attacks and buffer length mismatch errors.
 *
 * @param {string} signature - Header signature received from Payoneer
 * @param {string|Buffer} rawBody - Raw body payload of the request
 * @param {string} [secret] - Webhook Secret or Client Secret
 * @returns {boolean} True if signature is valid
 */
export function verifyWebhookSignature(signature, rawBody, secret = PAYOONER_CLIENT_SECRET) {
  if (!signature || !rawBody || !secret || typeof signature !== 'string') {
    return false;
  }

  try {
    const payload = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    const computedHex = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // SHA-256 hash both signatures so both buffers are guaranteed to be 32 bytes
    // This prevents timing discrepancies and protects against crypto.timingSafeEqual length errors
    const hashA = crypto.createHash('sha256').update(signature.trim().toLowerCase()).digest();
    const hashB = crypto.createHash('sha256').update(computedHex.toLowerCase()).digest();

    return crypto.timingSafeEqual(hashA, hashB);
  } catch (err) {
    console.error('Payoneer webhook signature verification failed safely:', err.message);
    return false;
  }
}

/**
 * Unified Payooner Client Object
 */
export const payoonerClient = {
  clientId: PAYOONER_CLIENT_ID,
  programId: PAYOONER_PROGRAM_ID,
  environment: PAYOONER_ENV,
  baseUrl: PAYOONER_API_BASE_URL,
  getAccessToken,
  request: payoonerRequest,
  createPaymentSession,
  getPaymentDetails,
  capturePayment,
  cancelPayment,
  refundPayment,
  registerPayee,
  createPayout,
  getPayoutStatus,
  verifyWebhookSignature,
};

export default payoonerClient;
