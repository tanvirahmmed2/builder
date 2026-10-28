import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth, logWebsiteActivity } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, user, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'sales').toLowerCase();

    let csv = '';
    let filename = `report_${type}_${Date.now()}.csv`;

    if (type === 'sales') {
      const res = await queryDb(
        `SELECT invoice_no, customer_name, customer_phone, total_amount, paid_amount, due_amount,
                payment_type, order_status, created_at
         FROM website_sales
         WHERE website_id = $1
         ORDER BY id DESC`,
        [website.id]
      );
      csv = 'Invoice,Customer,Phone,Total,Paid,Due,PaymentType,Status,Date\n';
      res.rows.forEach(r => {
        csv += `"${r.invoice_no}","${r.customer_name}","${r.customer_phone}",${r.total_amount},${r.paid_amount},${r.due_amount},"${r.payment_type}","${r.order_status}","${r.created_at}"\n`;
      });
    } else if (type === 'purchases') {
      const res = await queryDb(
        `SELECT invoice_no, total_amount, total_paid, due_amount, payment_status, created_at
         FROM website_purchases
         WHERE website_id = $1
         ORDER BY id DESC`,
        [website.id]
      );
      csv = 'Invoice,Total,Paid,Due,Status,Date\n';
      res.rows.forEach(r => {
        csv += `"${r.invoice_no}",${r.total_amount},${r.total_paid},${r.due_amount},"${r.payment_status}","${r.created_at}"\n`;
      });
    } else if (type === 'expenses') {
      const res = await queryDb(
        `SELECT title, category, total_amount, paid_amount, due_amount, expense_date
         FROM website_expenses
         WHERE website_id = $1
         ORDER BY expense_date DESC`,
        [website.id]
      );
      csv = 'Title,Category,Total,Paid,Due,Date\n';
      res.rows.forEach(r => {
        csv += `"${r.title}","${r.category}",${r.total_amount},${r.paid_amount},${r.due_amount},"${r.expense_date}"\n`;
      });
    } else {
      // Inventory
      const res = await queryDb(
        `SELECT name, sku, barcode, stock, buy_price, sale_price FROM website_products WHERE website_id = $1 ORDER BY name ASC`,
        [website.id]
      );
      csv = 'Product,SKU,Barcode,Stock,BuyPrice,SalePrice\n';
      res.rows.forEach(r => {
        csv += `"${r.name}","${r.sku || ''}","${r.barcode || ''}",${r.stock},${r.buy_price},${r.sale_price}\n`;
      });
    }

    await logWebsiteActivity({
      websiteId: website.id,
      userId: user?.id,
      userName: user?.name,
      action: 'REPORT_EXPORTED',
      details: `Exported ${type} report to CSV`,
      req: request
    });

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error('Report export GET API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
