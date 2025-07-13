import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Cloudinary Config Debug:');
console.log('All environment variables:');
console.log('process.env keys:', Object.keys(process.env).filter(key => key.includes('CLOUDINARY')));
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '***SET***' : 'NOT SET');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '***SET***' : 'NOT SET');
console.log('CLOUDINARY_CLOUD_NAME length:', process.env.CLOUDINARY_CLOUD_NAME?.length);
console.log('CLOUDINARY_API_KEY length:', process.env.CLOUDINARY_API_KEY?.length);
console.log('CLOUDINARY_API_SECRET length:', process.env.CLOUDINARY_API_SECRET?.length);

// Check if .env file is being loaded
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('✅ Cloudinary configured with cloud_name:', process.env.CLOUDINARY_CLOUD_NAME);

export default cloudinary; 