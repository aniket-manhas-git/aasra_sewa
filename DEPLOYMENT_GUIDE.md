# 🚀 Complete Render Deployment Guide

## 📋 Prerequisites
1. GitHub account with your code pushed
2. MongoDB Atlas account (free)
3. Cloudinary account (free)
4. Stripe account (free)
5. OpenAI API key
6. Google Gemini API key

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your Repository
1. Push all your code to GitHub
2. Ensure all files are committed and pushed

### Step 2: Set Up MongoDB Atlas (Free Database)
1. Go to [mongodb.com](https://mongodb.com)
2. Create free account
3. Create new cluster (free tier)
4. Create database user
5. Get connection string
6. Replace `your_mongodb_connection_string` in environment variables

### Step 3: Deploy Backend API

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign up/Login with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Backend Service**
   ```
   Name: aasrasewa-backend
   Root Directory: backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Set Environment Variables**
   ```
   FRONTEND_URL=https://aasrasewa-frontend.onrender.com
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_very_long_random_secret_key
   EXPIRE_IN=1d
   NODE_ENV=production
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the URL: `https://aasrasewa-backend.onrender.com`

### Step 4: Deploy ML Service

1. **Create Another Web Service**
   - Click "New +" → "Web Service"
   - Connect same GitHub repository

2. **Configure ML Service**
   ```
   Name: aasrasewa-ml-service
   Root Directory: building_health
   Environment: Python
   Build Command: pip install -r requirements.txt
   Start Command: python app.py
   ```

3. **Set Environment Variables**
   ```
   OPENAI_API_KEY=sk-proj-your_openai_api_key
   GEMINI_API_KEY=AIzaSy-your_gemini_api_key
   VITE_CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   MONGO_URI=your_mongodb_connection_string
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Note the URL: `https://aasrasewa-ml-service.onrender.com`

### Step 5: Deploy Frontend

1. **Create Static Site**
   - Click "New +" → "Static Site"
   - Connect same GitHub repository

2. **Configure Frontend**
   ```
   Name: aasrasewa-frontend
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. **Set Environment Variables**
   ```
   VITE_API_URL=https://aasrasewa-backend.onrender.com
   VITE_CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
   VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

4. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment
   - Note the URL: `https://aasrasewa-frontend.onrender.com`

### Step 6: Deploy Admin Panel

1. **Create Another Static Site**
   - Click "New +" → "Static Site"
   - Connect same GitHub repository

2. **Configure Admin Panel**
   ```
   Name: aasrasewa-admin
   Root Directory: admin
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. **Set Environment Variables**
   ```
   VITE_API_BASE_URL=https://aasrasewa-backend.onrender.com/api
   ```

4. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment
   - Note the URL: `https://aasrasewa-admin.onrender.com`

### Step 7: Update Environment Variables

After all services are deployed, update the environment variables with the correct URLs:

**Backend Environment Variables:**
```
FRONTEND_URL=https://aasrasewa-frontend.onrender.com
```

**Frontend Environment Variables:**
```
VITE_API_URL=https://aasrasewa-backend.onrender.com
```

**Admin Environment Variables:**
```
VITE_API_BASE_URL=https://aasrasewa-backend.onrender.com/api
```

## 🔧 Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json
   - Verify file paths are correct

2. **Environment Variables**
   - Double-check all API keys
   - Ensure MongoDB connection string is correct
   - Verify Cloudinary credentials

3. **CORS Issues**
   - Update FRONTEND_URL in backend environment variables
   - Check CORS configuration in backend

4. **Database Connection**
   - Verify MongoDB Atlas network access
   - Check connection string format
   - Ensure database user has correct permissions

## 📊 Monitoring

1. **Check Logs**
   - Go to each service in Render dashboard
   - Click "Logs" tab
   - Monitor for errors

2. **Health Checks**
   - Test each service URL
   - Verify API endpoints work
   - Check frontend loads correctly

## 🎉 Success!

Your application should now be live at:
- **Frontend**: https://aasrasewa-frontend.onrender.com
- **Admin Panel**: https://aasrasewa-admin.onrender.com
- **Backend API**: https://aasrasewa-backend.onrender.com
- **ML Service**: https://aasrasewa-ml-service.onrender.com

## 💰 Cost: $0/month

Render's free tier includes:
- ✅ 750 hours/month (enough for 24/7)
- ✅ Free SSL certificates
- ✅ Automatic deployments
- ✅ Custom domains
- ✅ Environment variables
- ✅ Logs and monitoring

## 🔄 Continuous Deployment

Render automatically redeploys when you push to your GitHub repository. Just commit and push your changes! 