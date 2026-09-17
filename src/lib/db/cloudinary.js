import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_API, CLOUDINARY_API_SECRET, CLOUDINARY_NAME } from './secret';

cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_API,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadToCloudinary(file, folder = 'portfoliobuilder/apps') {
  if (!file) return null;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            id: result.public_id,
          });
        }
      })
      .end(buffer);
  });
}

export async function deleteFromCloudinary(publicId) {
  if (!publicId) return null;

  let cleanId = publicId;
  if (typeof cleanId === 'string' && cleanId.includes('/upload/')) {
    const parts = cleanId.split('/upload/');
    if (parts[1]) {
      const sub = parts[1].replace(/^v\d+\//, '');
      cleanId = sub.substring(0, sub.lastIndexOf('.')) || sub;
    }
  }

  return new Promise((resolve) => {
    cloudinary.uploader.destroy(cleanId, (error, result) => {
      if (error) {
        console.warn('Cloudinary delete warning:', error.message || error);
        resolve({ error });
      } else {
        resolve(result);
      }
    });
  });
}

export default cloudinary;
