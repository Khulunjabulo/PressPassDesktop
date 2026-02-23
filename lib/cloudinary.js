// lib/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Upload a file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with secure_url
 */
export async function uploadToCloudinary(fileBuffer, options = {}) {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto', // Automatically detect file type
          folder: options.folder || 'ad-uploads',
          public_id: options.public_id,
          transformation: options.transformation,
          ...options
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary upload success:', result.secure_url);
            resolve(result);
          }
        }
      );

      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
}

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - The public ID of the file to delete
 * @param {string} resourceType - Type of resource (image, video, raw)
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteFromCloudinary(publicId, resourceType = 'image') {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    console.log('✅ Cloudinary delete success:', publicId);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary delete failed:', error);
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
}

/**
 * Get optimized URL for an image/video
 * @param {string} publicId - The public ID of the file
 * @param {Object} transformations - Cloudinary transformations
 * @returns {string} Optimized URL
 */
export function getOptimizedUrl(publicId, transformations = {}) {
  return cloudinary.url(publicId, {
    secure: true,
    ...transformations
  });
}

export default cloudinary;