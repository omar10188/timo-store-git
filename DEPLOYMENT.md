# 🚀 Timo Store - Ultimate Deployment Guide

Welcome to the final stage! Your project is 100% production-ready. This guide will walk you through deploying your **Node.js/Express Backend** and your **Next.js Frontend** to the internet.

---

## 1. 🗄️ Database & Services (Prerequisites)

Before deploying your code, you need your production API keys and connection strings.

### A. MongoDB Atlas (Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster.
2. Under **Network Access**, allow IP `0.0.0.0/0` (access from anywhere).
3. Under **Database Access**, create a user and password.
4. Click **Connect** -> **Connect your application** and copy the URI.
   - *Example:* `mongodb+srv://<user>:<password>@cluster0.mongodb.net/timo-store`

### B. Cloudinary (Image Storage)
1. Go to [Cloudinary](https://cloudinary.com/) and copy your credentials.
2. You will need: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### C. Resend (Email Service)
1. Go to [Resend](https://resend.com/) and generate an API key.
2. (Optional) Verify your domain to send emails from your custom domain instead of `onboarding@resend.dev`.

---

## 2. ⚙️ Deploying the Backend (Railway / Render)

We recommend **Railway.app** or **Render.com** for hosting the backend because they are easy to use and free/cheap.

### Steps for Railway.app:
1. Push your code to a GitHub repository.
2. Go to [Railway](https://railway.app/) and click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository.
4. **Important:** Change the "Root Directory" to `/backend` in the settings, so Railway knows it's a Node.js app.
5. Go to the **Variables** tab and add the following production variables:

```env
PORT=5000
NODE_ENV=production
CLIENT_URL=https://<your-vercel-domain>.vercel.app
MONGO_URI=<your-mongodb-atlas-url>
JWT_SECRET=<generate-a-strong-random-password>
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
RESEND_API_KEY=<your-resend-key>
EMAIL_FROM=onboarding@resend.dev
```

6. Railway will automatically build and deploy. Once finished, copy the **Public Domain** URL provided by Railway (e.g., `https://timo-backend.up.railway.app`).

---

## 3. 🌐 Deploying the Frontend (Vercel)

**Vercel** is the creators of Next.js and the absolute best place to host your frontend.

### Steps for Vercel:
1. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
2. Import your GitHub repository.
3. Under **Framework Preset**, ensure it says `Next.js`.
4. **Important:** Change the "Root Directory" to `/frontend`.
5. Under **Environment Variables**, add:

```env
NEXT_PUBLIC_API_URL=https://<your-railway-domain>.railway.app/api
NEXT_PUBLIC_SOCKET_URL=https://<your-railway-domain>.railway.app
```

6. Click **Deploy**.

> **WARNING:** 
> After your Vercel deployment finishes, make sure to take your actual Vercel URL and update the `CLIENT_URL` variable in your Backend (Railway) settings. This is crucial for CORS and authentication to work securely!

---

## 4. 🎉 Post-Deployment Checklist

1. **Test Registration & Login:** Go to your live Vercel URL and create a new account.
2. **Promote to Admin:** Go to your MongoDB Atlas collection, find your user document, and change the `role` from `"user"` to `"admin"`.
3. **Add Products:** Log in to the Admin Dashboard and upload your first real products.
4. **Test Checkout:** Make a test order using the COD checkout and verify that:
   - The order appears in the Admin Dashboard.
   - You receive the PDF invoice and confirmation email (via Resend).
   - The live Socket.io notification pops up in your Admin Dashboard.

**Congratulations! Timo Store is LIVE!** 🛍️✨
