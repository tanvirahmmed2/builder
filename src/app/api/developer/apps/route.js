import { NextResponse } from 'next/server';
import slugify from 'slugify';
import { queryDb } from '@/lib/db/pg';
import { getAuthenticatedUser, isManagerOrAdmin } from '@/lib/middleware/developer';
import cloudinary from '@/lib/db/cloudinary';
import { CLOUDINARY_NAME } from '@/lib/db/secret';

const cloud = CLOUDINARY_NAME || 'dv30hn53t';

function canManageApps(user) {
  if (!user) return false;
  const role = (user.role || '').toLowerCase();
  return role === 'admin' || role === 'manager';
}

async function generateUniqueAppSlug(title, existingId = null) {
  const cleanTitle = (title || 'untitled-app').trim();
  let baseSlug = slugify(cleanTitle, {
    lower: true,
    strict: true,
    trim: true,
  });

  if (!baseSlug) {
    baseSlug = 'app';
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const conflict = await queryDb(
      existingId
        ? 'SELECT id FROM apps WHERE slug = $1 AND id != $2 LIMIT 1'
        : 'SELECT id FROM apps WHERE slug = $1 LIMIT 1',
      existingId ? [slug, existingId] : [slug]
    );

    if (!conflict.rows || conflict.rows.length === 0) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

async function uploadToCloudinary(imageFile, folder = 'portfoliobuilder/apps') {
  if (!imageFile || typeof imageFile === 'string' || !imageFile.size) return null;
  const arrayBuffer = await imageFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Str = `data:${imageFile.type || 'image/png'};base64,${buffer.toString('base64')}`;

  const uploadRes = await cloudinary.uploader.upload(base64Str, {
    folder,
    resource_type: 'image',
  });

  return {
    url: uploadRes.secure_url,
    id: uploadRes.asset_id || uploadRes.public_id,
    public_id: uploadRes.public_id,
    asset_id: uploadRes.asset_id || uploadRes.public_id,
  };
}

export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Session not found.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('id');

    let query = `
      SELECT 
        a.id,
        a.title,
        a.slug,
        a.description,
        a.short_description,
        a.is_published,
        a.created_at,
        a.updated_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ai.id,
              'app_id', ai.app_id,
              'image', ai.image,
              'image_id', ai.image_id,
              'title', ai.title,
              'url', CASE 
                WHEN ai.image LIKE 'http://%' OR ai.image LIKE 'https://%' THEN ai.image 
                ELSE 'https://res.cloudinary.com/' || '${cloud}' || '/image/upload/' || ai.image 
              END,
              'created_at', ai.created_at
            ) ORDER BY ai.id ASC
          ) FILTER (WHERE ai.id IS NOT NULL),
          '[]'::json
        ) AS images
      FROM apps a
      LEFT JOIN apps_images ai ON a.id = ai.app_id
    `;

    const params = [];
    if (appId) {
      query += ` WHERE a.id = $1 GROUP BY a.id`;
      params.push(Number(appId));
    } else {
      query += ` GROUP BY a.id ORDER BY a.id DESC`;
    }

    const res = await queryDb(query, params).catch(() => ({ rows: [] }));

    if (appId) {
      const record = res.rows[0] || null;
      return NextResponse.json({
        success: true,
        record,
        canManage: canManageApps(user),
      });
    }

    return NextResponse.json({
      success: true,
      table: 'apps',
      records: res.rows || [],
      canManage: canManageApps(user),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await isManagerOrAdmin(req);
    if (!auth.success) {
      return Response.json({ error: auth.message }, { status: 403 });
    }

    const contentType = req.headers.get('content-type') || '';
    let title = '';
    let description = '';
    let shortDescription = '';
    let isActiveVal = null;
    let imageFiles = [];
    let action = '';
    let targetId = null;
    let rawBody = {};

    if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      title = (formData.get('title') || formData.get('name') || '').trim();
      description = formData.get('description') || '';
      shortDescription = formData.get('short_description') || '';
      isActiveVal = formData.get('is_published') ?? formData.get('is_active');
      action = formData.get('action') || '';
      targetId = formData.get('id') || formData.get('app_id');

      // Collect image files (supports 'image', 'images', or file objects)
      for (const [key, val] of formData.entries()) {
        if (val && typeof val === 'object' && typeof val.arrayBuffer === 'function' && val.size > 0) {
          imageFiles.push(val);
        }
      }
    } else {
      rawBody = await req.json().catch(() => ({}));
      title = (rawBody.title || rawBody.name || '').trim();
      description = rawBody.description || '';
      shortDescription = rawBody.short_description || '';
      isActiveVal = rawBody.is_published ?? rawBody.is_active;
      action = rawBody.action || '';
      targetId = rawBody.id || rawBody.app_id;
    }

    // -------------------------------------------------------------------------
    // 1. DELETE APP (Cascades images from Cloudinary & DB)
    // -------------------------------------------------------------------------
    if (action === 'delete_record' || action === 'delete') {
      const idToDelete = targetId || rawBody.id;
      if (!idToDelete) {
        return Response.json({ error: 'App ID is required for deletion.' }, { status: 400 });
      }

      const imgRows = await queryDb('SELECT image FROM apps_images WHERE app_id = $1', [idToDelete]);
      for (const r of imgRows.rows) {
        if (r.image) {
          try {
            await cloudinary.uploader.destroy(r.image);
          } catch (_) {}
        }
      }

      await queryDb('DELETE FROM apps WHERE id = $1', [idToDelete]);
      return Response.json({ success: true, message: 'App and associated Cloudinary assets deleted.' });
    }

    // -------------------------------------------------------------------------
    // 2. DELETE SINGLE IMAGE
    // -------------------------------------------------------------------------
    if (action === 'delete_image') {
      const imageId = rawBody.image_id || rawBody.id || targetId;
      if (!imageId) {
        return Response.json({ error: 'Image ID is required.' }, { status: 400 });
      }

      const imgRow = await queryDb('SELECT image FROM apps_images WHERE id = $1', [imageId]);
      if (imgRow.rows.length > 0) {
        const publicId = imgRow.rows[0].image;
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.warn('Cloudinary delete image error:', err.message);
          }
        }
        await queryDb('DELETE FROM apps_images WHERE id = $1', [imageId]);
      }

      return Response.json({ success: true, message: 'Image deleted from Cloudinary and database.' });
    }

    // -------------------------------------------------------------------------
    // 3. LIST CLOUDINARY ASSETS
    // -------------------------------------------------------------------------
    if (action === 'list_cloudinary_assets') {
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
        return Response.json({ success: true, assets });
      } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    }

    // -------------------------------------------------------------------------
    // 4. ATTACH EXISTING CLOUDINARY ASSET
    // -------------------------------------------------------------------------
    if (action === 'attach_cloudinary_asset') {
      const appId = Number(targetId || rawBody.app_id);
      const { public_id, asset_id, title: imgTitle } = rawBody;
      if (!appId || !public_id) {
        return Response.json({ error: 'App ID and Cloudinary public_id are required.' }, { status: 400 });
      }

      await queryDb(
        `INSERT INTO apps_images (app_id, image, image_id, title)
         VALUES ($1, $2, $3, $4)`,
        [appId, public_id, asset_id || public_id, imgTitle || 'Cloudinary Image']
      );

      const allImagesRes = await queryDb(
        `SELECT id, app_id, image, image_id, title,
           CASE 
             WHEN image LIKE 'http://%' OR image LIKE 'https://%' THEN image 
             ELSE 'https://res.cloudinary.com/' || '${cloud}' || '/image/upload/' || image 
           END AS url,
           created_at
         FROM apps_images WHERE app_id = $1 ORDER BY id ASC`,
        [appId]
      );

      return Response.json({
        success: true,
        message: 'Cloudinary asset attached successfully.',
        images: allImagesRes.rows || [],
      });
    }

    // -------------------------------------------------------------------------
    // 5. UPLOAD IMAGES TO EXISTING APP
    // -------------------------------------------------------------------------
    if (action === 'upload_images' && targetId) {
      const appId = Number(targetId);
      for (const file of imageFiles) {
        const uploadResult = await uploadToCloudinary(file, 'portfoliobuilder/apps');
        if (uploadResult) {
          await queryDb(
            `INSERT INTO apps_images (app_id, image, image_id, title)
             VALUES ($1, $2, $3, $4)`,
            [appId, uploadResult.public_id, uploadResult.asset_id, file.name || 'App Screenshot']
          );
        }
      }

      const allImagesRes = await queryDb(
        `SELECT id, app_id, image, image_id, title,
           CASE 
             WHEN image LIKE 'http://%' OR image LIKE 'https://%' THEN image 
             ELSE 'https://res.cloudinary.com/' || '${cloud}' || '/image/upload/' || image 
           END AS url,
           created_at
         FROM apps_images WHERE app_id = $1 ORDER BY id ASC`,
        [appId]
      );

      return Response.json({
        success: true,
        message: `${imageFiles.length} image(s) uploaded successfully.`,
        images: allImagesRes.rows || [],
      });
    }

    // -------------------------------------------------------------------------
    // 6. UPDATE EXISTING APP RECORD
    // -------------------------------------------------------------------------
    if (action === 'update_record' || action === 'update' || (targetId && !action)) {
      const appId = Number(targetId);
      const updateData = rawBody.data || rawBody;
      const updateTitle = (title || updateData.title || '').trim();

      if (!updateTitle) {
        return Response.json({ error: 'App title cannot be empty.' }, { status: 400 });
      }

      const slug = await generateUniqueAppSlug(updateTitle, appId);
      const shortDesc = shortDescription || updateData.short_description || null;
      const desc = description || updateData.description || null;
      const isPublished =
        isActiveVal !== null
          ? isActiveVal === 'true' || isActiveVal === true
          : Boolean(updateData.is_published);

      await queryDb(
        `UPDATE apps 
         SET title = $1, slug = $2, short_description = $3, description = $4, is_published = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6`,
        [updateTitle, slug, shortDesc, desc, isPublished, appId]
      );

      // Upload any new image files if sent with update
      for (const file of imageFiles) {
        const uploadResult = await uploadToCloudinary(file, 'portfoliobuilder/apps');
        if (uploadResult) {
          await queryDb(
            `INSERT INTO apps_images (app_id, image, image_id, title)
             VALUES ($1, $2, $3, $4)`,
            [appId, uploadResult.public_id, uploadResult.asset_id, file.name || updateTitle]
          );
        }
      }

      const updatedRes = await queryDb(
        `SELECT a.*, 
          COALESCE(
            json_agg(
              json_build_object(
                'id', ai.id,
                'app_id', ai.app_id,
                'image', ai.image,
                'image_id', ai.image_id,
                'title', ai.title,
                'url', CASE 
                  WHEN ai.image LIKE 'http://%' OR ai.image LIKE 'https://%' THEN ai.image 
                  ELSE 'https://res.cloudinary.com/' || '${cloud}' || '/image/upload/' || ai.image 
                END,
                'created_at', ai.created_at
              ) ORDER BY ai.id ASC
            ) FILTER (WHERE ai.id IS NOT NULL),
            '[]'::json
          ) AS images
         FROM apps a
         LEFT JOIN apps_images ai ON a.id = ai.app_id
         WHERE a.id = $1
         GROUP BY a.id`,
        [appId]
      );

      const record = updatedRes.rows[0] || null;

      return Response.json({
        success: true,
        message: 'App updated successfully.',
        record,
        ...record,
      });
    }

    // -------------------------------------------------------------------------
    // 7. CREATE NEW APP (Follows requested structure)
    // -------------------------------------------------------------------------
    if (!title && action !== 'create_draft') {
      return Response.json({ error: 'App title is required' }, { status: 400 });
    }

    const appTitle = title || 'Untitled App';
    const is_active = isActiveVal === 'false' ? false : Boolean(isActiveVal);
    const slug = await generateUniqueAppSlug(appTitle);

    const result = await queryDb(
      `INSERT INTO apps (title, slug, short_description, description, is_published)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [appTitle, slug, shortDescription, description, is_active]
    );

    const newApp = result.rows[0];

    // Upload images if provided
    for (const imageFile of imageFiles) {
      if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
        const uploadResult = await uploadToCloudinary(imageFile, 'portfoliobuilder/apps');
        if (uploadResult) {
          await queryDb(
            `INSERT INTO apps_images (app_id, image, image_id, title)
             VALUES ($1, $2, $3, $4)`,
            [newApp.id, uploadResult.public_id, uploadResult.asset_id, imageFile.name || appTitle]
          );
        }
      }
    }

    const fullAppRes = await queryDb(
      `SELECT a.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', ai.id,
              'app_id', ai.app_id,
              'image', ai.image,
              'image_id', ai.image_id,
              'title', ai.title,
              'url', CASE 
                WHEN ai.image LIKE 'http://%' OR ai.image LIKE 'https://%' THEN ai.image 
                ELSE 'https://res.cloudinary.com/' || '${cloud}' || '/image/upload/' || ai.image 
              END,
              'created_at', ai.created_at
            ) ORDER BY ai.id ASC
          ) FILTER (WHERE ai.id IS NOT NULL),
          '[]'::json
        ) AS images
       FROM apps a
       LEFT JOIN apps_images ai ON a.id = ai.app_id
       WHERE a.id = $1
       GROUP BY a.id`,
      [newApp.id]
    );

    const record = fullAppRes.rows[0] || { ...newApp, images: [] };

    return Response.json(
      {
        success: true,
        message: 'Application created successfully.',
        record,
        ...record,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating app:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
