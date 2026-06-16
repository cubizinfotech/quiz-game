# Quiz Game — Deployment Guide

## Prerequisites on the Server

- Ubuntu 22.04 LTS (or 20.04)
- Node.js 20+ (via nvm)
- MySQL 8.0
- Nginx
- PM2
- Certbot (for SSL)

---

## 1. Server Initial Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v   # should print v20.x.x

# Install PM2 globally
npm install -g pm2

# Install Nginx
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx

# Install MySQL
sudo apt install mysql-server -y
sudo systemctl enable mysql
sudo mysql_secure_installation
```

---

## 2. MySQL Database Setup

```bash
sudo mysql -u root -p

# Inside MySQL shell:
CREATE DATABASE quiz_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'quizuser'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON quiz_game.* TO 'quizuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 3. Upload Project Files

```bash
# On your local machine — zip the project (excluding node_modules and dist)
zip -r quiz-game.zip quiz-game/ \
  --exclude "*/node_modules/*" \
  --exclude "*/dist/*" \
  --exclude "*/.env"

# Upload to server
scp quiz-game.zip user@YOUR_SERVER_IP:/var/www/

# On server — extract
cd /var/www
unzip quiz-game.zip
```

Or use git:
```bash
cd /var/www
git clone https://github.com/youruser/quiz-game.git
```

---

## 4. Backend Setup

```bash
cd /var/www/quiz-game/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
nano .env
# Fill in: DATABASE_URL, JWT_SECRET, FRONTEND_URL

# Generate Prisma client
npm run db:generate

# Push schema to database (creates all tables)
npm run db:push

# Seed default data (admin, categories, sample quiz)
npm run db:seed

# Create uploads directory
mkdir -p uploads
```

---

## 5. Frontend Build

```bash
cd /var/www/quiz-game/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
nano .env
# Set VITE_API_URL=https://yourdomain.com/api

# Build for production
npm run build
# Output goes to: frontend/dist/
```

---

## 6. Configure Nginx

```bash
# Copy nginx config
sudo cp /var/www/quiz-game/nginx.conf /etc/nginx/sites-available/quiz-game

# Edit the config — replace 'yourdomain.com' with your actual domain
sudo nano /etc/nginx/sites-available/quiz-game

# Enable the site
sudo ln -s /etc/nginx/sites-available/quiz-game /etc/nginx/sites-enabled/quiz-game

# Remove default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## 7. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y

# Issue certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

---

## 8. Start Backend with PM2

```bash
cd /var/www/quiz-game

# Start using ecosystem config
pm2 start ecosystem.config.js --env production

# Save PM2 process list (survives reboots)
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Run the command it outputs (starts with 'sudo env...')

# Verify it's running
pm2 status
pm2 logs quiz-game-api
```

---

## 9. Create PM2 Log Directory

```bash
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2
```

---

## 10. File Permissions

```bash
# Set correct ownership
sudo chown -R www-data:www-data /var/www/quiz-game/frontend/dist
sudo chown -R $USER:$USER /var/www/quiz-game/backend

# Make uploads directory writable
chmod 755 /var/www/quiz-game/backend/uploads
```

---

## 11. Verify Everything Works

```bash
# Check API health
curl https://yourdomain.com/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Check PM2
pm2 status

# Check Nginx
sudo systemctl status nginx

# Check MySQL
sudo systemctl status mysql
```

Open your browser:
- **Frontend:** `https://yourdomain.com`
- **Admin panel:** `https://yourdomain.com/admin/login`
- **Default credentials:** `admin@quizgame.com` / `admin123`

---

## Local Development (WAMP / Windows)

```bash
# 1. Start MySQL via WAMP

# 2. Create database
# Open phpMyAdmin → New → quiz_game (utf8mb4_unicode_ci)

# 3. Backend
cd backend
npm install
# Edit .env: DATABASE_URL="mysql://root:@localhost:3306/quiz_game"
npm run db:push
npm run db:seed
npm run dev        # runs on http://localhost:5000

# 4. Frontend (new terminal)
cd frontend
npm install
# .env: VITE_API_URL=http://localhost:5000/api
npm run dev        # runs on http://localhost:5173

# 5. Admin login
# URL: http://localhost:5173/admin/login
# Email: admin@quizgame.com
# Password: admin123
```

---

## Update / Redeploy

```bash
cd /var/www/quiz-game

# Pull latest code
git pull origin main

# Backend — if schema changed
cd backend
npm install
npm run db:push      # apply schema changes (no data loss for additive changes)
npm run db:generate  # regenerate Prisma client

# Frontend — rebuild
cd ../frontend
npm install
npm run build

# Restart API
pm2 restart quiz-game-api

# Reload Nginx (if config changed)
sudo nginx -t && sudo systemctl reload nginx
```

---

## Generate a Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Paste the output as `JWT_SECRET` in `backend/.env`.

---

## Common Issues

| Problem | Solution |
|---|---|
| API returns 502 | PM2 crashed — run `pm2 logs quiz-game-api` to see error |
| Prisma error on boot | Run `npm run db:generate` in `/backend` |
| Login redirects back to login | JWT_SECRET mismatch between `.env` and running process — restart PM2 |
| Static files 404 | Check Nginx `root` path points to `frontend/dist` |
| CORS error | Set `FRONTEND_URL` in backend `.env` to match exact origin |
| DB connection refused | Check `DATABASE_URL` user/password — test with `mysql -u quizuser -p quiz_game` |
