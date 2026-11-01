import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { getControlAuth } from '@/lib/website-control';

export async function GET(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'parties';

    if (tab === 'transactions') {
      const res = await queryDb(
        `SELECT t.id, t.party_id, t.transaction_type, t.amount, t.balance_after, t.note, t.transaction_date, t.created_at,
                p.name as party_name, p.phone as party_phone
         FROM website_tali_transactions t
         LEFT JOIN website_tali_parties p ON t.party_id = p.id
         WHERE t.website_id = $1
         ORDER BY t.id DESC`,
        [website.id]
      );
      return NextResponse.json(res.rows);
    }

    // Default: parties
    const res = await queryDb(
      `SELECT id, name, phone, email, address, party_type, opening_balance, current_balance, is_active, created_at, updated_at
       FROM website_tali_parties
       WHERE website_id = $1
       ORDER BY name ASC`,
      [website.id]
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Tali Khata GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { website, errorResponse } = await getControlAuth(request, context);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const type = body.type || 'party';

    if (type === 'transaction') {
      const { party_id, transaction_type = 'give', amount = 0, note = '' } = body;
      if (!party_id || !amount) {
        return NextResponse.json({ success: false, error: 'Party and amount are required' }, { status: 400 });
      }

      // Calculate new balance
      const partyRes = await queryDb(
        `SELECT current_balance FROM website_tali_parties WHERE id = $1 AND website_id = $2`,
        [party_id, website.id]
      );
      if (partyRes.rowCount === 0) return NextResponse.json({ success: false, error: 'Party not found' }, { status: 404 });

      const prevBal = parseFloat(partyRes.rows[0].current_balance || 0);
      const parsedAmt = parseFloat(amount || 0);
      const newBal = transaction_type === 'give' ? prevBal + parsedAmt : prevBal - parsedAmt;

      // Update party current_balance
      await queryDb(
        `UPDATE website_tali_parties SET current_balance = $1, updated_at = NOW() WHERE id = $2 AND website_id = $3`,
        [newBal, party_id, website.id]
      );

      const res = await queryDb(
        `INSERT INTO website_tali_transactions (website_id, party_id, transaction_type, amount, balance_after, note, transaction_date, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING *`,
        [website.id, party_id, transaction_type, parsedAmt, newBal, note]
      );

      return NextResponse.json({ success: true, transaction: res.rows[0], newBalance: newBal });
    }

    // Default: party
    const { name, phone = '', email = '', address = '', party_type = 'customer', opening_balance = 0 } = body;
    if (!name?.trim()) return NextResponse.json({ success: false, error: 'Party name is required' }, { status: 400 });

    const res = await queryDb(
      `INSERT INTO website_tali_parties (website_id, name, phone, email, address, party_type, opening_balance, current_balance, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7, true, NOW(), NOW())
       RETURNING *`,
      [website.id, name.trim(), phone.trim(), email.trim(), address.trim(), party_type, Number(opening_balance) || 0]
    );

    return NextResponse.json({ success: true, party: res.rows[0] });
  } catch (error) {
    console.error('Tali Khata POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

