import { NextResponse } from 'next/server';
import { queryDb } from '@/lib/db/pg';
import { hasModulePermission } from '@/lib/middleware/developer';
import slugify from 'slugify';

async function generateUniqueSlug(name, excludeId = null) {
  const baseSlug = slugify(name || 'package', { lower: true, strict: true, trim: true }) || 'package';
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const params = excludeId ? [slug, Number(excludeId)] : [slug];
    const query = excludeId
      ? 'SELECT id FROM packages WHERE slug = $1 AND id != $2 LIMIT 1'
      : 'SELECT id FROM packages WHERE slug = $1 LIMIT 1';
    const check = await queryDb(query, params);
    if (check.rows.length === 0) return slug;
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const res = await queryDb(
        `SELECT p.*, s.title AS service_title, s.slug AS service_slug,
                COALESCE(
                  (
                    SELECT json_agg(
                      json_build_object(
                        'id', pm.id,
                        'name', pm.module_name,
                        'slug', pm.module_slug,
                        'is_enabled', pm.is_enabled,
                        'limits', pm.limits
                      ) ORDER BY pm.id ASC
                    )
                    FROM package_modules pm
                    WHERE pm.package_id = p.id
                  ),
                  '[]'::json
                ) AS package_modules,
                COALESCE(
                  (
                    SELECT json_agg(pm.module_name ORDER BY pm.id ASC)
                    FROM package_modules pm
                    WHERE pm.package_id = p.id
                  ),
                  '[]'::json
                ) AS allowed_modules
         FROM packages p
         LEFT JOIN services s ON p.service_id = s.id
         WHERE p.id = $1
         LIMIT 1`,
        [Number(id)]
      );
      if (res.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        record: res.rows[0],
      });
    }

    const res = await queryDb(
      `SELECT p.*, s.title AS service_title, s.slug AS service_slug,
              COALESCE(
                (
                  SELECT json_agg(
                    json_build_object(
                      'id', pm.id,
                      'name', pm.module_name,
                      'slug', pm.module_slug,
                      'is_enabled', pm.is_enabled,
                      'limits', pm.limits
                    ) ORDER BY pm.id ASC
                  )
                  FROM package_modules pm
                  WHERE pm.package_id = p.id
                ),
                '[]'::json
              ) AS package_modules,
              COALESCE(
                (
                  SELECT json_agg(pm.module_name ORDER BY pm.id ASC)
                  FROM package_modules pm
                  WHERE pm.package_id = p.id
                ),
                '[]'::json
              ) AS allowed_modules
       FROM packages p
       LEFT JOIN services s ON p.service_id = s.id
       ORDER BY COALESCE(p.monthly_price_usd, p.price_in_cents / 100.0, 0) ASC, p.id ASC`
    ).catch(() => ({ rows: [] }));

    return NextResponse.json({
      success: true,
      table: 'packages',
      records: res.rows,
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const auth = await hasModulePermission(request, 'packages');
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status || 403 }
      );
    }

    const body = await request.json();
    const data = body.data || body;
    const name = (data.name || '').trim() || 'Untitled Package';

    let serviceId = data.service_id || data.app_id ? Number(data.service_id || data.app_id) : null;
    const isQuickCreate = Boolean(data.is_quick_create || name === 'Untitled Package');

    if (!serviceId) {
      if (isQuickCreate) {
        const defaultService = await queryDb('SELECT id FROM services ORDER BY id ASC LIMIT 1');
        if (defaultService.rows.length > 0) {
          serviceId = defaultService.rows[0].id;
        }
      }
    }

    const slug = await generateUniqueSlug(name);
    const description = data.description || '';
    const monthlyPriceUsd = Math.max(
      0,
      Number(
        data.monthly_price_usd !== undefined
          ? data.monthly_price_usd
          : (data.price !== undefined ? data.price : (data.price_in_cents ? Number(data.price_in_cents) / 100 : 0))
      ) || 0
    );
    const yearlyPriceUsd = Math.max(0, Number(data.yearly_price_usd !== undefined ? data.yearly_price_usd : 0) || 0);
    const monthlyPriceBdt = Math.max(0, Number(data.monthly_price_bdt !== undefined ? data.monthly_price_bdt : 0) || 0);
    const yearlyPriceBdt = Math.max(0, Number(data.yearly_price_bdt !== undefined ? data.yearly_price_bdt : 0) || 0);
    const priceInCents = Math.round(monthlyPriceUsd * 100);
    const currency = (data.currency || 'USD').toUpperCase();
    const billingInterval = (data.billing_interval || data.billingInterval || 'MONTHLY').toUpperCase();
    const maxWebsites = data.max_websites !== undefined
      ? Math.max(1, Number(data.max_websites))
      : (data.max_portfolios !== undefined ? Math.max(1, Number(data.max_portfolios)) : 1);
    const isActive = data.is_active !== undefined ? Boolean(data.is_active) : true;

    const res = await queryDb(
      `INSERT INTO packages (
        name, slug, description, price_in_cents, currency, billing_interval,
        monthly_price_usd, yearly_price_usd, monthly_price_bdt, yearly_price_bdt,
        max_websites, max_portfolios, is_active, service_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        name, slug, description, priceInCents, currency, billingInterval,
        monthlyPriceUsd, yearlyPriceUsd, monthlyPriceBdt, yearlyPriceBdt,
        maxWebsites, maxWebsites, isActive, serviceId
      ]
    );

    const newPackage = res.rows[0];

    // Handle package_modules
    let modulesToSave = Array.isArray(data.package_modules)
      ? data.package_modules
      : (Array.isArray(data.allowed_modules) ? data.allowed_modules : (Array.isArray(data.modules) ? data.modules : null));

    if (!modulesToSave && serviceId) {
      const srvMods = await queryDb(
        `SELECT module_name, module_slug FROM service_modules WHERE service_id = $1 ORDER BY id ASC`,
        [serviceId]
      ).catch(() => ({ rows: [] }));
      modulesToSave = srvMods.rows;
    }

    if (Array.isArray(modulesToSave) && modulesToSave.length > 0) {
      for (const modItem of modulesToSave) {
        const modName = String(
          typeof modItem === 'object' && modItem !== null
            ? (modItem.name || modItem.module_name || modItem.title || modItem.slug || '')
            : (modItem || '')
        ).trim();
        const modSlug = slugify(
          typeof modItem === 'object' && modItem !== null
            ? (modItem.slug || modItem.module_slug || modName)
            : modName,
          { lower: true, strict: true }
        ) || 'module';

        if (modName) {
          await queryDb(
            `INSERT INTO package_modules (package_id, module_name, module_slug, is_enabled)
             VALUES ($1, $2, $3, TRUE)
             ON CONFLICT (package_id, module_slug) DO NOTHING`,
            [newPackage.id, modName, modSlug]
          ).catch((e) => console.warn('Error inserting package_module:', e.message));
        }
      }
    }

    const modRes = await queryDb(
      `SELECT module_name FROM package_modules WHERE package_id = $1 ORDER BY id ASC`,
      [newPackage.id]
    ).catch(() => ({ rows: [] }));

    newPackage.allowed_modules = modRes.rows.map((r) => r.module_name);

    return NextResponse.json({
      success: true,
      message: 'Package created successfully',
      record: newPackage,
      package: newPackage,
    }, { status: 201 });
  } catch (error) {
    console.error('Error processing package POST request:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    const auth = await hasModulePermission(request, 'packages');
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status || 403 }
      );
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || body.id || body.packageId || body.data?.id;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Package ID is required' }, { status: 400 });
    }

    const existingRes = await queryDb('SELECT * FROM packages WHERE id = $1', [Number(id)]);
    if (existingRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    }
    const current = existingRes.rows[0];

    const data = body.data || body;
    const name = data.name !== undefined ? (data.name || '').trim() : current.name;
    if (!name) {
      return NextResponse.json({ success: false, error: 'Package name cannot be empty' }, { status: 400 });
    }

    const serviceId = data.service_id !== undefined || data.app_id !== undefined
      ? Number(data.service_id || data.app_id) || null
      : current.service_id;

    let slug = current.slug;
    if (name && name !== current.name) {
      slug = await generateUniqueSlug(name, Number(id));
    }

    const description = data.description !== undefined ? data.description : current.description;
    const monthlyPriceUsd = data.monthly_price_usd !== undefined
      ? Math.max(0, Number(data.monthly_price_usd) || 0)
      : Number(current.monthly_price_usd !== undefined ? current.monthly_price_usd : 0);
    const yearlyPriceUsd = data.yearly_price_usd !== undefined
      ? Math.max(0, Number(data.yearly_price_usd) || 0)
      : Number(current.yearly_price_usd !== undefined ? current.yearly_price_usd : 0);
    const monthlyPriceBdt = data.monthly_price_bdt !== undefined
      ? Math.max(0, Number(data.monthly_price_bdt) || 0)
      : Number(current.monthly_price_bdt !== undefined ? current.monthly_price_bdt : 0);
    const yearlyPriceBdt = data.yearly_price_bdt !== undefined
      ? Math.max(0, Number(data.yearly_price_bdt) || 0)
      : Number(current.yearly_price_bdt !== undefined ? current.yearly_price_bdt : 0);
    const priceInCents = Math.round(monthlyPriceUsd * 100);
    const currency = (data.currency || current.currency || 'USD').toUpperCase();
    const billingInterval = (data.billing_interval || data.billingInterval || current.billing_interval || 'MONTHLY').toUpperCase();
    const maxWebsites = data.max_websites !== undefined
      ? Math.max(1, Number(data.max_websites))
      : (data.max_portfolios !== undefined ? Math.max(1, Number(data.max_portfolios)) : current.max_websites);
    const isActive = data.is_active !== undefined ? Boolean(data.is_active) : current.is_active;

    const res = await queryDb(
      `UPDATE packages SET
         name = $1,
         slug = $2,
         description = $3,
         price_in_cents = $4,
         currency = $5,
         billing_interval = $6,
         monthly_price_usd = $7,
         yearly_price_usd = $8,
         monthly_price_bdt = $9,
         yearly_price_bdt = $10,
         max_websites = $11,
         max_portfolios = $12,
         is_active = $13,
         service_id = $14,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $15
       RETURNING *`,
      [
        name, slug, description, priceInCents, currency, billingInterval,
        monthlyPriceUsd, yearlyPriceUsd, monthlyPriceBdt, yearlyPriceBdt,
        maxWebsites, maxWebsites, isActive, serviceId, Number(id)
      ]
    );

    const updatedPackage = res.rows[0];

    // Synchronize package_modules if provided
    const modulesToSave = Array.isArray(data.package_modules)
      ? data.package_modules
      : (Array.isArray(data.allowed_modules) ? data.allowed_modules : (Array.isArray(data.modules) ? data.modules : null));

    if (Array.isArray(modulesToSave)) {
      await queryDb('DELETE FROM package_modules WHERE package_id = $1', [Number(id)]);
      for (const modItem of modulesToSave) {
        const modName = String(
          typeof modItem === 'object' && modItem !== null
            ? (modItem.name || modItem.module_name || modItem.title || modItem.slug || '')
            : (modItem || '')
        ).trim();
        const modSlug = slugify(
          typeof modItem === 'object' && modItem !== null
            ? (modItem.slug || modItem.module_slug || modName)
            : modName,
          { lower: true, strict: true }
        ) || 'module';

        if (modName) {
          await queryDb(
            `INSERT INTO package_modules (package_id, module_name, module_slug, is_enabled)
             VALUES ($1, $2, $3, TRUE)
             ON CONFLICT (package_id, module_slug) DO NOTHING`,
            [Number(id), modName, modSlug]
          ).catch((e) => console.warn('Error inserting package_module:', e.message));
        }
      }
    }

    const modRes = await queryDb(
      `SELECT module_name FROM package_modules WHERE package_id = $1 ORDER BY id ASC`,
      [Number(id)]
    ).catch(() => ({ rows: [] }));

    updatedPackage.allowed_modules = modRes.rows.map((r) => r.module_name);

    return NextResponse.json({
      success: true,
      message: 'Package updated successfully',
      record: updatedPackage,
      package: updatedPackage,
    });
  } catch (error) {
    console.error('Error processing package PUT request:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const auth = await hasModulePermission(request, 'packages');
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.message },
        { status: auth.status || 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id || body?.packageId;
      } catch (_) {}
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Package ID is required' }, { status: 400 });
    }

    const existingRes = await queryDb('SELECT * FROM packages WHERE id = $1', [Number(id)]);
    if (existingRes.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Package not found' }, { status: 404 });
    }

    await queryDb('DELETE FROM package_modules WHERE package_id = $1', [Number(id)]).catch(() => {});
    await queryDb('DELETE FROM packages WHERE id = $1', [Number(id)]);

    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting package:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
