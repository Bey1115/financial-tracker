# Financial Tracker - Deployment Guide

## 🚀 Deploying to Vercel (Recommended)

### Option 1: Connect GitHub Repository

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR-USERNAME/financial-tracker.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy via Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Select your `financial-tracker` repository
   - Click "Deploy"
   - Your app will be live at: `https://financial-tracker-[random].vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Answer the prompts:**
   - Link to existing project? → `N`
   - Project name? → `financial-tracker`
   - Which directory? → `./dist`
   - Auto-deploy on git push? → `Y`

---

## 🚀 Deploying to Netlify

1. **Create a build & deploy settings file (optional):**
   Create `netlify.toml` in project root:
   ```toml
   [build]
   command = "npm run build"
   publish = "dist"
   
   [[redirects]]
   from = "/*"
   to = "/index.html"
   status = 200
   ```

2. **Option A: Drag & Drop:**
   - Go to [netlify.com](https://netlify.com)
   - Drag your `dist/` folder into Netlify
   - Your site is live instantly!

3. **Option B: Connect GitHub:**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect GitHub
   - Select your repo
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy"

---

## 📱 Sharing with Others

Your app is now publicly accessible! Share the URL:

### Option 1: Direct Link
```
https://your-app.vercel.app  (or netlify.app)
```

Anyone can open this URL on any device (phone, tablet, computer).

### Option 2: QR Code
Generate a QR code pointing to your app URL using:
- [qr-server.com](https://qr-server.com/api/qrcode?size=300x300&data=https://your-app.vercel.app)
- Share the QR code for easy mobile access

### Option 3: PWA Installation
Users can "Install App" from the URL for native-like experience:
1. Open your app URL in browser
2. Click "Install app" button (if using iOS: use share → Add to Home Screen)
3. App appears on home screen

---

## 🔐 Data Privacy & Persistence

**Current Setup:**
- Data stored in browser's **LocalStorage** (per-user)
- Each user's data stored under key: `ft_data_{username}`
- Login credentials stored in: `ft_users`

**Important Notes:**
- ⚠️ Data is **NOT synced across devices** yet
- ⚠️ Clearing browser data will delete local data
- ✅ Each user gets isolated data (others can't see your data)

### To Enable Cloud Sync (Future Enhancement):
You'll need a backend database. Options:
- Firebase Realtime Database (easy)
- Supabase (PostgreSQL + auth)
- Your own Node.js API + MongoDB

Contact me if you want to implement cloud sync!

---

## 📊 Environment Variables (if using backend)

Create `.env.local` in project root:
```
VITE_API_URL=https://your-api.com
VITE_APP_NAME=Financial Tracker
```

---

## ✅ Post-Deployment Checklist

- [ ] App loads at your public URL
- [ ] Can login with test account
- [ ] Can add/edit/delete entries
- [ ] Dashboard totals calculate correctly
- [ ] Can navigate between pages (Dashboard, Savings, Debts, Expenses)
- [ ] Sidebar toggle works
- [ ] Can install as PWA
- [ ] Mobile responsive layout works

---

## 🐛 Troubleshooting

### App shows blank page
- Check browser console (F12 → Console tab) for errors
- Ensure `npm run build` completed successfully
- Clear browser cache and reload

### PWA not installable
- Must be served over HTTPS (Vercel/Netlify do this automatically)
- Check browser console for service worker errors

### Data disappears after refresh
- LocalStorage is working as intended
- Data persists within same browser/device
- For cross-device sync, you need a backend

---

## 🎯 Next Steps for You

1. **Deploy to Vercel/Netlify** (choose one above)
2. **Share the public URL** with others
3. **Test on mobile** via the shared link
4. **(Optional) Add backend** for cloud data sync
5. **(Optional) Custom domain** (add your domain in Vercel/Netlify settings)

---

**Questions?** The app is now production-ready and accessible from anywhere! 🎉
