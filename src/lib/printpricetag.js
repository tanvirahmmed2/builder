'use client';

export function printPriceTag(items = [], website = null) {
  if (typeof window === 'undefined') return;

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    alert('Please allow popups to print barcode price tags.');
    return;
  }

  const tagList = Array.isArray(items) ? items : [items];
  const storeName = website?.name || website?.site_title || 'Store';

  const tagsHtml = tagList.map((tag) => `
    <div class="tag">
      <div class="store-name">${storeName}</div>
      <div class="product-title">${tag.product_name || tag.name || tag.title || 'Product'}</div>
      <div class="price">৳${Number(tag.sale_price || tag.retail_price || tag.price || 0).toFixed(2)}</div>
      <div class="barcode-box">
        <div class="barcode-bars">|||||||||||||||||||||||||||</div>
        <div class="sku">${tag.sku || tag.barcode || 'N/A'}</div>
      </div>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Barcode Price Tags</title>
        <style>
          @page { margin: 5mm; }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 10px;
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
          }
          .tag {
            width: 48mm;
            height: 30mm;
            border: 1px dashed #999;
            padding: 4px;
            display: flex;
            flex-col: column;
            flex-direction: column;
            justify-content: space-between;
            text-align: center;
            box-sizing: border-box;
          }
          .store-name { font-size: 8px; font-weight: bold; text-transform: uppercase; color: #555; }
          .product-title { font-size: 10px; font-weight: bold; line-height: 1.1; overflow: hidden; max-height: 22px; }
          .price { font-size: 13px; font-weight: 900; color: #000; }
          .barcode-bars { font-family: monospace; font-size: 14px; letter-spacing: 2px; }
          .sku { font-size: 8px; font-family: monospace; color: #333; }
        </style>
      </head>
      <body>
        ${tagsHtml}
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

export default printPriceTag;
