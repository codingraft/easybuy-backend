# Cloudinary Setup Guide

## Steps to Configure Cloudinary

1. **Sign up for Cloudinary**
   - Go to https://cloudinary.com/
   - Create a free account

2. **Get your credentials**
   - After signing up, you'll be redirected to your dashboard
   - Find your credentials at the top:
     - Cloud Name
     - API Key
     - API Secret

3. **Add to your .env file**
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Update Render Environment Variables**
   - Go to your Render dashboard
   - Select your backend service
   - Go to "Environment" tab
   - Add these three variables with your Cloudinary credentials

5. **Rebuild and deploy**
   - After adding environment variables, trigger a manual deploy
   - Your images will now be stored on Cloudinary instead of local filesystem

## Benefits
- ✅ Images persist across deployments
- ✅ Automatic image optimization
- ✅ CDN delivery for faster loading
- ✅ Free tier: 25GB storage, 25GB bandwidth/month
- ✅ Automatic image transformations available

## Migration Note
Existing products with local image paths will need to be re-uploaded or have their image URLs updated to Cloudinary URLs.
