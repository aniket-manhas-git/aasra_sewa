const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_URL;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

// Debug logging

class CloudinaryService {
  constructor() {
    this.uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    // Validate configuration
    if (!CLOUDINARY_CLOUD_NAME) {
      console.error('CLOUDINARY_CLOUD_NAME is not set in environment variables');
    }
  }

  async uploadImage(file, folder = 'aasrasewa') {
    try {
      // Validate configuration before upload
      if (!CLOUDINARY_CLOUD_NAME) {
        throw new Error('Cloudinary cloud name is not configured. Please check your environment variables.');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'AasraSewa'); // Using your specific preset
      formData.append('folder', folder);

      const response = await fetch(this.uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // If AasraSewa preset fails, try with default preset
        if (errorData.error?.message?.includes('preset') || errorData.error?.message?.includes('disabled')) {
          const fallbackFormData = new FormData();
          fallbackFormData.append('file', file);
          fallbackFormData.append('upload_preset', 'ml_default');
          fallbackFormData.append('folder', folder);
          
          const fallbackResponse = await fetch(this.uploadUrl, {
            method: 'POST',
            body: fallbackFormData,
          });
          
          if (!fallbackResponse.ok) {
            const fallbackErrorData = await fallbackResponse.json();
            throw new Error(fallbackErrorData.error?.message || 'Upload failed with both presets');
          }
          
          const fallbackData = await fallbackResponse.json();
          return {
            success: true,
            url: fallbackData.secure_url,
            publicId: fallbackData.public_id,
          };
        }
        
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async uploadMultipleImages(files, folder = 'aasrasewa') {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, folder));
      const results = await Promise.all(uploadPromises);
      
      const successful = results.filter(result => result.success);
      const failed = results.filter(result => !result.success);
      
      return {
        success: failed.length === 0,
        urls: successful.map(result => result.url),
        errors: failed.map(result => result.error),
      };
    } catch (error) {
      console.error('Multiple upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Helper method to get optimized image URL
  getOptimizedUrl(publicId, options = {}) {
    const defaultOptions = {
      quality: 'auto',
      fetch_format: 'auto',
      ...options
    };
    
    const transformations = Object.entries(defaultOptions)
      .map(([key, value]) => `${key}_${value}`)
      .join(',');
    
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
  }
}

export default new CloudinaryService(); 