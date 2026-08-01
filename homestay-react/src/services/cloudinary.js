// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = 'aiyjmb1f'; // From Step 2
const CLOUDINARY_UPLOAD_PRESET = 'homestay_rooms'; // From Step 3

/**
 * Upload single image to Cloudinary
 * @param {File} file - The image file
 * @returns {Promise<{url: string, public_id: string}>}
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'homestay/rooms');

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    
    return {
      url: data.secure_url,
      public_id: data.public_id,
      width: data.width,
      height: data.height,
    };
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

/**
 * Upload multiple images
 * @param {File[]} files - Array of image files
 * @returns {Promise<Array>}
 */
export const uploadMultipleImages = async (files) => {
  const uploadPromises = Array.from(files).map(file => uploadImage(file));
  return Promise.all(uploadPromises);
};

/**
 * Get optimized image URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {object} options - {width, height, quality}
 */
export const getOptimizedImage = (url, options = {}) => {
  if (!url) return '';
  
  const { width = 400, height = 300, quality = 'auto' } = options;
  
  // Insert transformations into Cloudinary URL
  return url.replace(
    '/upload/',
    `/upload/w_${width},h_${height},c_fill,q_${quality}/`
  );
};

/**
 * Delete image (requires backend for security)
 * For now, we'll leave old images in Cloudinary
 */
export const deleteImage = async (publicId) => {
  // Deletion needs backend - skip for MVP
  console.log('To delete:', publicId);
};