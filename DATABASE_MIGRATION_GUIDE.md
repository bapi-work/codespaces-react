# Database Configuration Guide: MongoDB, PostgreSQL, MySQL & MariaDB

**Version**: 1.0  
**Last Updated**: January 27, 2026

This guide covers migrating from MongoDB to PostgreSQL, MySQL, or MariaDB, with complete implementation examples and Sequelize ORM setup.

---

## Table of Contents
1. [Database Comparison](#database-comparison)
2. [Migration Strategy](#migration-strategy)
3. [PostgreSQL Setup & Migration](#postgresql-setup--migration)
4. [MySQL/MariaDB Setup & Migration](#mysqlmariadb-setup--migration)
5. [Schema Definitions](#schema-definitions)
6. [Sequelize ORM Setup](#sequelize-orm-setup)
7. [Data Migration](#data-migration)
8. [Backup & Recovery](#backup--recovery)
9. [Performance Tuning](#performance-tuning)
10. [Troubleshooting](#troubleshooting)

---

## Database Comparison

| Feature | MongoDB | PostgreSQL | MySQL | MariaDB |
|---------|---------|------------|-------|---------|
| **Type** | NoSQL Document | Relational SQL | Relational SQL | Relational SQL (MySQL fork) |
| **Schema** | Flexible | Rigid (enforced) | Rigid (enforced) | Rigid (enforced) |
| **Transactions** | Multi-doc (4.0+) | Full ACID | Basic ACID | Full ACID |
| **Performance** | Excellent for reads | Excellent balanced | Very Good | Very Good |
| **Complexity** | Low | Medium | Low | Low |
| **Cloud Options** | MongoDB Atlas | AWS RDS, Azure, GCP | AWS RDS, Azure, GCP | AWS RDS, Azure, DigitalOcean |
| **Cost** | Medium | Medium | Low | Low |
| **Best For** | Rapid development | Enterprise apps | Web apps | Open-source projects |

---

## Migration Strategy

### Phase 1: Planning & Assessment
- [ ] Document current MongoDB schema
- [ ] List all collections and relationships
- [ ] Identify data types for conversion
- [ ] Plan downtime window
- [ ] Backup all MongoDB data

### Phase 2: Schema Design
- [ ] Create relational schema design
- [ ] Design migration mapping
- [ ] Create test database
- [ ] Setup ORM models

### Phase 3: Code Migration
- [ ] Install new database driver
- [ ] Update data models
- [ ] Create migration scripts
- [ ] Update API routes

### Phase 4: Testing
- [ ] Migrate sample data
- [ ] Validate data integrity
- [ ] Test all API endpoints
- [ ] Load testing

### Phase 5: Production Migration
- [ ] Backup MongoDB
- [ ] Perform full migration
- [ ] Validate data
- [ ] Switch application
- [ ] Monitor closely

### Phase 6: Cleanup
- [ ] Archive old MongoDB
- [ ] Update documentation
- [ ] Remove old drivers
- [ ] Monitor performance

---

## PostgreSQL Setup & Migration

### Installation

#### Local Development
```bash
# macOS with Homebrew
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Docker (Recommended)
docker run -d \
  --name postgresql \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=asset_management \
  -p 5432:5432 \
  postgres:15

# Verify connection
psql -U admin -d asset_management -h localhost
```

#### Cloud Providers
```bash
# AWS RDS
aws rds create-db-instance \
  --db-instance-identifier asset-management \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.1 \
  --master-username admin \
  --master-user-password <password> \
  --allocated-storage 20

# Azure Database for PostgreSQL
az postgres server create \
  --resource-group asset-management-rg \
  --name asset-management-db \
  --location eastus \
  --admin-user admin \
  --admin-password <password> \
  --sku-name B_Gen5_1

# Google Cloud SQL
gcloud sql instances create asset-management \
  --database-version POSTGRES_15 \
  --tier db-f1-micro \
  --region us-central1
```

### Schema Creation

```sql
-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
  is_active BOOLEAN DEFAULT true,
  two_fa_enabled BOOLEAN DEFAULT false,
  two_fa_secret VARCHAR(255),
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees Table
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  department VARCHAR(100),
  designation VARCHAR(100),
  manager_id INTEGER REFERENCES employees(id),
  employment_type VARCHAR(50) CHECK (employment_type IN ('FT', 'PT', 'Contractor', 'Intern')),
  date_of_joining DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id)
);

-- Locations Table
CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  currency VARCHAR(10) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset Types Table
CREATE TABLE asset_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  custom_fields JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets Table
CREATE TABLE assets (
  id SERIAL PRIMARY KEY,
  asset_tag VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type_id INTEGER NOT NULL REFERENCES asset_types(id),
  status VARCHAR(50) NOT NULL CHECK (status IN ('available', 'assigned', 'in_maintenance', 'retired', 'lost')),
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100) UNIQUE,
  purchase_date DATE,
  purchase_price DECIMAL(12, 2),
  salvage_value DECIMAL(12, 2),
  useful_life_years INTEGER,
  depreciation_method VARCHAR(50) CHECK (depreciation_method IN ('straight_line', 'declining_balance')),
  location_id INTEGER REFERENCES locations(id),
  assigned_to INTEGER REFERENCES employees(id),
  qr_code TEXT,
  photo_url TEXT,
  warranty_expiry DATE,
  notes TEXT,
  custom_fields JSONB,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assignments Table
CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  employee_id INTEGER NOT NULL REFERENCES employees(id),
  check_out_date TIMESTAMP NOT NULL,
  check_in_date TIMESTAMP,
  check_out_notes TEXT,
  check_in_notes TEXT,
  check_in_condition VARCHAR(50),
  status VARCHAR(50) CHECK (status IN ('active', 'returned', 'lost')),
  assigned_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INTEGER,
  entity_name VARCHAR(255),
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings Table
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255),
  company_logo_url TEXT,
  company_website VARCHAR(255),
  header_text TEXT,
  footer_text TEXT,
  default_currency VARCHAR(10),
  email_provider VARCHAR(50),
  email_from VARCHAR(100),
  smtp_host VARCHAR(255),
  smtp_port INTEGER,
  smtp_user VARCHAR(100),
  smtp_password TEXT,
  sendgrid_api_key TEXT,
  office365_email VARCHAR(100),
  office365_password TEXT,
  notifications_enabled BOOLEAN DEFAULT true,
  assignment_notification BOOLEAN DEFAULT true,
  warranty_expiry_notification BOOLEAN DEFAULT true,
  return_reminder_notification BOOLEAN DEFAULT true,
  dark_mode_default BOOLEAN DEFAULT false,
  two_fa_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_assigned_to ON assets(assigned_to);
CREATE INDEX idx_assets_location ON assets(location_id);
CREATE INDEX idx_assignments_asset_id ON assignments(asset_id);
CREATE INDEX idx_assignments_employee_id ON assignments(employee_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_users_role ON users(role);
```

### Environment Variables
```bash
# .env for PostgreSQL
DATABASE_URL=postgresql://admin:password@localhost:5432/asset_management
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=admin
DB_PASSWORD=password
DB_NAME=asset_management
```

---

## MySQL/MariaDB Setup & Migration

### Installation

#### Local Development
```bash
# macOS with Homebrew
brew install mysql@8.0

# Ubuntu/Debian
sudo apt-get install mysql-server

# Docker
docker run -d \
  --name mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=asset_management \
  -e MYSQL_USER=admin \
  -e MYSQL_PASSWORD=password \
  -p 3306:3306 \
  mysql:8.0

# Test connection
mysql -u admin -p -h localhost asset_management
```

#### Cloud Providers
```bash
# AWS RDS MySQL
aws rds create-db-instance \
  --db-instance-identifier asset-management \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --engine-version 8.0.28 \
  --master-username admin \
  --master-user-password <password> \
  --allocated-storage 20

# Azure Database for MySQL
az mysql server create \
  --resource-group asset-management-rg \
  --name asset-management-db \
  --location eastus \
  --admin-user admin \
  --admin-password <password> \
  --sku-name B_Gen5_1

# DigitalOcean Managed Database
doctl databases create asset-management \
  --engine mysql \
  --region nyc3 \
  --num-nodes 1 \
  --version 8.0
```

### Schema Creation (MySQL Syntax)

```sql
-- Create Database
CREATE DATABASE IF NOT EXISTS asset_management;
USE asset_management;

-- Users Table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'employee') NOT NULL,
  is_active BOOLEAN DEFAULT true,
  two_fa_enabled BOOLEAN DEFAULT false,
  two_fa_secret VARCHAR(255),
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_role (role),
  KEY idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Employees Table
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  department VARCHAR(100),
  designation VARCHAR(100),
  manager_id INT,
  employment_type ENUM('FT', 'PT', 'Contractor', 'Intern'),
  date_of_joining DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id),
  KEY idx_department (department),
  KEY idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Locations Table
CREATE TABLE locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  currency VARCHAR(10) DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Asset Types Table
CREATE TABLE asset_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  custom_fields JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assets Table
CREATE TABLE assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_tag VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type_id INT NOT NULL,
  status ENUM('available', 'assigned', 'in_maintenance', 'retired', 'lost') NOT NULL,
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100) UNIQUE,
  purchase_date DATE,
  purchase_price DECIMAL(12, 2),
  salvage_value DECIMAL(12, 2),
  useful_life_years INT,
  depreciation_method ENUM('straight_line', 'declining_balance'),
  location_id INT,
  assigned_to INT,
  qr_code LONGTEXT,
  photo_url TEXT,
  warranty_expiry DATE,
  notes LONGTEXT,
  custom_fields JSON,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (type_id) REFERENCES asset_types(id),
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id),
  KEY idx_status (status),
  KEY idx_assigned_to (assigned_to),
  KEY idx_location (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assignments Table
CREATE TABLE assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asset_id INT NOT NULL,
  employee_id INT NOT NULL,
  check_out_date TIMESTAMP NOT NULL,
  check_in_date TIMESTAMP NULL,
  check_out_notes TEXT,
  check_in_notes TEXT,
  check_in_condition VARCHAR(50),
  status ENUM('active', 'returned', 'lost') NOT NULL,
  assigned_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (assigned_by) REFERENCES users(id),
  KEY idx_asset_id (asset_id),
  KEY idx_employee_id (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs Table
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INT,
  entity_name VARCHAR(255),
  details JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  KEY idx_user_id (user_id),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings Table
CREATE TABLE settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(255),
  company_logo_url TEXT,
  company_website VARCHAR(255),
  header_text TEXT,
  footer_text TEXT,
  default_currency VARCHAR(10),
  email_provider VARCHAR(50),
  email_from VARCHAR(100),
  smtp_host VARCHAR(255),
  smtp_port INT,
  smtp_user VARCHAR(100),
  smtp_password TEXT,
  sendgrid_api_key TEXT,
  office365_email VARCHAR(100),
  office365_password TEXT,
  notifications_enabled BOOLEAN DEFAULT true,
  assignment_notification BOOLEAN DEFAULT true,
  warranty_expiry_notification BOOLEAN DEFAULT true,
  return_reminder_notification BOOLEAN DEFAULT true,
  dark_mode_default BOOLEAN DEFAULT false,
  two_fa_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Environment Variables
```bash
# .env for MySQL/MariaDB
DATABASE_URL=mysql://admin:password@localhost:3306/asset_management
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=password
DB_NAME=asset_management
```

---

## Sequelize ORM Setup

### Installation
```bash
npm install sequelize mysql2 # For MySQL
npm install sequelize pg pg-hstore # For PostgreSQL
npm install sequelize sequelize-cli -D # For migrations
```

### Configuration
```javascript
// config/database.js
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_TYPE || 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000
    }
  }
);

export default sequelize;
```

### Model Example: User
```javascript
// models/User.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcryptjs from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    validate: {
      len: [3, 100]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'employee'),
    defaultValue: 'employee'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      user.passwordHash = await bcryptjs.hash(user.passwordHash, 10);
    }
  }
});

// Method to compare passwords
User.prototype.comparePassword = async function(password) {
  return await bcryptjs.compare(password, this.passwordHash);
};

export default User;
```

### Model Example: Asset
```javascript
// models/Asset.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import moment from 'moment';

const Asset = sequelize.define('Asset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  assetTag: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  typeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('available', 'assigned', 'in_maintenance', 'retired', 'lost'),
    defaultValue: 'available'
  },
  manufacturer: {
    type: DataTypes.STRING(100)
  },
  serialNumber: {
    type: DataTypes.STRING(100),
    unique: true
  },
  purchaseDate: {
    type: DataTypes.DATE
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(12, 2)
  },
  salvageValue: {
    type: DataTypes.DECIMAL(12, 2)
  },
  usefulLifeYears: {
    type: DataTypes.INTEGER
  },
  depreciationMethod: {
    type: DataTypes.ENUM('straight_line', 'declining_balance')
  },
  qrCode: {
    type: DataTypes.TEXT
  },
  photoUrl: {
    type: DataTypes.TEXT
  }
}, {
  timestamps: true,
  underscored: true
});

// Method to calculate depreciation
Asset.prototype.calculateDepreciation = function() {
  if (!this.purchaseDate || !this.purchasePrice) return this.purchasePrice;

  const monthsElapsed = moment().diff(moment(this.purchaseDate), 'months');
  const totalMonths = (this.usefulLifeYears || 5) * 12;
  const salvageValue = this.salvageValue || 0;

  if (this.depreciationMethod === 'straight_line') {
    const monthlyDepreciation = (this.purchasePrice - salvageValue) / totalMonths;
    const totalDepreciation = monthlyDepreciation * monthsElapsed;
    return Math.max(this.purchasePrice - totalDepreciation, salvageValue);
  } else {
    const monthlyRate = (this.purchasePrice - salvageValue) / totalMonths;
    let currentValue = this.purchasePrice;
    for (let i = 0; i < monthsElapsed; i++) {
      currentValue -= monthlyRate;
    }
    return Math.max(currentValue, salvageValue);
  }
};

export default Asset;
```

---

## Data Migration

### Migration Script
```javascript
// scripts/migrate-mongo-to-sql.js
import mongoose from 'mongoose';
import sequelize from '../config/database.js';
import User from '../models/User.js';
import Asset from '../models/Asset.js';
import Employee from '../models/Employee.js';
// ... import all models

async function migrateData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    // Connect to SQL Database
    await sequelize.authenticate();
    await sequelize.sync();

    console.log('Starting data migration...');

    // Migrate Users
    const mongoUsers = await mongoose.connection.collection('users').find({}).toArray();
    for (const user of mongoUsers) {
      await User.create({
        username: user.username,
        email: user.email,
        passwordHash: user.password,
        role: user.role
      });
    }
    console.log(`Migrated ${mongoUsers.length} users`);

    // Migrate Assets
    const mongoAssets = await mongoose.connection.collection('assets').find({}).toArray();
    for (const asset of mongoAssets) {
      await Asset.create({
        assetTag: asset.assetTag,
        name: asset.name,
        description: asset.description,
        typeId: asset.type,
        status: asset.status,
        // ... map all fields
      });
    }
    console.log(`Migrated ${mongoAssets.length} assets`);

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateData();
```

### Run Migration
```bash
# Backup MongoDB first
mongoexport --uri "mongodb://localhost:27017/asset_management" --out backup.json

# Run migration
node scripts/migrate-mongo-to-sql.js

# Verify data
npm run verify-migration
```

---

## Backup & Recovery

### PostgreSQL

#### Backup
```bash
# Full backup
pg_dump -U admin -h localhost asset_management > backup.sql

# Compressed backup
pg_dump -U admin -h localhost asset_management | gzip > backup.sql.gz

# Custom format (faster restore)
pg_dump -U admin -h localhost -Fc asset_management > backup.dump

# Scheduled backup
0 2 * * * pg_dump -U admin asset_management | gzip > /backups/asset_$(date +\%Y\%m\%d).sql.gz
```

#### Restore
```bash
# Restore from SQL
psql -U admin asset_management < backup.sql

# Restore from compressed
gunzip < backup.sql.gz | psql -U admin asset_management

# Restore from custom format
pg_restore -U admin -d asset_management backup.dump
```

### MySQL/MariaDB

#### Backup
```bash
# Full backup
mysqldump -u admin -p asset_management > backup.sql

# Compressed backup
mysqldump -u admin -p asset_management | gzip > backup.sql.gz

# Backup all databases
mysqldump -u admin -p --all-databases > full-backup.sql

# Scheduled backup
0 2 * * * mysqldump -u admin -p${DB_PASSWORD} asset_management | gzip > /backups/asset_$(date +\%Y\%m\%d).sql.gz
```

#### Restore
```bash
# Restore from SQL
mysql -u admin -p asset_management < backup.sql

# Restore from compressed
gunzip < backup.sql.gz | mysql -u admin -p asset_management
```

---

## Performance Tuning

### PostgreSQL
```sql
-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM assets WHERE status = 'available';

-- Vacuum and analyze
VACUUM ANALYZE;

-- Create partial index
CREATE INDEX idx_available_assets ON assets(id) WHERE status = 'available';

-- Connection pooling with pgbouncer
-- Install: sudo apt-get install pgbouncer
```

### MySQL
```sql
-- Analyze query
EXPLAIN SELECT * FROM assets WHERE status = 'available';

-- Optimize table
OPTIMIZE TABLE assets;

-- Check query cache
SHOW VARIABLES LIKE 'query_cache%';

-- Connection pooling with ProxySQL
-- Install: https://www.proxysql.com/
```

### Application Level
```javascript
// Connection pooling
const sequelize = new Sequelize(..., {
  pool: {
    max: 20,      // Maximum connections
    min: 5,       // Minimum connections
    acquire: 30000, // Timeout in ms
    idle: 10000   // Idle timeout in ms
  }
});

// Query optimization
const assets = await Asset.findAll({
  attributes: ['id', 'name', 'status'], // Only select needed columns
  include: [{
    model: Employee,
    attributes: ['firstName', 'lastName']
  }],
  limit: 10,
  offset: 0,
  raw: true // Get plain objects instead of model instances
});
```

---

## Troubleshooting

### Connection Issues
```bash
# Test PostgreSQL connection
psql -U admin -h localhost -d asset_management -c "SELECT 1"

# Test MySQL connection
mysql -u admin -p -h localhost -e "SELECT 1"

# Check if ports are open
netstat -tuln | grep 5432  # PostgreSQL
netstat -tuln | grep 3306  # MySQL
```

### Performance Issues
```sql
-- Find slow queries (PostgreSQL)
SELECT query, calls, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;

-- Find slow queries (MySQL)
SHOW FULL PROCESSLIST;
SELECT * FROM performance_schema.events_statements_summary_by_digest ORDER BY SUM_TIMER_WAIT DESC;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables WHERE schemaname != 'information_schema' ORDER BY pg_total_relation_size DESC;
```

### Data Integrity
```javascript
// Verify foreign keys
const assetCountWithoutEmployee = await Asset.count({
  where: { assignedTo: null }
});

// Check for orphaned records
const orphanedAssets = await Asset.findAll({
  include: [{
    model: Employee,
    required: false
  }],
  where: { assignedToId: { [Op.ne]: null } }
  // Find missing references
});
```

---

## Migration Checklist

- [ ] Backup MongoDB
- [ ] Design relational schema
- [ ] Install and configure PostgreSQL/MySQL
- [ ] Create database and tables
- [ ] Create migration script
- [ ] Test migration with sample data
- [ ] Update code to use Sequelize ORM
- [ ] Update environment variables
- [ ] Run full migration
- [ ] Validate data integrity
- [ ] Update API tests
- [ ] Deploy to staging
- [ ] Test all features
- [ ] Deploy to production
- [ ] Monitor closely for 48 hours
- [ ] Archive MongoDB backup

---

## Additional Resources

- [Sequelize Documentation](https://sequelize.org/)
- [PostgreSQL Official Docs](https://www.postgresql.org/docs/)
- [MySQL Official Docs](https://dev.mysql.com/doc/)
- [MariaDB Official Docs](https://mariadb.com/docs/)
- [Database Migration Best Practices](https://en.wikipedia.org/wiki/Database_migration)

---

**Need Help?** Contact your database administrator or DevOps team.
