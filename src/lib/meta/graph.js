import crypto from 'crypto';
import {
  META_APP_ID,
  META_APP_SECRET,
  META_PAGE_ACCESS_TOKEN,
  META_PAGE_ID,
  META_INSTAGRAM_ACCOUNT_ID,
  META_WHATSAPP_TOKEN,
  META_WHATSAPP_PHONE_NUMBER_ID,
  META_WHATSAPP_BUSINESS_ACCOUNT_ID,
  META_WEBHOOK_VERIFY_TOKEN,
  META_GRAPH_VERSION,
} from '../db/secret.js';

// Server-side barrier to prevent leaking credentials to the client
if (typeof window !== 'undefined') {
  throw new Error('Security Error: Meta Graph API client must only execute on the server side.');
}

const GRAPH_BASE_URL = 'https://graph.facebook.com';

/**
 * Input sanitization & validation helpers
 */
function sanitizeRecipientId(id) {
  if (!id || typeof id !== 'string') {
    throw new Error('Validation Error: Recipient ID is required and must be a string.');
  }
  const clean = id.trim();
  // Alphanumeric, underscores, hyphens, and dots allowed
  if (!clean || !/^[a-zA-Z0-9_\.\-]+$/.test(clean) || clean.length > 255) {
    throw new Error('Security Error: Recipient ID contains invalid characters or exceeds 255 characters.');
  }
  return clean;
}

function sanitizePhoneNumber(phone) {
  if (!phone || (typeof phone !== 'string' && typeof phone !== 'number')) {
    throw new Error('Validation Error: Phone number is required.');
  }
  const clean = String(phone).replace(/\D/g, '');
  if (clean.length < 7 || clean.length > 16) {
    throw new Error('Security Error: Phone number must contain between 7 and 16 digits.');
  }
  return clean;
}

function sanitizeMessageText(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Validation Error: Message text is required.');
  }
  // Strip null bytes and control chars (except normal whitespace, newlines, tabs)
  const clean = text.replace(/[\0\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  if (!clean) {
    throw new Error('Validation Error: Message text cannot be empty.');
  }
  if (clean.length > 4096) {
    throw new Error('Validation Error: Message text exceeds maximum limit of 4096 characters.');
  }
  return clean;
}

function sanitizeMetaError(status, data, fallbackText) {
  const rawMsg = data?.error?.message || fallbackText || 'Meta Graph API request failed';
  // Strip any accidental tokens from error message
  const sanitized = String(rawMsg)
    .replace(/(access_token|secret|token)=([a-zA-Z0-9_\-\.]+)/gi, '$1=***')
    .replace(/(Bearer\s+)[a-zA-Z0-9_\-\.]+/gi, '$1***')
    .slice(0, 500);

  return new Error(`Meta Graph API error [${status}]: ${sanitized}`);
}

/**
 * Returns configuration status of each Meta channel
 */
export function getMetaConfigStatus() {
  const hasFb = Boolean(META_PAGE_ACCESS_TOKEN && META_PAGE_ID);
  const hasIg = Boolean(META_PAGE_ACCESS_TOKEN && META_INSTAGRAM_ACCOUNT_ID);
  const hasWa = Boolean(META_WHATSAPP_TOKEN && META_WHATSAPP_PHONE_NUMBER_ID);

  return {
    facebook: {
      configured: hasFb,
      pageId: META_PAGE_ID || null,
    },
    instagram: {
      configured: hasIg,
      accountId: META_INSTAGRAM_ACCOUNT_ID || null,
    },
    whatsapp: {
      configured: hasWa,
      phoneNumberId: META_WHATSAPP_PHONE_NUMBER_ID || null,
      businessAccountId: META_WHATSAPP_BUSINESS_ACCOUNT_ID || null,
    },
    webhookVerifyTokenConfigured: Boolean(META_WEBHOOK_VERIFY_TOKEN),
    appConfigured: Boolean(META_APP_ID && META_APP_SECRET),
    version: META_GRAPH_VERSION || 'v21.0',
  };
}

/**
 * Send a message to Facebook Messenger user
 * Transmits token via Authorization Header (not query params) to avoid log leakage
 */
export async function sendFacebookMessage({ recipientId, messageText }) {
  if (!META_PAGE_ACCESS_TOKEN) {
    throw new Error('Meta Graph API: META_PAGE_ACCESS_TOKEN is not configured.');
  }

  const safeRecipientId = sanitizeRecipientId(recipientId);
  const safeText = sanitizeMessageText(messageText);

  const version = META_GRAPH_VERSION || 'v21.0';
  const url = `${GRAPH_BASE_URL}/${version}/me/messages`;
  const payload = {
    recipient: { id: safeRecipientId },
    messaging_type: 'RESPONSE',
    message: { text: safeText },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${META_PAGE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw sanitizeMetaError(res.status, data, res.statusText);
  }

  return {
    success: true,
    recipientId: data.recipient_id,
    messageId: data.message_id,
  };
}

/**
 * Send a direct message to Instagram user
 * Transmits token via Authorization Header (not query params)
 */
export async function sendInstagramMessage({ recipientId, messageText }) {
  if (!META_PAGE_ACCESS_TOKEN) {
    throw new Error('Meta Graph API: META_PAGE_ACCESS_TOKEN is not configured for Instagram.');
  }

  const safeRecipientId = sanitizeRecipientId(recipientId);
  const safeText = sanitizeMessageText(messageText);

  const version = META_GRAPH_VERSION || 'v21.0';
  const url = `${GRAPH_BASE_URL}/${version}/me/messages`;
  const payload = {
    recipient: { id: safeRecipientId },
    message: { text: safeText },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${META_PAGE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw sanitizeMetaError(res.status, data, res.statusText);
  }

  return {
    success: true,
    recipientId: data.recipient_id,
    messageId: data.message_id,
  };
}

/**
 * Send a WhatsApp message via WhatsApp Cloud API
 */
export async function sendWhatsAppMessage({ toPhoneNumber, messageText }) {
  const token = META_WHATSAPP_TOKEN || META_PAGE_ACCESS_TOKEN;
  const phoneId = META_WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    throw new Error('WhatsApp Cloud API: META_WHATSAPP_TOKEN or META_WHATSAPP_PHONE_NUMBER_ID is not configured.');
  }

  const safePhone = sanitizePhoneNumber(toPhoneNumber);
  const safePhoneId = sanitizeRecipientId(phoneId);
  const safeText = sanitizeMessageText(messageText);

  const version = META_GRAPH_VERSION || 'v21.0';
  const url = `${GRAPH_BASE_URL}/${version}/${safePhoneId}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: safePhone,
    type: 'text',
    text: {
      preview_url: false,
      body: safeText,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw sanitizeMetaError(res.status, data, res.statusText);
  }

  return {
    success: true,
    messageId: data?.messages?.[0]?.id,
    contacts: data?.contacts,
  };
}

/**
 * Universal sender router based on platform
 */
export async function sendPlatformMessage(platform, { recipientId, toPhoneNumber, messageText }) {
  const p = String(platform).toLowerCase().trim();
  if (p === 'facebook') {
    return await sendFacebookMessage({ recipientId, messageText });
  } else if (p === 'instagram') {
    return await sendInstagramMessage({ recipientId, messageText });
  } else if (p === 'whatsapp') {
    return await sendWhatsAppMessage({ toPhoneNumber: toPhoneNumber || recipientId, messageText });
  } else {
    throw new Error(`Security Error: Unsupported Meta platform identifier: ${platform}`);
  }
}

/**
 * Verify Meta Webhook SHA-256 signature (X-Hub-Signature-256 header)
 * Robustly protected against timing attacks, format injection, and buffer mismatch.
 */
export function verifyMetaWebhookSignature(signature, rawBody, appSecret = META_APP_SECRET) {
  if (
    !signature ||
    !rawBody ||
    !appSecret ||
    typeof signature !== 'string' ||
    typeof appSecret !== 'string'
  ) {
    return false;
  }

  try {
    const rawSig = signature.trim();
    const hexMatch = rawSig.startsWith('sha256=') ? rawSig.slice(7).trim() : rawSig;

    // Must be valid 64-character hex
    if (!/^[a-fA-F0-9]{64}$/.test(hexMatch)) {
      return false;
    }

    const payload = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    const computedHex = crypto
      .createHmac('sha256', appSecret)
      .update(payload)
      .digest('hex');

    // Double SHA-256 hash to guarantee identical 32-byte buffers
    const hashA = crypto.createHash('sha256').update(hexMatch.toLowerCase()).digest();
    const hashB = crypto.createHash('sha256').update(computedHex.toLowerCase()).digest();

    return crypto.timingSafeEqual(hashA, hashB);
  } catch (err) {
    console.error('Meta webhook signature check failed safely:', err.message);
    return false;
  }
}

/**
 * Parse and sanitize incoming webhook notifications from Meta
 */
export function parseIncomingMetaWebhook(body) {
  const events = [];
  if (!body || typeof body !== 'object') return events;

  // 1. WhatsApp Cloud API events
  if (body.object === 'whatsapp_business_account' && Array.isArray(body.entry)) {
    for (const entry of body.entry) {
      for (const change of entry.changes || []) {
        if (change.field === 'messages') {
          const val = change.value || {};
          const contacts = val.contacts || [];
          const rawName = contacts[0]?.profile?.name || 'WhatsApp User';
          const safeName = String(rawName).slice(0, 255);

          for (const msg of val.messages || []) {
            let text = '';
            if (msg.type === 'text') {
              text = msg.text?.body || '';
            } else if (msg.type === 'interactive') {
              text = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '[Interactive Response]';
            } else {
              text = `[${String(msg.type || 'Media').slice(0, 50)}]`;
            }

            const fromPhone = String(msg.from || '').replace(/\D/g, '').slice(0, 50);
            if (fromPhone) {
              events.push({
                platform: 'whatsapp',
                externalConversationId: `wa_${fromPhone}`.slice(0, 255),
                recipientId: fromPhone,
                recipientName: safeName,
                recipientPhone: fromPhone,
                senderType: 'CUSTOMER',
                messageText: String(text).replace(/\0/g, '').slice(0, 4000),
                externalMessageId: String(msg.id || '').slice(0, 255),
                timestamp: msg.timestamp ? new Date(Number(msg.timestamp) * 1000) : new Date(),
              });
            }
          }
        }
      }
    }
  }

  // 2. Facebook Page / Messenger events
  if (body.object === 'page' && Array.isArray(body.entry)) {
    for (const entry of body.entry) {
      for (const messaging of entry.messaging || []) {
        if (messaging.message && !messaging.message.is_echo) {
          const rawSenderId = String(messaging.sender?.id || '').slice(0, 255);
          if (rawSenderId) {
            const text = messaging.message.text || (messaging.message.attachments ? '[Attachment]' : '');
            events.push({
              platform: 'facebook',
              externalConversationId: `fb_${rawSenderId}`.slice(0, 255),
              recipientId: rawSenderId,
              recipientName: 'Facebook User',
              senderType: 'CUSTOMER',
              messageText: String(text).replace(/\0/g, '').slice(0, 4000),
              externalMessageId: String(messaging.message.mid || '').slice(0, 255),
              timestamp: messaging.timestamp ? new Date(messaging.timestamp) : new Date(),
            });
          }
        }
      }
    }
  }

  // 3. Instagram Direct events
  if (body.object === 'instagram' && Array.isArray(body.entry)) {
    for (const entry of body.entry) {
      for (const messaging of entry.messaging || []) {
        if (messaging.message && !messaging.message.is_echo) {
          const rawSenderId = String(messaging.sender?.id || '').slice(0, 255);
          if (rawSenderId) {
            const text = messaging.message.text || (messaging.message.attachments ? '[Attachment]' : '');
            events.push({
              platform: 'instagram',
              externalConversationId: `ig_${rawSenderId}`.slice(0, 255),
              recipientId: rawSenderId,
              recipientName: 'Instagram User',
              senderType: 'CUSTOMER',
              messageText: String(text).replace(/\0/g, '').slice(0, 4000),
              externalMessageId: String(messaging.message.mid || '').slice(0, 255),
              timestamp: messaging.timestamp ? new Date(messaging.timestamp) : new Date(),
            });
          }
        }
      }
    }
  }

  return events;
}

export default {
  getMetaConfigStatus,
  sendFacebookMessage,
  sendInstagramMessage,
  sendWhatsAppMessage,
  sendPlatformMessage,
  verifyMetaWebhookSignature,
  parseIncomingMetaWebhook,
};
