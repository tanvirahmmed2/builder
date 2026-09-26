export const USD_TO_BDT_RATE = 120;

export function usdToBdt(amountUsd) {
  const usd = Number(amountUsd || 0);
  return Math.round(usd * USD_TO_BDT_RATE);
}

export const PLATFORM_NAME = 'Hiesci';
export const PLATFORM_EMAIL = 'support@hiesci.com';
export const PLATFORM_PHONE = '+01805003886';
export const PLATFORM_ADDRESS = 'Mymensingh, Bangladesh';


export function generateInvoiceData(payment, creator = null, pkg = null) {
  const currency = (payment?.currency || 'USD').toUpperCase();
  const isBdt = currency === 'BDT';
  const currencySymbol = isBdt ? '৳' : '$';
  const amountInCents = Number(payment?.amount_in_cents || 0);
  const amountNumber = amountInCents / 100;
  const amountFormatted = amountNumber.toFixed(2);
  const amountUsd = isBdt ? (amountNumber / USD_TO_BDT_RATE).toFixed(2) : amountFormatted;
  const amountBdt = isBdt ? Math.round(amountNumber) : usdToBdt(amountNumber);
  const isPaid = payment?.status === 'COMPLETED';

  return {
    invoiceNumber: payment?.transaction_id || `INV-${String(payment?.id || 1).padStart(6, '0')}`,
    invoiceId: payment?.id,
    date: payment?.created_at
      ? new Date(payment.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    status: payment?.status || 'UNPAID',
    isPaid,
    paymentMethod: payment?.payment_method || 'PENDING',

    // Issuer (Platform Company)
    issuer: {
      name: PLATFORM_NAME,
      email: PLATFORM_EMAIL,
      phone: PLATFORM_PHONE,
      address: PLATFORM_ADDRESS,
    },

    // Customer (Creator)
    customer: {
      id: creator?.id || payment?.creator_id,
      name: creator?.name || payment?.creator_name || 'Valued Creator',
      email: creator?.email || payment?.creator_email || 'creator@platform.local',
      phone: creator?.phone || payment?.creator_phone || '',
    },

    // Line items
    item: {
      packageName: pkg?.name || payment?.package_name || 'Website Package Subscription',
      description:
        pkg?.description ||
        payment?.package_description ||
        'Standard Website Provisioning & Platform Quota',
      billingInterval: (payment?.billing_interval || pkg?.billing_interval || 'MONTHLY').toUpperCase(),
      amountUsd,
      amountBdt,
      amountFormatted,
      currencySymbol,
      currency,
    },

    // Pricing summary
    pricing: {
      subtotal: amountFormatted,
      total: amountFormatted,
      subtotalUsd: amountUsd,
      feesUsd: '0.00',
      totalUsd: amountUsd,
      totalBdt: amountBdt,
      currencySymbol,
      currency,
    },
  };
}

/**
 * Generate full self-contained HTML for an official printable invoice receipt
 * @param {Object} invoice - Structured invoice data from generateInvoiceData()
 * @returns {string} Standalone HTML document string
 */
export function generateReceiptHtml(invoice) {
  const isPaid = invoice.status === 'COMPLETED' || invoice.isPaid;
  const statusBadge = isPaid
    ? `<span style="display:inline-block;padding:4px 12px;border-radius:9999px;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;">PAID</span>`
    : `<span style="display:inline-block;padding:4px 12px;border-radius:9999px;font-size:11px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;background:#fffbeb;color:#b45309;border:1px solid #fde68a;">UNPAID</span>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt-${invoice.invoiceNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 32px;
      line-height: 1.5;
      font-size: 13px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .container {
      max-width: 680px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .company-name {
      font-size: 22px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.02em;
    }
    .company-detail {
      font-size: 11px;
      color: #64748b;
      margin-top: 3px;
    }
    .header-right {
      text-align: right;
    }
    .doc-type {
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #334155;
      margin-bottom: 6px;
    }
    .meta-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      padding-bottom: 24px;
      margin-bottom: 24px;
      border-bottom: 1px solid #e2e8f0;
    }
    .meta-title {
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    .meta-row {
      display: flex;
      margin-bottom: 4px;
      font-size: 12px;
    }
    .meta-label {
      width: 100px;
      color: #64748b;
    }
    .meta-value {
      color: #0f172a;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      border-bottom: 2px solid #e2e8f0;
      color: #64748b;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 10px 0;
      text-align: left;
    }
    td {
      padding: 14px 0;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
    }
    .payment-summary {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-top: 12px;
      margin-bottom: 32px;
    }
    .payment-info {
      font-size: 12px;
    }
    .total-table {
      width: 240px;
      font-size: 12px;
    }
    .total-table tr td {
      padding: 4px 0;
      border: none;
    }
    .total-row {
      border-top: 2px solid #0f172a !important;
      padding-top: 8px !important;
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 18px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- 1. Company Data (Top) -->
    <div class="header">
      <div>
        <div class="company-name">${invoice.issuer.name}</div>
        <div class="company-detail">${invoice.issuer.email} &bull; ${invoice.issuer.phone}</div>
        <div class="company-detail">${invoice.issuer.address}</div>
      </div>
      <div class="header-right">
        <div class="doc-type">Payment Receipt</div>
        <div>${statusBadge}</div>
      </div>
    </div>

    <!-- 2. Invoice Data & 3. Creator Data -->
    <div class="meta-section">
      <div>
        <div class="meta-title">Invoice Information</div>
        <div class="meta-row">
          <span class="meta-label">Invoice No:</span>
          <span class="meta-value" style="font-family:monospace;">${invoice.invoiceNumber}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Date:</span>
          <span class="meta-value">${invoice.date}</span>
        </div>
      </div>

      <div>
        <div class="meta-title">Creator Information</div>
        <div style="font-weight:700;color:#0f172a;font-size:13px;">${invoice.customer.name}</div>
        <div style="color:#64748b;font-size:12px;margin-top:2px;">${invoice.customer.email}</div>
        ${invoice.customer.id ? `<div style="color:#94a3b8;font-size:11px;margin-top:2px;">Creator ID: #${invoice.customer.id}</div>` : ''}
      </div>
    </div>

    <!-- 4. Package Data -->
    <div class="meta-title">Package & Plan Details</div>
    <table>
      <thead>
        <tr>
          <th>Package</th>
          <th>Description</th>
          <th style="text-align:center;">Interval</th>
          <th style="text-align:right;">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong style="color:#0f172a;font-size:13px;">${invoice.item.packageName}</strong>
          </td>
          <td style="font-size:12px;color:#64748b;">
            ${invoice.item.description}
          </td>
          <td style="text-align:center;text-transform:capitalize;color:#475569;">
            ${invoice.item.billingInterval.toLowerCase()}
          </td>
          <td style="text-align:right;font-weight:700;font-family:monospace;font-size:13px;">
            ${invoice.pricing.currencySymbol}${invoice.pricing.total} ${invoice.pricing.currency}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 5. Payment Data, Payment Method, Value, Status -->
    <div class="payment-summary">
      <div class="payment-info">
        <div class="meta-title">Payment Information</div>
        <div class="meta-row">
          <span class="meta-label">Method:</span>
          <span class="meta-value" style="font-family:monospace;">${invoice.paymentMethod}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Status:</span>
          <span class="meta-value">${invoice.status}</span>
        </div>
      </div>

      <table class="total-table">
        <tr>
          <td style="color:#64748b;">Subtotal:</td>
          <td style="text-align:right;font-family:monospace;font-weight:600;">${invoice.pricing.currencySymbol}${invoice.pricing.subtotal} ${invoice.pricing.currency}</td>
        </tr>
        <tr>
          <td style="color:#64748b;">Processing:</td>
          <td style="text-align:right;font-family:monospace;">${invoice.pricing.currencySymbol}0.00 ${invoice.pricing.currency}</td>
        </tr>
        <tr class="total-row">
          <td>Total Amount:</td>
          <td style="text-align:right;font-family:monospace;">${invoice.pricing.currencySymbol}${invoice.pricing.total} ${invoice.pricing.currency}</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      Official Receipt &bull; ${invoice.issuer.name} &bull; Electronic document generated on ${invoice.date}.
      <br>Questions? Contact ${invoice.issuer.email}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Trigger clean browser print/save-as-PDF of invoice receipt via isolated iframe
 * @param {Object} payment - Payment record
 * @param {Object} [creator] - Creator object
 * @param {Object} [pkg] - Package object
 */
export function printReceipt(payment, creator = null, pkg = null) {
  if (typeof window === 'undefined') return;
  const invoice = generateInvoiceData(payment, creator, pkg);
  const html = generateReceiptHtml(invoice);

  const existingFrame = document.getElementById('hiesci-receipt-frame');
  if (existingFrame) {
    existingFrame.remove();
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'hiesci-receipt-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      console.error('Print iframe error:', e);
      // Fallback
      window.print();
    }
  }, 350);
}

/**
 * Trigger download of standalone HTML invoice receipt file
 * @param {Object} payment - Payment record
 * @param {Object} [creator] - Creator object
 * @param {Object} [pkg] - Package object
 */
export function downloadReceiptFile(payment, creator = null, pkg = null) {
  if (typeof window === 'undefined') return;
  const invoice = generateInvoiceData(payment, creator, pkg);
  const html = generateReceiptHtml(invoice);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Receipt-${invoice.invoiceNumber}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

