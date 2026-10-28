'use client';

export function printReceipt(orderData, websiteData = null) {
  if (typeof window === 'undefined') return;

  const order = orderData?.order || orderData || {};
  const items = orderData?.items || order.items || [];
  const storeName = websiteData?.name || websiteData?.site_title || 'Store POS';
  const storeAddress = websiteData?.address || '';
  const storePhone = websiteData?.phone || '';

  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) {
    alert('Please allow popups to print receipts.');
    return;
  }

  const itemsHtml = items.map((it) => `
    <tr>
      <td style="padding: 4px 0; font-size: 11px;">
        ${it.product_name || it.title || 'Item'}<br/>
        <small style="color: #666;">${it.quantity} x ৳${Number(it.unit_price || 0).toFixed(2)}</small>
      </td>
      <td style="padding: 4px 0; text-align: right; font-size: 11px; font-weight: bold;">
        ৳${Number(it.total_price || (it.quantity * it.unit_price) || 0).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt #${order.order_id || order.id || ''}</title>
        <style>
          @page { margin: 0; size: 80mm auto; }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 76mm;
            margin: 0 auto;
            padding: 8px;
            color: #000;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          table { width: 100%; border-collapse: collapse; }
        </style>
      </head>
      <body>
        <div class="text-center">
          <h2 style="margin: 0; font-size: 16px; text-transform: uppercase;">${storeName}</h2>
          ${storeAddress ? `<p style="margin: 2px 0; font-size: 10px;">${storeAddress}</p>` : ''}
          ${storePhone ? `<p style="margin: 2px 0; font-size: 10px;">Tel: ${storePhone}</p>` : ''}
          <div class="divider"></div>
          <p style="margin: 2px 0; font-size: 11px; font-weight: bold;">ORDER RECEIPT</p>
          <p style="margin: 2px 0; font-size: 10px;">Order: #${order.order_id || order.id || ''} | ${order.created_at ? new Date(order.created_at).toLocaleString() : new Date().toLocaleString()}</p>
          ${order.customer_name ? `<p style="margin: 2px 0; font-size: 10px;">Customer: ${order.customer_name} ${order.phone ? `(${order.phone})` : ''}</p>` : ''}
        </div>

        <div class="divider"></div>
        <table>
          <thead>
            <tr style="border-bottom: 1px dashed #000; font-size: 10px;">
              <th style="text-align: left; padding: 2px 0;">ITEM</th>
              <th style="text-align: right; padding: 2px 0;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="divider"></div>
        <table>
          <tr>
            <td style="font-size: 11px;">Subtotal:</td>
            <td class="text-right" style="font-size: 11px;">৳${Number(order.subtotal || order.total_amount || 0).toFixed(2)}</td>
          </tr>
          ${order.discount_amount > 0 ? `
            <tr>
              <td style="font-size: 11px;">Discount:</td>
              <td class="text-right" style="font-size: 11px;">-৳${Number(order.discount_amount).toFixed(2)}</td>
            </tr>
          ` : ''}
          ${order.tax_amount > 0 ? `
            <tr>
              <td style="font-size: 11px;">Tax:</td>
              <td class="text-right" style="font-size: 11px;">৳${Number(order.tax_amount).toFixed(2)}</td>
            </tr>
          ` : ''}
          <tr style="font-weight: bold; font-size: 13px; border-top: 1px dashed #000;">
            <td style="padding-top: 4px;">Grand Total:</td>
            <td class="text-right" style="padding-top: 4px;">৳${Number(order.total_amount || 0).toFixed(2)}</td>
          </tr>
          ${order.paid_amount > 0 ? `
            <tr>
              <td style="font-size: 11px;">Paid:</td>
              <td class="text-right" style="font-size: 11px;">৳${Number(order.paid_amount).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="font-size: 11px;">Due:</td>
              <td class="text-right" style="font-size: 11px;">৳${Number(order.due_amount || (order.total_amount - order.paid_amount) || 0).toFixed(2)}</td>
            </tr>
          ` : ''}
        </table>

        <div class="divider"></div>
        <p class="text-center" style="font-size: 10px; margin: 4px 0;">
          Payment Method: ${(order.payment_method || 'CASH').toUpperCase()}
        </p>
        <p class="text-center" style="font-size: 10px; margin: 6px 0;">
          Thank you for shopping with us!
        </p>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

export default printReceipt;
