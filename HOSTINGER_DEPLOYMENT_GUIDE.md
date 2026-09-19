# 🚀 Resa AI Assistant - Hostinger Deployment Guide

This guide provides step-by-step instructions for hosting the **Resa AI Assistant** on **Hostinger**.

---

## 📋 Overview of Deployment Methods

| Hosting Plan Type | Recommended Setup | Features Available |
| :--- | :--- | :--- |
| **Hostinger Cloud / Business Hosting** | **hPanel Node.js App** (Recommended) | Full Gemini AI Chat, Admin Dashboard, Automated SMTP Emails, File Uploads |
| **Hostinger VPS (Ubuntu / CyberPanel)** | **PM2 + Nginx / LiteSpeed** | Full Enterprise Stack, High Concurrency, Custom Domain SSL |
| **Hostinger Single / Premium Shared** | **Static `dist/` + PHP Lead API** | Fast SPA Frontend, Lead Capture via PHP Mailer to `vs059899@gmail.com` |

---

## 🌟 Method 1: Hostinger Cloud / Business Hosting (hPanel Node.js App)

Hostinger Cloud and Business plans include a native **Node.js Application Manager** in hPanel.

### Step 1: Prepare the Files
1. In your local terminal, run the build command:
   ```bash
   npm run build
   ```
2. Or use the automated packager:
   ```bash
   npm run package:hostinger
   ```
   This generates a complete `hostinger-deployment/` folder with all required production files (`dist/`, `app.js`, `server.js`, `.htaccess`, and `package.json`).

### Step 2: Upload Files to Hostinger
1. Log into your **Hostinger hPanel**.
2. Go to **Websites** → click **Manage** on your domain.
3. Open **Files** → **File Manager**.
4. Upload the files into your root directory (or your domain folder, e.g., `/public_html` or a subfolder like `/nodejs`).
   Make sure the following files are present:
   - `dist/` (contains `index.html`, assets, and `dist/server.cjs`)
   - `app.js` (and `server.js`)
   - `.htaccess`
   - `package.json`
   - `data/` (optional, will be auto-created for SQLite/JSON storage)

### Step 3: Configure Node.js in hPanel
1. In hPanel, scroll down to the **Advanced** section and click **Node.js**.
2. Click **Create Application** and configure the fields:
   - **Node.js version**: `20.x` (or `18.x`)
   - **Application mode**: `Production`
   - **Application root**: `/` (or `public_html` depending on where you uploaded)
   - **Application startup file**: `app.js`
   - **Application URL**: Select your domain name (e.g., `https://yourdomain.com`)
3. Click **Create**.

### Step 4: Add Environment Variables
In the same **Node.js** management page in hPanel, find the **Environment Variables** section and add:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production caching and security |
| `GEMINI_API_KEY` | `AIzaSy...` | Your Google Gemini API Key |
| `ADMIN_PASSWORD` | `your_secure_password` | Password to access the Admin CRM Dashboard |
| `ADMIN_EMAIL` | `vs059899@gmail.com` | Destination email for new lead alerts |
| `SMTP_HOST` | `smtp.hostinger.com` | Hostinger Titan Email SMTP Host |
| `SMTP_PORT` | `465` | SSL Port for Hostinger Email |
| `SMTP_USER` | `info@yourdomain.com` | Your Hostinger Business Email address |
| `SMTP_PASS` | `YourEmailPassword` | Your Hostinger Business Email password |

### Step 5: Install Dependencies & Start
1. On the Node.js page in hPanel, click **NPM Install**.
2. Once installed, click **Start Application**.
3. Visit your website domain! The application will load immediately with the AI assistant, consultation engine, and lead capture.

---

## ⚡ Method 2: Hostinger VPS (Ubuntu / Debian with PM2)

If you are using a **Hostinger VPS** (with CyberPanel, CloudPanel, or clean Ubuntu):

### Step 1: Clone or Copy Your Code
SSH into your VPS server:
```bash
ssh root@your_vps_ip
cd /var/www/
git clone <your-repo-url> resa-app
cd resa-app
```

### Step 2: Install Node.js & Dependencies
```bash
# Ensure Node 20 is installed
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# Install project packages
npm install

# Build the production bundle
npm run build
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root directory:
```bash
nano .env
```
Paste your configuration:
```env
NODE_ENV=production
PORT=3000
GEMINI_API_KEY=your_gemini_api_key_here
ADMIN_PASSWORD=your_admin_password
ADMIN_EMAIL=vs059899@gmail.com
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=info@yourdomain.com
SMTP_PASS=your_email_password
```

### Step 4: Launch with PM2
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Step 5: Nginx Reverse Proxy Configuration
If using Nginx, point port `80`/`443` to local port `3000`:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 📁 Method 3: Hostinger Shared Web Hosting (Static `public_html`)

If your Hostinger plan is **Single Web Hosting** or **Premium Web Hosting** (which only supports static files and PHP without a permanent Node.js daemon):

1. Run the build command locally:
   ```bash
   npm run build
   ```
2. Open Hostinger **File Manager** and enter the `public_html/` folder.
3. Upload everything **inside the `dist/` directory** directly into `public_html/`:
   - `index.html`
   - `assets/`
   - `.htaccess` (automatically provided for SPA routing)
   - `api/` (contains `health.php` and `lead.php` for capturing leads via PHP mail)
4. Your website will now load instantly as a Single Page Application (SPA).
   - Inquiries submitted will be handled by Hostinger's native PHP mailer to `vs059899@gmail.com`.

---

## 🔍 Verification & Health Check

After launching on Hostinger, you can verify your service status:
- Health Check URL: `https://yourdomain.com/api/health`
- Admin Dashboard URL: `https://yourdomain.com/` (Click **Admin Dashboard** in the top navigation bar)
- Lead Capture Test: Type *"I want to start a haircare brand"* or click *"Save Consultation"* to test email dispatch to `vs059899@gmail.com`.
