# Automatic Cloud Deployment Guide

**Version**: 2.0  
**Last Updated**: January 29, 2026

This guide provides automatic database setup and deployment instructions for AWS, Azure, and DigitalOcean cloud platforms.

---

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Auto-Initialization Features](#auto-initialization-features)
4. [AWS Deployment](#aws-deployment)
5. [Azure Deployment](#azure-deployment)
6. [DigitalOcean Deployment](#digitalocean-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The Asset Management System now includes **automatic database initialization** that:

✅ **Automatically creates collections** when deployed  
✅ **Sets up default admin user** with credentials from environment variables  
✅ **Initializes asset types** (Laptop, Desktop, Monitor, etc.)  
✅ **Creates sample locations** for asset tracking  
✅ **Populates employee records** for testing  
✅ **Sets up system settings** with company information  
✅ **Creates audit logs** for system initialization  
✅ **Runs on first deployment** in production environments  

---

## Prerequisites

### Global Requirements
- Git account with repository
- Docker (for local testing)
- Docker Compose (for local testing)
- Terraform CLI (v1.0+) for IaC deployments

### For AWS
- AWS Account
- AWS CLI configured (`aws configure`)
- IAM user with appropriate permissions
- AWS Elastic Container Registry (ECR) access

### For Azure
- Azure Account
- Azure CLI installed (`az login`)
- Service Principal configured (for Terraform)
- Resource Group access

### For DigitalOcean
- DigitalOcean Account
- DigitalOcean CLI (`doctl`) installed and configured
- API token generated
- GitHub repository connected

---

## Auto-Initialization Features

### Environment Variables for Database Setup

Set these environment variables before deployment:

```bash
# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_EMAIL=admin@yourcompany.com

# Company Information
COMPANY_NAME="Your Company Name"
CURRENCY=USD
TIMEZONE=America/New_York

# Database
AUTO_INIT_DB=true  # Triggers automatic initialization

# JWT Security (Change in production!)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
```

### Default Collections Created

1. **Users** (1 admin user)
2. **Asset Types** (8 types: Laptop, Desktop, Monitor, etc.)
3. **Locations** (3 locations: Main Office, Remote, Warehouse)
4. **Employees** (3 employees for testing)
5. **Assets** (2 sample assets)
6. **Settings** (System configuration)
7. **Audit Logs** (Initialization record)

---

## AWS Deployment

### Option 1: Terraform Automated Deployment (Recommended)

#### Step 1: Prepare AWS Environment

```bash
# Configure AWS CLI
aws configure
# Enter: Access Key ID, Secret Access Key, Region, Output format

# Set environment variables
export AWS_REGION=us-east-1
export AWS_PROFILE=default
```

#### Step 2: Create Terraform Variables File

```bash
cd terraform/aws

# Create terraform.tfvars
cat > terraform.tfvars << 'EOF'
aws_region              = "us-east-1"
project_name            = "asset-management"
environment             = "production"
db_username             = "admin"
db_password             = "YourSecureDbPassword123!"
admin_username          = "admin"
admin_password          = "YourSecureAdminPassword123!"
admin_email             = "admin@yourcompany.com"
company_name            = "Your Company"
jwt_secret              = "your-super-secret-jwt-key-minimum-32-characters-long-string"
backend_image           = "YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/asset-management:latest"
ecs_desired_count       = 2
ecs_min_capacity        = 2
ecs_max_capacity        = 5
docdb_instance_count    = 2
docdb_instance_class    = "db.t3.small"
EOF
```

#### Step 3: Build and Push Docker Image to ECR

```bash
# Create ECR repository
aws ecr create-repository --repository-name asset-management --region us-east-1

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -f Dockerfile -t asset-management:latest ../..

# Tag image
docker tag asset-management:latest YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/asset-management:latest

# Push to ECR
docker push YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/asset-management:latest
```

#### Step 4: Initialize and Deploy with Terraform

```bash
# Initialize Terraform
terraform init

# Plan deployment (review changes)
terraform plan -out=tfplan

# Apply configuration
terraform apply tfplan

# Get outputs
terraform output
```

**Terraform will automatically:**
- Create VPC with public/private subnets
- Set up DocumentDB (MongoDB)
- Configure ECS Cluster and Fargate tasks
- Set up Application Load Balancer
- Create Auto Scaling groups
- Initialize database with admin user and sample data
- Configure CloudWatch monitoring

#### Step 5: Access Application

```bash
# Get the load balancer DNS
ALB_DNS=$(terraform output -raw load_balancer_dns)
echo "Access application at: http://$ALB_DNS"

# Admin credentials
# Username: admin
# Password: (value from terraform.tfvars)
```

### Option 2: AWS Elastic Beanstalk (Simpler Alternative)

```bash
# Navigate to project root
cd /workspaces/codespaces-react

# Create .ebextensions for database setup
mkdir -p .ebextensions

# Create environment initialization config
cat > .ebextensions/init-db.config << 'EOF'
commands:
  01_install_node_deps:
    command: "cd server && npm install"
  02_init_database:
    command: "cd server && node scripts/initializeDatabase.js"
    leader_only: true
    ignoreErrors: true

option_settings:
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    AUTO_INIT_DB: "true"
    ADMIN_USERNAME: admin
    ADMIN_EMAIL: admin@yourcompany.com
EOF

# Deploy with Elastic Beanstalk
eb create asset-management-env \
  --instance-type t3.micro \
  --envvars NODE_ENV=production,AUTO_INIT_DB=true,ADMIN_USERNAME=admin,ADMIN_PASSWORD=YourPassword123!
```

---

## Azure Deployment

### Step 1: Prepare Azure Environment

```bash
# Login to Azure
az login

# Set subscription
az account set --subscription "YOUR_SUBSCRIPTION_ID"

# Set environment variables
export AZURE_LOCATION="East US"
export AZURE_PROJECT_NAME="asset-management"
```

### Step 2: Create Service Principal for Terraform

```bash
# Create service principal
az ad sp create-for-rbac --name terraform --role Contributor

# Save output (will need for Terraform)
```

### Step 3: Create Terraform Variables

```bash
cd terraform/azure

cat > terraform.tfvars << 'EOF'
azure_location    = "East US"
project_name      = "asset-management"
environment       = "production"
app_service_sku   = "B2"
admin_username    = "admin"
admin_password    = "YourSecurePassword123!"
admin_email       = "admin@yourcompany.com"
company_name      = "Your Company"
jwt_secret        = "your-super-secret-jwt-key-minimum-32-characters"
EOF
```

### Step 4: Deploy with Terraform

```bash
# Set service principal credentials
export ARM_CLIENT_ID="<from-az-ad-sp-output>"
export ARM_CLIENT_SECRET="<from-az-ad-sp-output>"
export ARM_SUBSCRIPTION_ID="<your-subscription-id>"
export ARM_TENANT_ID="<from-az-ad-sp-output>"

# Initialize and deploy
terraform init
terraform plan -out=tfplan
terraform apply tfplan

# Get application URLs
terraform output
```

**Terraform will automatically:**
- Create Resource Group
- Set up Virtual Network and Subnets
- Create CosmosDB with MongoDB API
- Deploy App Services for backend and frontend
- Set up Application Insights monitoring
- Configure auto-scaling
- Initialize database with default data

### Step 5: Deploy Code

```bash
# Build and deploy
az webapp deployment source config-zip \
  --resource-group asset-management-rg \
  --name asset-management-backend \
  --src backend.zip

az webapp deployment source config-zip \
  --resource-group asset-management-rg \
  --name asset-management-frontend \
  --src frontend.zip
```

---

## DigitalOcean Deployment

### Step 1: Prepare DigitalOcean

```bash
# Generate API token in DigitalOcean dashboard
# Settings > API > Tokens/Keys > Generate New Token

# Install doctl
brew install doctl  # macOS
sudo apt install doctl  # Ubuntu/Debian

# Authenticate
doctl auth init

# Verify
doctl account get
```

### Step 2: Create GitHub Connection

```bash
# In DigitalOcean dashboard:
# 1. Go to App Platform
# 2. Click "Create Apps"
# 3. Connect GitHub repository
# 4. Authorize DigitalOcean to access your repository
```

### Step 3: Create Terraform Variables

```bash
cd terraform/digitalocean

cat > terraform.tfvars << 'EOF'
digitalocean_token   = "dop_v1_xxxxxxxxxxxx"
project_name         = "asset-management"
environment          = "production"
digitalocean_region  = "nyc3"
github_repo          = "username/asset-management-repo"
github_branch        = "main"
db_username          = "admin"
db_password          = "YourSecurePassword123!"
admin_username       = "admin"
admin_password       = "YourSecureAdminPassword123!"
admin_email          = "admin@yourcompany.com"
company_name         = "Your Company"
jwt_secret           = "your-super-secret-jwt-key-minimum-32-characters"
EOF
```

### Step 4: Deploy with Terraform

```bash
# Initialize Terraform
terraform init

# Plan deployment
terraform plan -out=tfplan

# Apply configuration
terraform apply tfplan

# Get application URL
terraform output app_domain
```

**Terraform will automatically:**
- Create managed MongoDB database
- Deploy backend service to App Platform
- Deploy frontend service to App Platform
- Set up load balancer with SSL
- Configure GitHub integration for auto-deployments
- Initialize database on first deploy
- Set up monitoring and health checks

### Step 5: Monitor Deployment

```bash
# Check deployment status
doctl apps list

# View logs
doctl apps logs <app-id> --component backend

# SSH into container (if needed)
doctl compute ssh <droplet-id>
```

---

## Docker Compose Local Testing

### Test Auto-Initialization Locally

```bash
# Create .env file
cat > .env << 'EOF'
NODE_ENV=production
AUTO_INIT_DB=true
MONGODB_URI=mongodb://admin:password@mongodb:27017/asset-management?authSource=admin
MONGO_USER=admin
MONGO_PASSWORD=password
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin@123456
ADMIN_EMAIL=admin@company.com
COMPANY_NAME="Test Company"
CURRENCY=USD
TIMEZONE=America/New_York
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-string
EOF

# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Test health endpoint
curl http://localhost:5000/api/health

# Test login with auto-created credentials
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123456"}'
```

---

## Troubleshooting

### Database Initialization Not Running

```bash
# Check environment variables
echo $AUTO_INIT_DB  # Should be 'true'

# Check logs
docker-compose logs backend

# Manually trigger initialization
docker exec asset-management-backend node scripts/initializeDatabase.js

# Verify database connection
docker exec asset-management-mongodb mongosh
```

### Connection String Issues

```bash
# AWS DocumentDB URI format
mongodb+srv://username:password@endpoint:27017/asset-management?ssl=true

# Azure CosmosDB URI
mongodb+srv://username:password@endpoint.mongo.cosmos.azure.com/?ssl=true&retryWrites=false

# DigitalOcean Managed MongoDB
mongodb+srv://username:password@endpoint:port/asset-management?retryWrites=true
```

### Admin Credentials Not Working

```bash
# Check if admin user was created
docker exec asset-management-mongodb mongosh
> use asset-management
> db.users.find({username: "admin"})

# Recreate admin user if needed
docker exec -it asset-management-backend node
> const User = require('./models/User');
> User.create({username: 'admin', email: 'admin@company.com', password: 'NewPassword123!', role: 'admin'})
```

### Deployment Stuck or Failed

```bash
# AWS - Check ECS tasks
aws ecs describe-tasks --cluster asset-management --tasks <task-id>

# Azure - Check App Service logs
az webapp log tail --resource-group asset-management-rg --name asset-management-backend

# DigitalOcean - Check app logs
doctl apps logs <app-id>
```

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `AUTO_INIT_DB` | false | Enable automatic database initialization |
| `NODE_ENV` | development | Environment mode |
| `MONGODB_URI` | localhost | Database connection string |
| `ADMIN_USERNAME` | admin | Admin user username |
| `ADMIN_PASSWORD` | Admin@123456 | Admin user password |
| `ADMIN_EMAIL` | admin@company.com | Admin email address |
| `COMPANY_NAME` | Your Company | Company name in UI |
| `JWT_SECRET` | random | JWT signing key (32+ chars) |
| `CURRENCY` | USD | Default currency |
| `TIMEZONE` | America/New_York | System timezone |

---

## Next Steps

1. ✅ Deploy to your chosen cloud provider
2. ✅ Access the application with default credentials
3. ✅ Change admin password immediately
4. ✅ Add real employees and asset data
5. ✅ Configure email notifications
6. ✅ Set up backup schedule
7. ✅ Enable SSL/HTTPS certificate
8. ✅ Monitor application performance

For more information, see:
- [CLOUD_DEPLOYMENT_GUIDE.md](../CLOUD_DEPLOYMENT_GUIDE.md)
- [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)
- [DATABASE_MIGRATION_GUIDE.md](../DATABASE_MIGRATION_GUIDE.md)
