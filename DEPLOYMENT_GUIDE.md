# Asset Management System - Setup & Deployment Guide

## ✨ System Overview

This is a complete, production-ready Asset Management System with:
- **100+ files** of code
- **37+ API endpoints**
- **9 main pages** with full functionality
- **8 MongoDB collections**
- **3 user roles** with granular permissions
- **Dark mode** support
- **Multi-currency** support
- **Audit trail** with complete activity logging

---

## 🔧 Local Development Setup

### 1. Prerequisites
```bash
# Check Node.js version (need 16+)
node --version

# Check npm version
npm --version

# MongoDB is required
# Option A: Using Docker (recommended)
docker --version

# Option B: Local MongoDB installation
brew install mongodb-community  # macOS
sudo apt-get install mongodb     # Linux
```

### 2. Clone/Download Project
```bash
# Already downloaded in /workspaces/codespaces-react
cd /workspaces/codespaces-react
```

### 3. Start MongoDB

#### Option A: Docker (Recommended)
```bash
# Start MongoDB container
docker run -d \
  -p 27017:27017 \
  --name asset-management-db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest

# Verify it's running
docker ps | grep asset-management-db
```

#### Option B: Local MongoDB
```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Verify
mongosh  # or mongo
```

### 4. Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# vim .env  # or your preferred editor
```

### 5. Configure .env File

Edit `server/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/asset-management

# If using Docker MongoDB with auth:
# MONGODB_URI=mongodb://admin:password@localhost:27017/asset-management?authSource=admin

# JWT Configuration - CHANGE THESE IN PRODUCTION!
JWT_SECRET=your-super-secret-jwt-key-12345-change-in-production
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Email Configuration (Optional - can skip initially)
EMAIL_PROVIDER=gmail
SENDGRID_API_KEY=
GMAIL_EMAIL=your-email@gmail.com
GMAIL_PASSWORD=your-app-specific-password
OFFICE365_EMAIL=
OFFICE365_PASSWORD=

# 2FA Configuration (Optional)
TWO_FA_PROVIDER=authy
AUTHY_API_KEY=

# Default Admin Credentials (for initial setup)
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=ChangeMe@123
```

### 6. Start Backend Server
```bash
# In the server directory
npm run dev

# You should see:
# Server running on port 5000
# MongoDB connected
```

### 7. Frontend Setup (New Terminal)
```bash
# From root directory
npm install

# Update Tailwind if needed
npm install -D tailwindcss@latest
```

### 8. Start Frontend Server
```bash
# From root directory
npm start

# Should open automatically at http://localhost:3000
# If not, visit manually
```

### 9. Create Admin Account
1. Open browser to http://localhost:3000
2. You'll see login page
3. Click "Setup admin account" link
4. Fill in credentials:
   - Username: `admin`
   - Email: `admin@company.com`
   - Password: `MyPassword123!`
5. Click "Create Admin Account"
6. You'll be automatically logged in

### 10. Verify Installation
- ✅ Dashboard loads
- ✅ Can navigate to Assets, Employees, Assignments
- ✅ Can create a test asset
- ✅ System health shows "healthy"

---

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-Step Verification in Google Account
2. Generate App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password
3. Update `.env`:
```env
EMAIL_PROVIDER=gmail
GMAIL_EMAIL=your-email@gmail.com
GMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

### SendGrid Setup
1. Create account at https://sendgrid.com
2. Generate API key:
   - Go to Settings → API Keys
   - Create new key with Mail Send permission
3. Update `.env`:
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
```

### Office 365 Setup
1. Create app password in Office 365
2. Update `.env`:
```env
EMAIL_PROVIDER=office365
OFFICE365_EMAIL=email@company.onmicrosoft.com
OFFICE365_PASSWORD=generated-app-password
```

---

## 🌐 Production Deployment

### Pre-Deployment Checklist
- [ ] Update JWT_SECRET to random 32+ character string
- [ ] Configure production MongoDB with authentication
- [ ] Setup SSL/TLS certificates
- [ ] Configure domain/DNS
- [ ] Test all features locally
- [ ] Setup backups
- [ ] Configure monitoring
- [ ] Test email notifications
- [ ] Setup 2FA (optional)
- [ ] Review audit logs

### Environment Setup for Production
```env
# server/.env.production
PORT=5000
NODE_ENV=production

# Secure MongoDB URI
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/asset-management

# Strong JWT secret - use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789

# HTTPS URL
FRONTEND_URL=https://yourdomain.com

# Email configuration
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-production-key
```

### Option 1: Heroku Deployment

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production JWT_SECRET=your-secret

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

### Option 2: Docker Deployment

Create `Dockerfile`:
```dockerfile
# Backend
FROM node:18-alpine
WORKDIR /app
COPY server .
RUN npm install --production
EXPOSE 5000
CMD ["npm", "start"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db

  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://admin:password@mongodb:27017/asset-management?authSource=admin
      JWT_SECRET: your-secret
      FRONTEND_URL: http://localhost:3000
    depends_on:
      - mongodb

  frontend:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

Deploy with Docker:
```bash
# Build and run
docker-compose up --build

# Stop
docker-compose down
```

### Option 3: AWS Deployment

**Backend on EC2:**
1. Launch EC2 instance (Node.js AMI)
2. Install Node.js and MongoDB
3. Clone repository
4. Configure environment variables
5. Start with PM2:
```bash
npm install -g pm2
pm2 start server/server.js --name "asset-backend"
pm2 startup
pm2 save
```

**Frontend on S3 + CloudFront:**
1. Build frontend: `npm run build`
2. Upload to S3 bucket
3. Configure CloudFront distribution
4. Point domain to CloudFront

### Option 4: DigitalOcean App Platform

1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically with each push

---

## 🗄️ Database Management

### MongoDB Backup & Restore

```bash
# Backup
mongodump --uri="mongodb://localhost:27017/asset-management" \
          --out=./backup

# Restore
mongorestore --uri="mongodb://localhost:27017" ./backup

# Backup to file
mongodump --archive=backup.archive --uri="mongodb://localhost:27017/asset-management"

# Restore from file
mongorestore --archive=backup.archive --uri="mongodb://localhost:27017"
```

### MongoDB Indexes

Create indexes for better performance:
```bash
# Connect to MongoDB
mongosh

# Switch to database
use asset-management

# Create indexes
db.assets.createIndex({ "assetTag": 1 })
db.assets.createIndex({ "status": 1 })
db.employees.createIndex({ "employeeId": 1 })
db.assignments.createIndex({ "asset": 1, "status": 1 })
db.auditlogs.createIndex({ "createdAt": 1 })

# Verify indexes
db.assets.getIndexes()
```

---

## 🔍 Monitoring & Maintenance

### Health Checks
```bash
# API Health Check
curl http://localhost:5000/api/health

# Response: { "status": "OK", "timestamp": "..." }
```

### Logs & Debugging

Check backend logs:
```bash
# If running with npm run dev
# Logs appear in terminal

# If using PM2
pm2 logs asset-backend

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

### Performance Monitoring

Monitor with PM2:
```bash
pm2 monit
pm2 show asset-backend
pm2 logs asset-backend --lines 100
```

---

## 🔐 Security Hardening

### 1. Update Default Credentials
```bash
# In admin panel, update admin password immediately
```

### 2. Enable HTTPS
```bash
# Use Let's Encrypt for free SSL
certbot certonly --standalone -d yourdomain.com

# Update Express to use SSL
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/key.pem'),
  cert: fs.readFileSync('path/to/cert.pem')
};

https.createServer(options, app).listen(443);
```

### 3. Database Security
```bash
# Enable MongoDB authentication
# Update connection string to include credentials
MONGODB_URI=mongodb://username:password@localhost:27017/asset-management

# Create database user
use asset-management
db.createUser({
  user: "appuser",
  pwd: "strong-password-here",
  roles: ["readWrite", "dbOwner"]
})
```

### 4. Rate Limiting
Already implemented in backend, adjust if needed:
```javascript
// In server.js
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // limit each IP to 100 requests per windowMs
});
```

### 5. CORS Configuration
Update FRONTEND_URL in production:
```env
FRONTEND_URL=https://yourdomain.com
```

---

## 📊 Testing the System

### Test API Endpoints

Use the provided Postman collection: `Asset_Management_API.postman_collection.json`

Or curl:
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Get token from response
export TOKEN="your-jwt-token"

# Get assets
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/assets

# Create asset
curl -X POST http://localhost:5000/api/assets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetTag":"HW-001",
    "name":"Laptop",
    "type":"hardware",
    "purchasePrice":1200
  }'
```

### Load Testing

```bash
# Install Apache Bench
ab -n 1000 -c 10 http://localhost:5000/api/health

# Or use wrk
wrk -t4 -c100 -d30s http://localhost:5000/api/health
```

---

## 🚀 Performance Optimization

### Frontend
```bash
# Analyze bundle size
npm run build
npm install -g serve
serve -s build  # analyze the build directory

# Optimize images and assets
npm install -D @vitejs/plugin-compress
```

### Backend
```bash
# Enable compression
npm install compression
// In server.js
app.use(compression());

# Use connection pooling (Mongoose default)
# Implement query caching where appropriate
# Use pagination for large datasets
```

### Database
```bash
# Monitor with mongostat
mongostat --interval=1

# Monitor with mongotop
mongotop --interval=5
```

---

## 📱 Sample Data for Testing

### Create Test Asset via API
```bash
curl -X POST http://localhost:5000/api/assets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetTag": "TEST-001",
    "name": "Test Laptop",
    "type": "hardware",
    "manufacturer": "Dell",
    "model": "XPS 15",
    "serialNumber": "ABC123XYZ",
    "purchasePrice": 1500,
    "purchaseDate": "2024-01-15",
    "vendor": "Dell Direct",
    "usefulLife": 5,
    "depreciationMethod": "straight_line",
    "salvageValue": 300,
    "location": "New York"
  }'
```

### Create Test Employee
```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "EMP-001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@company.com",
    "department": "IT",
    "designation": "Senior Developer",
    "employmentType": "full_time"
  }'
```

---

## ⚠️ Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
docker ps
ps aux | grep mongod

# Check connection string
# Verify host:port, username, password

# Check firewall
sudo ufw allow 27017/tcp

# Test connection
mongosh "mongodb://localhost:27017"
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
# or on Windows
netstat -ano | findstr :5000

# Kill process
kill -9 <PID>
```

### CORS Errors
```bash
# Verify FRONTEND_URL in .env matches actual URL
# Check Express CORS configuration
# Clear browser cache
# Check browser console for specific error
```

### Build Errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version compatibility
node --version  # Should be 16+
```

---

## 📞 Support Resources

1. **README_ASSET_SYSTEM.md** - Complete feature documentation
2. **QUICKSTART.md** - 5-minute setup guide  
3. **IMPLEMENTATION_SUMMARY.md** - Architecture and feature overview
4. **Postman Collection** - API examples and testing
5. **Console Logs** - Check backend terminal for errors
6. **Browser Console** - Check frontend errors (F12)

---

## ✅ Deployment Checklist

Before going live:
- [ ] Change JWT_SECRET to random string
- [ ] Update admin password
- [ ] Configure email provider
- [ ] Setup database backups
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Setup monitoring
- [ ] Enable audit logging
- [ ] Test 2FA (if using)
- [ ] Load test the system
- [ ] Document deployment
- [ ] Setup error alerts
- [ ] Plan disaster recovery
- [ ] Train users

---

**System is ready for production deployment!** 🚀
