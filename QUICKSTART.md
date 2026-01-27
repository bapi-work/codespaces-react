# Quick Start Guide - Asset Management System

## 🚀 5-Minute Setup

### Prerequisites
- Node.js 16+ installed
- MongoDB running (local or Docker)
- Git

### Step 1: Start MongoDB
```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or if you have MongoDB installed locally
mongod
```

### Step 2: Setup Backend
```bash
cd server
npm install
cp .env.example .env

# Edit .env and set:
# - JWT_SECRET to a random string
# - MONGODB_URI if not localhost
# - EMAIL settings (optional)
```

### Step 3: Start Backend Server
```bash
npm run dev
# Server runs on http://localhost:5000
```

### Step 4: Setup Frontend (new terminal)
```bash
npm install
npm start
# Frontend runs on http://localhost:3000
```

### Step 5: Create Admin Account
1. Navigate to http://localhost:3000/setup
2. Fill in admin credentials
3. Click "Create Admin Account"
4. You'll be automatically logged in

## 📋 First Actions

### Create Your First Asset
1. Go to **Assets** page
2. Click **+ New Asset**
3. Fill in:
   - Asset Tag: `HW-001`
   - Name: `Dell Laptop`
   - Type: `hardware`
   - Purchase Price: `1200`
4. Click **Create Asset**

### Add an Employee
1. Go to **Employees** page
2. Click **+ New Employee**
3. Fill in basic info:
   - Employee ID: `EMP001`
   - Name: `John Doe`
   - Email: `john@company.com`
   - Department: `IT`
4. Click **Create Employee**

### Assign an Asset
1. Go to **Assignments** page
2. Click **+ New Assignment**
3. Select:
   - Asset: `HW-001 - Dell Laptop`
   - Employee: `John Doe`
4. Click **Assign Asset**

### View Dashboard
1. Go to **Dashboard** to see:
   - Asset statistics
   - Depreciation tracking
   - Recent assignments
   - System health

## 🔧 Configuration

### Set Company Branding
1. Go to **Settings** (Admin only)
2. Update:
   - Company Name: `Your Company`
   - Company Logo: Image URL
   - Currency: Your currency
3. Click **Save Settings**

### Configure Email Notifications
1. In **Settings**, select **Email Configuration**
2. Choose provider:
   - **Gmail**: Add email and app password
   - **SendGrid**: Add API key
   - **Office 365**: Add credentials
3. Enable notification types
4. Save

### Enable Dark Mode
1. Click the moon/sun icon in header
2. Or enable by default in Settings

## 📊 Using Dashboard Features

### View Asset Analytics
- Total assets by status
- Asset depreciation summary
- Asset distribution by type
- Recent assignments

### Export Data
- Go to **Assets**
- Click export button to download CSV

### Import Data
- Prepare CSV file with columns: assetTag, name, type, serialNumber, purchasePrice, vendor
- Go to **Assets** → Import
- Upload file

## 👤 User Management

### Create a Manager
1. Go to **Settings** → User Management (when implemented)
2. Create user with role: `Manager`
3. Manager can create assets and employees

### Employee Permissions
- View own assignments
- Add notes to assets
- Cannot create assets

## 🔐 Security Tips

1. **Change Admin Password**: After first login, update password
2. **Enable 2FA**: Go to Settings → 2FA Settings (when enabled)
3. **Backup Database**: Regularly backup MongoDB
4. **Audit Trail**: Review actions in Audit Trail page
5. **Environment Variables**: Never commit .env file

## ⚠️ Troubleshooting

### Frontend won't load
```bash
# Kill any running servers on ports 3000/5000
lsof -i :3000
lsof -i :5000

# Or restart:
npm start
```

### MongoDB connection error
```bash
# Check if MongoDB is running
docker ps
# or
ps aux | grep mongod

# Verify connection string in server/.env
```

### Assets not showing
1. Check backend logs for errors
2. Verify MongoDB contains data: `db.assets.count()`
3. Clear browser cache and refresh
4. Check browser console for API errors

### QR codes not displaying
- Ensure `qrcode.react` is installed
- Clear npm cache: `npm cache clean --force`
- Reinstall: `npm install`

## 📚 Next Steps

1. **Customize Fields**: Add custom fields for your asset types
2. **Set Locations**: Add office/branch locations
3. **Configure Depreciation**: Set asset useful life and salvage value
4. **Import Data**: Bulk upload existing assets from CSV
5. **Setup Notifications**: Configure email for assignment alerts

## 🎯 Common Tasks

### Generate Asset QR Code
1. Open asset detail
2. Click "Download QR"
3. Print for label

### Track Asset Depreciation
1. Dashboard shows current value
2. Automatically calculated monthly
3. Supports straight-line and declining-balance

### Check Assignment History
1. Open asset detail
2. Scroll to "Assignment History"
3. See all assignments and returns

### Export for Audit
1. Go to **Audit Trail**
2. Filter by date or action
3. Review all system changes

## 💡 Tips & Tricks

- **Search**: Use search box to find assets by tag, name, or serial number
- **Filters**: Combine status and type filters to narrow results
- **Bulk Import**: Save time with CSV import for assets/employees
- **Dark Mode**: Toggle with moon icon, persists across sessions
- **Roles**: Assign appropriate roles to limit access

## 📞 Getting Help

- Check the comprehensive README_ASSET_SYSTEM.md
- Review API documentation in README
- Check Postman collection for API examples
- Look at console logs for specific errors

## 🎓 Learning Resources

- MongoDB Schema Design: MongoDB Docs
- Express.js API: Express Documentation
- React Patterns: React Docs
- Tailwind CSS: Tailwind Documentation

---

**Enjoy using the Asset Management System!** 🎉
