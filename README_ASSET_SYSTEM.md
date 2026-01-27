# Asset Management System

A comprehensive, full-featured asset management application built with React, Node.js, Express, and MongoDB.

## Features

### Core Asset Management
- **Multi-Type Asset Tracking**: Support for hardware, software licenses, accessories, office equipment, and vehicles
- **Asset Lifecycle Management**: Track assets from procurement to disposal
- **Status Tracking**: Available, assigned, in maintenance, retired, and lost status monitoring
- **Asset Photos**: Store photo URLs for visual asset documentation
- **QR Code Labels**: Generate and print professional asset labels with QR codes for physical tracking
- **Depreciation Calculator**: Automatic asset value tracking using straight-line and declining balance methods
- **Custom Fields**: Dynamic field definitions for different asset types
- **Location Management**: Physical location tracking with dropdown selection
- **CSV Import/Export**: Bulk asset import and export functionality

### Employee & User Management
- **Employee Directory**: Comprehensive employee and contractor management
- **Bulk Employee Upload**: CSV import for adding multiple employees at once
- **Role-Based Access Control**: Admin, Manager, and Employee roles with granular permissions

### Assignment & Workflow
- **Check-In/Check-Out System**: Streamlined asset assignment workflow
- **Assignment History**: Complete audit trail of asset assignments
- **Asset Notes**: Maintenance logs and observations
- **Return Tracking**: Monitor asset returns and condition

### Authentication & Security
- **First-Time Setup**: Automated admin account creation on first deployment
- **Secure Authentication**: Username/password authentication with JWT tokens
- **2FA Support**: Integration ready for Authy or Microsoft Authenticator
- **Role-Based Access Control**: Granular permissions for different user types

### System Administration
- **System Health Dashboard**: Real-time monitoring of database and server status
- **Asset Distribution Analytics**: Visual charts showing assets by status and type
- **Audit Trail**: Complete history of all asset-related activities
- **Recent Activity Feed**: Monitor latest system actions

### Branding & Customization
- **Company Branding**: Configure company name, logo URL, and website
- **Logo Display**: Company logo on login and dashboard pages
- **Header/Footer Text**: Custom text shown throughout application
- **Currency Selection**: Support for all major currencies
- **Dark Mode**: Full dark mode support with modern, clean UI

### Email Notifications
- **Multiple Providers**: SendGrid, Gmail (SMTP), Office 365 support
- **Configurable Alerts**: Asset assignments, warranty expiry, return reminders
- **Email Settings Management**: Easy configuration through admin interface

## Project Structure

```
codespaces-react/
├── server/                          # Backend Node.js/Express application
│   ├── models/                      # Mongoose schemas
│   │   ├── User.js                 # User authentication model
│   │   ├── Asset.js                # Asset tracking model
│   │   ├── Employee.js             # Employee directory model
│   │   ├── Assignment.js           # Asset assignment model
│   │   ├── Location.js             # Location/branch model
│   │   ├── Settings.js             # System settings model
│   │   ├── AuditLog.js             # Audit trail model
│   │   └── AssetType.js            # Asset type definitions
│   ├── routes/                      # API route handlers
│   │   ├── auth.js                 # Authentication endpoints
│   │   ├── assets.js               # Asset management endpoints
│   │   ├── employees.js            # Employee management endpoints
│   │   ├── assignments.js          # Assignment workflow endpoints
│   │   ├── settings.js             # Settings endpoints
│   │   ├── dashboard.js            # Dashboard analytics endpoints
│   │   └── audit.js                # Audit trail endpoints
│   ├── middleware/                  # Custom middleware
│   │   └── auth.js                 # Authentication and authorization
│   ├── server.js                   # Express server entry point
│   ├── package.json                # Backend dependencies
│   └── .env.example                # Environment variables template
│
├── src/                            # Frontend React application
│   ├── components/                 # Reusable components
│   │   ├── ProtectedRoute.jsx     # Route protection wrapper
│   │   ├── Sidebar.jsx            # Navigation sidebar
│   │   └── Header.jsx             # Top header component
│   ├── pages/                      # Page components
│   │   ├── Login.jsx              # Login page
│   │   ├── Setup.jsx              # Admin setup page
│   │   ├── Dashboard.jsx          # Main dashboard
│   │   ├── Assets.jsx             # Assets management page
│   │   ├── AssetDetail.jsx        # Asset detail page
│   │   ├── Employees.jsx          # Employee directory page
│   │   ├── Assignments.jsx        # Assignment workflow page
│   │   ├── Settings.jsx           # System settings page
│   │   └── AuditTrail.jsx         # Audit trail page
│   ├── App.jsx                    # Main App component
│   ├── index.jsx                  # React entry point
│   └── index.css                  # Global styles with Tailwind
│
├── public/                         # Static assets
├── package.json                    # Frontend dependencies
├── tailwind.config.js              # Tailwind CSS configuration
├── vite.config.js                  # Vite configuration
├── index.html                      # HTML template
└── README.md                       # This file
```

## Installation

### Prerequisites
- Node.js 16+ and npm
- MongoDB 4.4+
- Git

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/asset-management
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:3000
EMAIL_PROVIDER=gmail
GMAIL_EMAIL=your-email@gmail.com
GMAIL_PASSWORD=your-app-password
```

5. Start MongoDB:
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or locally if MongoDB is installed
mongod
```

6. Start the backend server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. From the root directory, install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`

3. On first access, go to `/setup` to create the admin account
4. Login with your admin credentials

## API Documentation

### Authentication Endpoints

#### Setup Admin Account
```
POST /api/auth/setup
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "SecurePassword123"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "SecurePassword123"
}

Response:
{
  "token": "jwt-token",
  "user": { ... }
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

### Asset Endpoints

#### Get All Assets
```
GET /api/assets?status=available&type=hardware&search=laptop
Authorization: Bearer <token>
```

#### Get Asset by ID
```
GET /api/assets/:id
Authorization: Bearer <token>
```

#### Create Asset
```
POST /api/assets
Authorization: Bearer <token>
Content-Type: application/json

{
  "assetTag": "HW-001",
  "name": "Dell Laptop",
  "type": "hardware",
  "serialNumber": "ABC123",
  "manufacturer": "Dell",
  "model": "XPS 13",
  "purchasePrice": 1200,
  "purchaseDate": "2024-01-15",
  "vendor": "Dell Direct"
}
```

#### Update Asset
```
PUT /api/assets/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Asset
```
DELETE /api/assets/:id
Authorization: Bearer <token>
```

#### Export Assets to CSV
```
POST /api/assets/export/csv
Authorization: Bearer <token>
```

#### Import Assets from CSV
```
POST /api/assets/import/csv
Authorization: Bearer <token>
Content-Type: application/json

{
  "data": [
    {
      "assetTag": "HW-001",
      "name": "Laptop",
      "type": "hardware",
      "purchasePrice": 1200
    }
  ]
}
```

### Employee Endpoints

#### Get All Employees
```
GET /api/employees?department=IT&search=John
Authorization: Bearer <token>
```

#### Create Employee
```
POST /api/employees
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "EMP001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "department": "IT",
  "designation": "Senior Developer",
  "employmentType": "full_time"
}
```

#### Bulk Upload Employees
```
POST /api/employees/bulk-upload/csv
Authorization: Bearer <token>
Content-Type: application/json

{
  "data": [
    {
      "employeeId": "EMP001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "department": "IT"
    }
  ]
}
```

### Assignment Endpoints

#### Get All Assignments
```
GET /api/assignments?status=active
Authorization: Bearer <token>
```

#### Create Assignment (Check-Out)
```
POST /api/assignments
Authorization: Bearer <token>
Content-Type: application/json

{
  "asset": "asset-id",
  "employee": "employee-id",
  "notes": "Equipment issued for project"
}
```

#### Return Asset (Check-In)
```
POST /api/assignments/:id/return
Authorization: Bearer <token>
Content-Type: application/json

{
  "conditionOnReturn": "good",
  "returnNotes": "Asset returned in good condition"
}
```

#### Get Assignment History
```
GET /api/assignments/asset/:assetId/history
Authorization: Bearer <token>
```

### Dashboard Endpoints

#### Get Dashboard Stats
```
GET /api/dashboard/stats
Authorization: Bearer <token>
```

#### Get Depreciation Summary
```
GET /api/dashboard/depreciation
Authorization: Bearer <token>
```

#### Get System Health
```
GET /api/dashboard/health
Authorization: Bearer <token>
```

### Settings Endpoints

#### Get Settings
```
GET /api/settings
Authorization: Bearer <token>
```

#### Update Settings
```
PUT /api/settings
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyName": "ACME Corp",
  "companyLogo": "https://example.com/logo.png",
  "currency": "USD",
  "emailProvider": "gmail",
  "gmailEmail": "noreply@acme.com",
  "gmailPassword": "app-password",
  "enableDarkMode": true
}
```

### Audit Trail Endpoints

#### Get Audit Logs
```
GET /api/audit?action=asset_created&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

#### Get Recent Activity
```
GET /api/audit/activity/recent
Authorization: Bearer <token>
```

## User Roles & Permissions

### Admin
- Full system access
- Create/edit/delete assets and employees
- Manage users and roles
- Configure system settings
- View audit trails
- Manage email settings

### Manager
- Create and manage assets
- Create and manage employees
- Assign/return assets
- View audit trails and analytics
- Cannot modify system settings

### Employee
- View assigned assets
- Request asset assignments (with manager approval)
- View personal assignments
- Update asset notes

## Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/asset-management

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email Configuration
EMAIL_PROVIDER=gmail
SENDGRID_API_KEY=
GMAIL_EMAIL=
GMAIL_PASSWORD=
OFFICE365_EMAIL=
OFFICE365_PASSWORD=

# 2FA Configuration
TWO_FA_PROVIDER=authy
AUTHY_API_KEY=

# Admin Setup
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=ChangeMe@123
```

## Database Schema

### Users
- Username (unique)
- Email (unique)
- Password (hashed)
- Role (admin/manager/employee)
- 2FA settings
- Login history

### Assets
- Asset Tag (unique)
- Name, Type, Serial Number
- Manufacturer, Model
- Purchase information
- Depreciation method and value
- Status and location
- Assignment history
- Notes and photos
- Custom fields

### Employees
- Employee ID (unique)
- Personal information
- Department, Designation
- Manager reference
- Assigned assets
- Employment type and dates

### Assignments
- Asset reference
- Employee reference
- Assignment date and notes
- Return date and condition
- Status tracking

### Locations
- Name, Address
- Cost multiplier for location-based pricing
- Currency and contact information

### Audit Logs
- User action
- Entity type and ID
- Changes made
- Timestamp and IP address

## Features in Detail

### Depreciation Calculator
The system automatically calculates asset depreciation using two methods:
- **Straight-Line**: Equal depreciation each month
- **Declining-Balance**: Greater depreciation in early years

Example:
```
Purchase Price: $1000
Useful Life: 3 years
Salvage Value: $100

Straight-Line: ($1000 - $100) / 36 months = $25/month
Declining-Balance: 2/3 rate applied monthly
```

### QR Code Management
Each asset gets a unique QR code containing the asset tag. Users can:
- Download QR codes for printing
- Print asset labels with QR codes
- Scan codes for quick asset lookup

### CSV Import/Export
- **Export**: Download all assets or filtered results as CSV
- **Import**: Bulk upload assets or employees from CSV files
- Format: Standard CSV with headers

### Role-Based Access Control
Permissions are enforced at both API and UI levels:
- Admin sees all features
- Managers can create assets but not modify system settings
- Employees can view assigned assets

### Dark Mode
System-wide dark mode support with:
- Persistent user preference
- All UI components styled for dark mode
- OLED-friendly colors

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `docker ps` or `sudo systemctl status mongod`
- Check connection string in `.env`
- Verify network connectivity

### Port Already in Use
```bash
# Find process using port
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### JWT Token Errors
- Clear browser cache and localStorage
- Logout and login again
- Check JWT_SECRET in .env

### CORS Errors
- Verify FRONTEND_URL in .env matches actual frontend URL
- Check backend server is running

## Development

### Adding a New Feature

1. Create a new route in `server/routes/`
2. Add corresponding API endpoint in Express
3. Create React page component in `src/pages/`
4. Add navigation in Sidebar
5. Implement authentication checks

### Database Migrations
Use MongoDB Compass or command line to manage collections:

```bash
# Connect to MongoDB
mongosh

# View collections
show collections

# View sample document
db.assets.findOne()

# Update documents
db.assets.updateMany({}, { $set: { newField: "value" } })
```

## Performance Optimization

- Lazy load route components
- Implement pagination for large datasets
- Cache frequently accessed settings
- Use database indexes on commonly filtered fields
- Compress assets and use CDN for static files

## Security Considerations

1. **Environment Variables**: Never commit `.env` to git
2. **Password Hashing**: All passwords hashed with bcrypt
3. **JWT Tokens**: Secure httpOnly cookies recommended in production
4. **Rate Limiting**: Implemented on API endpoints
5. **Input Validation**: Server-side validation with Joi
6. **SQL Injection**: Protected by using MongoDB (NoSQL)
7. **HTTPS**: Use in production
8. **CORS**: Configured to accept only frontend URL

## Deployment

### Production Checklist

1. Set production environment variables
2. Build frontend: `npm run build`
3. Update JWT_SECRET to random string
4. Enable HTTPS
5. Use environment-specific database
6. Set up automated backups
7. Enable 2FA for admin accounts
8. Configure email providers
9. Monitor error logs
10. Set up SSL certificates

### Docker Deployment Example

```dockerfile
# Backend
FROM node:18-alpine
WORKDIR /app
COPY server . 
RUN npm install
EXPOSE 5000
CMD ["npm", "start"]

# Frontend
FROM node:18-alpine as builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

## Support & Contributing

For issues, questions, or contributions:
1. Check existing documentation
2. Search closed issues
3. Create detailed issue reports
4. Follow code style conventions

## License

This project is provided as-is for educational and commercial use.

## Version History

- **v1.0.0** - Initial release with core features
  - Asset management system
  - Employee directory
  - Assignment workflow
  - Dashboard and analytics
  - Role-based access control
  - Dark mode support
