import { query } from '@/lib/db/pg';
import { hasModulePermission } from '@/lib/middleware/developer';
import cloudinary, { uploadToCloudinary, deleteFromCloudinary } from '@/lib/db/cloudinary';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function GET(req) {
  try {
    const auth = await hasModulePermission(req, 'services');
    if (!auth.success) {
      return Response.json({ error: auth.message }, { status: auth.status || 403 });
    }

    const url = new URL(req.url);
    const serviceId = url.searchParams.get('id');
    const search = url.searchParams.get('search') || url.searchParams.get('q');
    const status = url.searchParams.get('status');
    const listCloudinary = url.searchParams.get('cloudinary_assets');

    if (listCloudinary === 'true') {
      try {
        const cloudRes = await cloudinary.api.resources({
          type: 'upload',
          max_results: 40,
        });
        const assets = (cloudRes.resources || []).map((r) => ({
          public_id: r.public_id,
          asset_id: r.asset_id,
          format: r.format,
          secure_url: r.secure_url,
        }));
        return Response.json({ success: true, assets }, { status: 200 });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }

    let sql = `
      SELECT 
        s.id,
        s.title,
        s.slug,
        s.description,
        s.short_description,
        s.icon,
        s.badge,
        s.is_published,
        s.is_featured,
        s.order_index,
        s.created_at,
        s.updated_at,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', si.id,
                'service_id', si.service_id,
                'image', si.image,
                'image_id', si.image_id,
                'title', si.title,
                'alt_text', si.alt_text,
                'is_primary', si.is_primary,
                'sort_order', si.sort_order,
                'created_at', si.created_at
              ) ORDER BY si.sort_order ASC, si.id ASC
            )
            FROM service_images si
            WHERE si.service_id = s.id
          ),
          '[]'::json
        ) AS images,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', sm.id,
                'service_id', sm.service_id,
                'module_name', sm.module_name,
                'module_slug', sm.module_slug,
                'description', sm.description,
                'is_active', sm.is_active
              ) ORDER BY sm.id ASC
            )
            FROM service_modules sm
            WHERE sm.service_id = s.id
          ),
          '[]'::json
        ) AS modules,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', st.id,
                'service_id', st.service_id,
                'name', st.name,
                'slug', st.slug,
                'preview_image', st.preview_image,
                'is_active', st.is_active,
                'is_premium', st.is_premium
              ) ORDER BY st.id ASC
            )
            FROM service_themes st
            WHERE st.service_id = s.id
          ),
          '[]'::json
        ) AS themes
      FROM services s
    `;

    const conditions = [];
    const params = [];

    if (serviceId) {
      params.push(Number(serviceId));
      conditions.push(`s.id = $${params.length}`);
    }

    if (status === 'published') {
      conditions.push(`s.is_published = TRUE`);
    } else if (status === 'draft') {
      conditions.push(`s.is_published = FALSE`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(s.title ILIKE $${params.length} OR s.description ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ` + conditions.join(' AND ');
    }

    sql += ` ORDER BY s.order_index ASC, s.id DESC`;

    const { rows } = await query(sql, params);

    if (serviceId && rows.length > 0) {
      return Response.json({ success: true, service: rows[0], data: rows[0] }, { status: 200 });
    }

    return Response.json({ success: true, services: rows, data: rows }, { status: 200 });
  } catch (error) {
    console.error('Error in services GET:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await hasModulePermission(req, 'services');
    if (!auth.success) {
      return Response.json({ error: auth.message }, { status: auth.status || 403 });
    }

    const contentType = req.headers.get('content-type') || '';
    let title, description, short_description, icon, badge, is_published, is_featured, order_index;
    let customSlug = '';
    let files = [];
    let modulesList = [];
    let themesList = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      title = formData.get('title');
      customSlug = formData.get('slug') || '';
      description = formData.get('description') || '';
      short_description = formData.get('short_description') || '';
      icon = formData.get('icon') || '';
      badge = formData.get('badge') || '';
      is_published = formData.get('is_published') === 'true';
      is_featured = formData.get('is_featured') === 'true';
      order_index = Number(formData.get('order_index')) || 0;

      files = formData.getAll('images') || [];
      const modulesRaw = formData.get('modules');
      if (modulesRaw) {
        try {
          modulesList = JSON.parse(modulesRaw);
        } catch (_) {}
      }
      const themesRaw = formData.get('themes');
      if (themesRaw) {
        try {
          themesList = JSON.parse(themesRaw);
        } catch (_) {}
      }
    } else {
      const body = await req.json();
      title = body.title;
      customSlug = body.slug || '';
      description = body.description || '';
      short_description = body.short_description || '';
      icon = body.icon || '';
      badge = body.badge || '';
      is_published = Boolean(body.is_published);
      is_featured = Boolean(body.is_featured);
      order_index = Number(body.order_index) || 0;
      files = body.images || [];
      modulesList = body.modules || [];
      themesList = body.themes || [];
    }

    if (!title || !title.trim()) {
      return Response.json({ error: 'Service title is required' }, { status: 400 });
    }

    let baseSlug = customSlug.trim() ? slugify(customSlug) : slugify(title);
    if (!baseSlug) baseSlug = 'service';

    let uniqueSlug = baseSlug;
    let counter = 1;
    while (true) {
      const check = await query('SELECT id FROM services WHERE slug = $1', [uniqueSlug]);
      if (check.rows.length === 0) break;
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const insertSql = `
      INSERT INTO services (
        title, slug, description, short_description, icon, badge, is_published, is_featured, order_index
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const { rows } = await query(insertSql, [
      title.trim(),
      uniqueSlug,
      description,
      short_description,
      icon,
      badge,
      is_published,
      is_featured,
      order_index,
    ]);

    const newService = rows[0];

    // Handle service modules
    if (Array.isArray(modulesList) && modulesList.length > 0) {
      for (const mod of modulesList) {
        const modName = typeof mod === 'object' ? mod.name || mod.module_name : String(mod);
        const modSlug = typeof mod === 'object' ? mod.slug || mod.module_slug || slugify(modName) : slugify(modName);
        const modDesc = typeof mod === 'object' ? mod.description || '' : '';
        if (modName && modSlug) {
          await query(
            `INSERT INTO service_modules (service_id, module_name, module_slug, description, is_active)
             VALUES ($1, $2, $3, $4, TRUE)
             ON CONFLICT (service_id, module_slug) DO UPDATE SET is_active = TRUE`,
            [newService.id, modName, modSlug, modDesc]
          );
        }
      }
    }

    // Handle service themes
    if (Array.isArray(themesList) && themesList.length > 0) {
      for (const th of themesList) {
        const thName = typeof th === 'object' ? th.name : String(th);
        const thSlug = typeof th === 'object' ? th.slug || slugify(thName) : slugify(thName);
        const thImg = typeof th === 'object' ? th.preview_image || '' : '';
        const thCfg = typeof th === 'object' && th.theme_config ? th.theme_config : {};
        if (thName && thSlug) {
          await query(
            `INSERT INTO service_themes (service_id, name, slug, preview_image, theme_config, is_active)
             VALUES ($1, $2, $3, $4, $5, TRUE)
             ON CONFLICT (service_id, slug) DO UPDATE SET is_active = TRUE`,
            [newService.id, thName, thSlug, thImg, JSON.stringify(thCfg)]
          );
        }
      }
    }

    // Handle image uploads
    if (files.length > 0) {
      for (const item of files) {
        if (typeof item === 'string' && item.startsWith('http')) {
          await query(
            `INSERT INTO service_images (service_id, image, title) VALUES ($1, $2, $3)`,
            [newService.id, item, title]
          );
        } else if (item && typeof item === 'object' && item.name) {
          try {
            const buffer = Buffer.from(await item.arrayBuffer());
            const uploadRes = await uploadToCloudinary(buffer, 'services');
            if (uploadRes && uploadRes.secure_url) {
              await query(
                `INSERT INTO service_images (service_id, image, image_id, title) VALUES ($1, $2, $3, $4)`,
                [newService.id, uploadRes.secure_url, uploadRes.public_id, title]
              );
            }
          } catch (e) {
            console.error('Image upload failed:', e);
          }
        }
      }
    }

    return Response.json(
      {
        success: true,
        message: 'Service created successfully',
        service: newService,
        data: newService,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in services POST:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const auth = await hasModulePermission(req, 'services');
    if (!auth.success) {
      return Response.json({ error: auth.message }, { status: auth.status || 403 });
    }

    const contentType = req.headers.get('content-type') || '';
    let id, title, slug, description, short_description, icon, badge, is_published, is_featured, order_index;
    let files = [];
    let modulesList = null;
    let themesList = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      id = Number(formData.get('id'));
      title = formData.get('title');
      slug = formData.get('slug');
      description = formData.get('description');
      short_description = formData.get('short_description');
      icon = formData.get('icon');
      badge = formData.get('badge');
      if (formData.has('is_published')) is_published = formData.get('is_published') === 'true';
      if (formData.has('is_featured')) is_featured = formData.get('is_featured') === 'true';
      if (formData.has('order_index')) order_index = Number(formData.get('order_index'));

      files = formData.getAll('images') || [];
      const modRaw = formData.get('modules');
      if (modRaw) {
        try { modulesList = JSON.parse(modRaw); } catch (_) {}
      }
      const themeRaw = formData.get('themes');
      if (themeRaw) {
        try { themesList = JSON.parse(themeRaw); } catch (_) {}
      }
      const attachRaw = formData.get('attach_asset');
      if (attachRaw) {
        try { var attachAssetObj = JSON.parse(attachRaw); } catch (_) {}
      }
    } else {
      const body = await req.json();
      id = Number(body.id);
      title = body.title;
      slug = body.slug;
      description = body.description;
      short_description = body.short_description;
      icon = body.icon;
      badge = body.badge;
      if (body.is_published !== undefined) is_published = Boolean(body.is_published);
      if (body.is_featured !== undefined) is_featured = Boolean(body.is_featured);
      if (body.order_index !== undefined) order_index = Number(body.order_index);
      files = body.images || [];
      modulesList = body.modules;
      themesList = body.themes;
      var attachAssetObj = body.attach_asset;
    }

    if (!id) {
      return Response.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const existing = await query('SELECT * FROM services WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return Response.json({ error: 'Service not found' }, { status: 404 });
    }

    const current = existing.rows[0];
    const newTitle = title !== undefined ? title.trim() : current.title;
    let newSlug = slug !== undefined && slug.trim() ? slugify(slug) : current.slug;

    if (newSlug !== current.slug) {
      const checkSlug = await query('SELECT id FROM services WHERE slug = $1 AND id != $2', [newSlug, id]);
      if (checkSlug.rows.length > 0) {
        newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const updateSql = `
      UPDATE services SET
        title = $1,
        slug = $2,
        description = $3,
        short_description = $4,
        icon = $5,
        badge = $6,
        is_published = $7,
        is_featured = $8,
        order_index = $9,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `;

    const { rows } = await query(updateSql, [
      newTitle,
      newSlug,
      description !== undefined ? description : current.description,
      short_description !== undefined ? short_description : current.short_description,
      icon !== undefined ? icon : current.icon,
      badge !== undefined ? badge : current.badge,
      is_published !== undefined ? is_published : current.is_published,
      is_featured !== undefined ? is_featured : current.is_featured,
      order_index !== undefined ? order_index : current.order_index,
      id,
    ]);

    // Handle service modules sync
    if (Array.isArray(modulesList)) {
      await query('DELETE FROM service_modules WHERE service_id = $1', [id]);
      for (const mod of modulesList) {
        const modName = typeof mod === 'object' ? mod.name || mod.module_name : String(mod);
        const modSlug = typeof mod === 'object' ? mod.slug || mod.module_slug || slugify(modName) : slugify(modName);
        const modDesc = typeof mod === 'object' ? mod.description || '' : '';
        if (modName && modSlug) {
          await query(
            `INSERT INTO service_modules (service_id, module_name, module_slug, description, is_active)
             VALUES ($1, $2, $3, $4, TRUE)
             ON CONFLICT (service_id, module_slug) DO UPDATE SET is_active = TRUE`,
            [id, modName, modSlug, modDesc]
          );
        }
      }
    }

    // Handle service themes sync
    if (Array.isArray(themesList)) {
      await query('DELETE FROM service_themes WHERE service_id = $1', [id]);
      for (const th of themesList) {
        const thName = typeof th === 'object' ? th.name : String(th);
        const thSlug = typeof th === 'object' ? th.slug || slugify(thName) : slugify(thName);
        const thImg = typeof th === 'object' ? th.preview_image || '' : '';
        const thCfg = typeof th === 'object' && th.theme_config ? th.theme_config : {};
        const thActive = typeof th === 'object' && th.is_active !== undefined ? Boolean(th.is_active) : true;
        const thPrem = typeof th === 'object' && th.is_premium !== undefined ? Boolean(th.is_premium) : false;
        if (thName && thSlug) {
          await query(
            `INSERT INTO service_themes (service_id, name, slug, preview_image, theme_config, is_active, is_premium)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (service_id, slug) DO UPDATE SET is_active = EXCLUDED.is_active, preview_image = EXCLUDED.preview_image`,
            [id, thName, thSlug, thImg, JSON.stringify(thCfg), thActive, thPrem]
          );
        }
      }
    }

    // Handle direct asset attachment from Cloudinary
    if (attachAssetObj && attachAssetObj.secure_url) {
      await query(
        `INSERT INTO service_images (service_id, image, image_id, title) VALUES ($1, $2, $3, $4)`,
        [id, attachAssetObj.secure_url, attachAssetObj.public_id || attachAssetObj.asset_id, attachAssetObj.title || newTitle]
      );
    }

    // Handle file image uploads
    if (Array.isArray(files) && files.length > 0) {
      for (const item of files) {
        if (typeof item === 'string' && item.startsWith('http')) {
          await query(
            `INSERT INTO service_images (service_id, image, title) VALUES ($1, $2, $3)`,
            [id, item, newTitle]
          );
        } else if (item && typeof item === 'object' && item.name) {
          try {
            const buffer = Buffer.from(await item.arrayBuffer());
            const uploadRes = await uploadToCloudinary(buffer, 'services');
            if (uploadRes && uploadRes.secure_url) {
              await query(
                `INSERT INTO service_images (service_id, image, image_id, title) VALUES ($1, $2, $3, $4)`,
                [id, uploadRes.secure_url, uploadRes.public_id, newTitle]
              );
            }
          } catch (e) {
            console.error('Service image upload failed:', e);
          }
        }
      }
    }

    // Fetch full updated record
    const fullRes = await query(
      `SELECT 
        s.*,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', si.id,
                'service_id', si.service_id,
                'image', si.image,
                'image_id', si.image_id,
                'title', si.title,
                'alt_text', si.alt_text,
                'is_primary', si.is_primary,
                'sort_order', si.sort_order,
                'created_at', si.created_at
              ) ORDER BY si.sort_order ASC, si.id ASC
            )
            FROM service_images si
            WHERE si.service_id = s.id
          ),
          '[]'::json
        ) AS images,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', sm.id,
                'service_id', sm.service_id,
                'module_name', sm.module_name,
                'module_slug', sm.module_slug,
                'description', sm.description,
                'is_active', sm.is_active
              ) ORDER BY sm.id ASC
            )
            FROM service_modules sm
            WHERE sm.service_id = s.id
          ),
          '[]'::json
        ) AS modules,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', st.id,
                'service_id', st.service_id,
                'name', st.name,
                'slug', st.slug,
                'preview_image', st.preview_image,
                'theme_config', st.theme_config,
                'is_active', st.is_active,
                'is_premium', st.is_premium
              ) ORDER BY st.id ASC
            )
            FROM service_themes st
            WHERE st.service_id = s.id
          ),
          '[]'::json
        ) AS themes
      FROM services s
      WHERE s.id = $1`,
      [id]
    );

    const updatedRecord = fullRes.rows[0] || rows[0];

    return Response.json({
      success: true,
      message: 'Service updated successfully',
      service: updatedRecord,
      data: updatedRecord,
    });
  } catch (error) {
    console.error('Error in services PUT:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const auth = await hasModulePermission(req, 'services');
    if (!auth.success) {
      return Response.json({ error: auth.message }, { status: auth.status || 403 });
    }

    const url = new URL(req.url);
    const id = Number(url.searchParams.get('id'));
    const imageId = Number(url.searchParams.get('image_id') || url.searchParams.get('service_image_id'));

    // Handle single image deletion
    if (imageId) {
      const imgRow = await query('SELECT image, image_id FROM service_images WHERE id = $1', [imageId]);
      if (imgRow.rows.length > 0) {
        const pubId = imgRow.rows[0].image_id;
        if (pubId) {
          await deleteFromCloudinary(pubId).catch(() => {});
        }
        await query('DELETE FROM service_images WHERE id = $1', [imageId]);
        return Response.json({ success: true, message: 'Image deleted successfully' });
      }
      return Response.json({ error: 'Image not found' }, { status: 404 });
    }

    if (!id) {
      return Response.json({ error: 'Service ID or Image ID is required' }, { status: 400 });
    }

    const imgRows = await query('SELECT image_id FROM service_images WHERE service_id = $1', [id]);
    for (const r of imgRows.rows) {
      if (r.image_id) {
        await deleteFromCloudinary(r.image_id).catch(() => {});
      }
    }

    await query('DELETE FROM service_images WHERE service_id = $1', [id]);
    await query('DELETE FROM service_modules WHERE service_id = $1', [id]);
    await query('DELETE FROM service_themes WHERE service_id = $1', [id]);
    await query('UPDATE packages SET service_id = NULL WHERE service_id = $1', [id]).catch(() => {});
    await query('UPDATE blogs SET service_id = NULL WHERE service_id = $1', [id]).catch(() => {});
    await query('UPDATE subscription SET service_id = NULL WHERE service_id = $1', [id]).catch(() => {});

    const delRes = await query('DELETE FROM services WHERE id = $1 RETURNING id, title, slug', [id]);
    if (delRes.rows.length === 0) {
      return Response.json({ error: 'Service not found' }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: 'Service deleted successfully',
      deleted: delRes.rows[0],
    });
  } catch (error) {
    console.error('Error in services DELETE:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
