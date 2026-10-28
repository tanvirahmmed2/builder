'use client';

export function printPurchaseReceipt(purchaseData, websiteData = null) {
  if (typeof window === 'undefined') return;

  const purchase = purchaseData?.purchase || purchaseData || {};
  const items = purchaseData?.items || purchase.items || [];
  const storeName = websiteData?.name || websiteData?.site_title || 'Store';
  const supplierName = purchase.supplier_name || 'Supplier';

  const printWindow = window.open('', '_blank', 'width=700,height=800');
  if (!printWindow) {
    alert('Please allow popups to print purchase receipts.');
    return;
  }

  const itemsHtml = items.map((it, idx) => `
    <tr>
      <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${idx + 1}</td>
      <td style="padding: 6px; border: 1px solid #ddd;">
        <strong>${it.product_name || 'Product'}</strong>
      </td>
      <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${it.quantity}</td>
      <td style="padding: 6px; border: 1px solid #ddd; text-align: right;">৳${Number(it.unit_cost || 0).toFixed(2)}</td>
      <td style="padding: 6px; border: 1px solid #ddd; text-align: right;">৳${Number(it.total_cost || (it.quantity * it.unit_cost) || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Purchase Invoice #${purchase.id || ''}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; font-size: 12px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #f4f4f4; border: 1px solid #ddd; padding: 6px; text-align: left; }
          .text-right { text-align: right; }
          .totals { width: 40%; margin-left: auto; margin-top: 15px; }
          .totals td { padding: 4px 6px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h2 style="margin: 0;">${storeName}</h2>
            <p style="margin: 2px 0;">Purchase Order Receipt</p>
          </div>
          <div class="text-right">
            <h3 style="margin: 0;">PURCHASE #${purchase.id || ''}</h3>
            <p style="margin: 2px 0;">Invoice: ${purchase.invoice_no || 'N/A'}</p>
            <p style="margin: 2px 0;">Date: ${purchase.purchase_date ? new Date(purchase.purchase_date).toLocaleDateString() : new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <strong>Supplier Details:</strong>
          <p style="margin: 2px 0;">${supplierName} | Contact: ${purchase.supplier_phone || 'N/A'}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px; text-align: center;">#</th>
              <th>Item Description</th>
              <th style="width: 70px; text-align: center;">Qty</th>
              <th style="width: 90px; text-align: right;">Unit Cost</th>
              <th style="width: 100px; text-align: right;">Total Cost</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <table class="totals">
          <tr>
            <td>Total Cost:</td>
            <td class="text-right"><strong>৳${Number(purchase.total_amount || 0).toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td>Paid Amount:</td>
            <td class="text-right" style="color: green;">৳${Number(purchase.paid_amount || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Due Amount:</td>
            <td class="text-right" style="color: red;">৳${Number(purchase.due_amount || (purchase.total_amount - purchase.paid_amount) || 0).toFixed(2)}</td>
          </tr>
        </table>

        <div style="margin-top: 40px; display: flex; justify-content: space-between;">
          <div style="border-top: 1px solid #999; width: 150px; text-align: center; padding-top: 4px;">Receiver Signature</div>
          <div style="border-top: 1px solid #999; width: 150px; text-align: center; padding-top: 4px;">Authorized Signatory</div>
        </div>

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

export default printPurchaseReceipt;
