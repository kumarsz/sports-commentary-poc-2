# AWS EC2 Deployment Guide for CricketAI

**Goal:** Deploy CricketAI PoC to AWS EC2 for investor demo (15-min pitch window)

**Time Estimate:** 30-45 minutes

---

## Prerequisites

✅ **You have:**
- AWS Account (ready to use)
- CricketAI source code (local)
- OpenAI API key (optional, but recommended for demo)

---

## Step 1: Launch EC2 Instance

### 1.1 Open AWS Console
- Go to: https://console.aws.amazon.com
- Region: **us-east-1** (closest to most US/India traffic, lowest cost)

### 1.2 Launch EC2 Instance
```
Services > EC2 > Instances > Launch Instance
```

**Configuration:**
| Setting | Value |
|---------|-------|
| **AMI** | Ubuntu 22.04 LTS (t2.micro or t2.small) |
| **Instance Type** | t2.micro (free tier) or t2.small ($10/mo for demo) |
| **Storage** | 20GB gp2 (default) |
| **Security Group** | Create new: Allow SSH (22), HTTP (80), HTTPS (443), Custom TCP (3000, 8000) |
| **Key Pair** | Create or use existing (download `.pem` file, keep safe) |
| **Public IP** | Enable (auto-assign public IPv4) |

### 1.3 Launch & Wait
- Click "Launch Instance"
- Wait 30-60 seconds for instance to reach "Running" state
- Note the **Public IPv4 address** (e.g., `54.123.45.67`)

---

## Step 2: Connect to EC2 Instance

### 2.1 SSH into Instance (macOS/Linux)

```bash
# Replace with your actual key and IP
chmod 400 ~/Downloads/your-key-pair.pem
ssh -i ~/Downloads/your-key-pair.pem ubuntu@54.123.45.67
```

### 2.2 Test Connection
```bash
# You should now be logged in as 'ubuntu' user
pwd
# Output: /home/ubuntu
```

---

## Step 3: Install Dependencies

### 3.1 Update System
```bash
sudo apt update
sudo apt upgrade -y
```

### 3.2 Install Node.js (v18+)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs npm
```

### 3.3 Verify Installation
```bash
node --version   # v18.x.x
npm --version    # 9.x.x
```

---

## Step 4: Clone & Setup CricketAI

### 4.1 Clone Repository
```bash
cd /home/ubuntu
git clone https://github.com/kumarsz/sports-commentary-poc.git
cd sports-commentary-poc
```

### 4.2 Install Backend Dependencies
```bash
npm install
```

### 4.3 Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4.4 Build Frontend (Static Assets)
```bash
cd client
npm run build  # Creates /client/build folder with static files
cd ..
```

---

## Step 5: Configure Environment Variables

### 5.1 Create Backend Environment File
```bash
nano .env
```

**Paste this content (update with your OpenAI key if available):**
```
# Backend Configuration
PORT=8000
NODE_ENV=production

# OpenAI Integration (Optional but recommended for demo)
OPENAI_API_KEY=sk-YOUR_ACTUAL_KEY_HERE

# Logging
LOG_LEVEL=info
```

**Save:** Ctrl+O → Enter → Ctrl+X

### 5.2 Verify Frontend Build
```bash
ls -lh client/build/
# Should show index.html, static/ folder, etc.
```

---

## Step 6: Start the Backend Server

### 6.1 Start Backend (Foreground, Testing)
```bash
node server/index.js
```

**Expected Output:**
```
⚡ Express server running on http://localhost:8000
API Endpoints Ready:
  ✓ GET /api/matches
  ✓ GET /api/matches/:id
  ✓ GET /api/matches/:id/balls
```

**Test (in another SSH terminal):**
```bash
curl http://localhost:8000/api/matches
# Should return JSON list of matches
```

### 6.2 Verify Frontend is Served
```bash
curl http://localhost:8000/ | head -20
# Should return HTML (React app)
```

✅ **If both work, stop the server (Ctrl+C) and proceed to next step.**

---

## Step 7: Run as Background Service (Production)

### 7.1 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 7.2 Create PM2 Start Script
```bash
nano ecosystem.config.js
```

**Paste:**
```javascript
module.exports = {
  apps: [
    {
      name: 'cricketai-backend',
      script: './server/index.js',
      watch: false,
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 8000,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY || ''
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
```

### 7.3 Start with PM2
```bash
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 7.4 Verify Running
```bash
pm2 list
pm2 logs cricketai-backend
```

---

## Step 8: Verify Public Access

### 8.1 Get Your EC2 Public IP
```bash
# In EC2 console, or from instance details
# Should look like: 54.123.45.67
```

### 8.2 Test Access from Your Local Machine
```bash
# From your laptop (not SSH session)
curl http://54.123.45.67:8000/api/matches
# Should return JSON

# Or open in browser:
# http://54.123.45.67:3000 (might not work if running on 8000)
# http://54.123.45.67:8000 (should show React app)
```

---

## Step 9: Set Up Reverse Proxy (Optional but Recommended)

### 9.1 Install Nginx
```bash
sudo apt install -y nginx
```

### 9.2 Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/default
```

**Replace entire file with:**
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Save:** Ctrl+O → Enter → Ctrl+X

### 9.3 Test & Start Nginx
```bash
sudo nginx -t
# Should output: successful
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 9.4 Test Access (Now on Port 80)
```bash
# From local machine
curl http://54.123.45.67/api/matches
# Or open in browser: http://54.123.45.67
```

---

## Step 10: Domain Setup (Optional)

If you have a domain (e.g., `cricketai.demo.com`):

### 10.1 Update DNS
- Update A record to point to your EC2 public IP
- Wait 5-10 minutes for DNS propagation

### 10.2 Update Nginx Config (Optional SSL later)
```bash
sudo nano /etc/nginx/sites-available/default
# Change: server_name _;
# To:     server_name cricketai.demo.com;
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 11: Demo-Ready Checklist

✅ **Before showing to investors, verify:**

```bash
# SSH into instance
ssh -i key.pem ubuntu@YOUR_IP

# Check backend status
pm2 status

# Check logs for errors
pm2 logs cricketai-backend --lines 20

# Test API endpoint
curl http://localhost:8000/api/matches | jq .

# Test frontend loads
curl http://localhost:8000/ | grep -i "cricketai\|html"
```

---

## Step 12: Monitoring & Logs

### During Demo (Watch Logs)
```bash
ssh -i key.pem ubuntu@YOUR_IP
pm2 logs cricketai-backend
```

### If Something Breaks
```bash
# Restart backend
pm2 restart cricketai-backend

# Check logs
pm2 logs

# Stop everything
pm2 stop all

# Manual start for debugging
node server/index.js
```

---

## Step 13: Cost Management

| Item | Cost | Notes |
|------|------|-------|
| t2.micro | FREE | AWS free tier (1 year) |
| t2.small | ~$10/mo | Recommended for stable demo |
| Data transfer | FREE | Within first month |
| Storage (20GB) | ~$2/mo | gp2 general purpose |
| **Total** | **FREE-$12/mo** | Stop instance when not demo'ing |

**To Stop Instance (Save Cost):**
```bash
# AWS Console > EC2 > Instances > Select instance > Stop
# Cost: $0 when stopped (only storage charges)
# To restart: Start instance, note new public IP
```

---

## Step 14: Access URLs for Investors

**After deployment, share these:**

| Resource | URL | Notes |
|----------|-----|-------|
| **Live Demo** | `http://YOUR_IP/` | React app |
| **API Matches** | `http://YOUR_IP/api/matches` | JSON list |
| **Pitch Deck** | `http://localhost:3000/pitch-deck.html` | Local or share file |

---

## Troubleshooting

### Instance not starting?
- Check Security Group: Allow SSH (22), HTTP (80), Custom TCP (3000, 8000)
- Check IAM permissions: Ensure your AWS user can create EC2 instances

### Backend not responding?
```bash
# SSH in and check
pm2 status
pm2 logs cricketai-backend
# Check if port 8000 is in use:
sudo lsof -i :8000
```

### Frontend not loading?
- Verify frontend was built: `ls -lh client/build/`
- Check nginx: `sudo systemctl status nginx`
- Check logs: `sudo tail -f /var/log/nginx/error.log`

### OpenAI API errors?
- Verify key is set: `echo $OPENAI_API_KEY`
- Check API key format: Should start with `sk-`
- Verify key has credits: https://platform.openai.com/account/usage/overview

---

## Next Steps (After Demo)

1. **Shutdown instance** (save costs):
   ```bash
   # AWS Console > Stop Instance
   # Cost: $0 per month when stopped
   ```

2. **Collect feedback** from investors

3. **Iterate** based on feedback

4. **Scale** when ready with RDS (database), load balancing, etc.

---

## Support

- **AWS Docs:** https://docs.aws.amazon.com/ec2/
- **Node.js Deployment:** https://nodejs.org/en/docs/guides/nodejs-on-heroku/
- **PM2 Docs:** https://pm2.keymetrics.io/docs/usage/quick-start/
- **Nginx Reverse Proxy:** https://nginx.org/en/docs/

---

**Good luck with your investor pitch! 🚀**
