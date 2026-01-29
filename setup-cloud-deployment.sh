#!/bin/bash

# Asset Management System - Cloud Deployment Setup Script
# This script prepares and validates your environment for cloud deployment

set -e

echo "🚀 Asset Management System - Cloud Deployment Setup"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check prerequisites
echo -e "${BLUE}Checking Prerequisites...${NC}\n"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not found. Please install Node.js 22 or higher."
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status "npm installed: $NPM_VERSION"
else
    print_error "npm not found."
    exit 1
fi

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_status "Docker installed: $DOCKER_VERSION"
else
    print_warning "Docker not found. Required for containerized deployment."
fi

# Check Terraform
if command -v terraform &> /dev/null; then
    TERRAFORM_VERSION=$(terraform --version | head -n 1)
    print_status "Terraform installed: $TERRAFORM_VERSION"
else
    print_warning "Terraform not found. Required for Infrastructure as Code deployment."
fi

echo ""
echo -e "${BLUE}Checking Project Structure...${NC}\n"

# Check project files
required_files=(
    "package.json"
    "server/package.json"
    "server/server.js"
    "Dockerfile"
    "docker-compose.yml"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_status "Found: $file"
    else
        print_error "Missing: $file"
        exit 1
    fi
done

echo ""
echo -e "${BLUE}Setting Up Environment Variables...${NC}\n"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_info "Creating .env file..."
    
    read -p "Enter AWS Region (default: us-east-1): " aws_region
    aws_region=${aws_region:-us-east-1}
    
    read -p "Enter Admin Username (default: admin): " admin_username
    admin_username=${admin_username:-admin}
    
    read -sp "Enter Admin Password: " admin_password
    echo ""
    
    read -p "Enter Admin Email: " admin_email
    
    read -p "Enter Company Name: " company_name
    
    read -p "Enter Currency (default: USD): " currency
    currency=${currency:-USD}
    
    # Generate JWT secret
    jwt_secret=$(openssl rand -base64 32)
    
    cat > .env << EOF
# Environment Configuration
NODE_ENV=production
AUTO_INIT_DB=true

# AWS Configuration
AWS_REGION=$aws_region

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/asset-management
MONGO_USER=admin
MONGO_PASSWORD=password

# Admin User
ADMIN_USERNAME=$admin_username
ADMIN_PASSWORD=$admin_password
ADMIN_EMAIL=$admin_email

# Company Information
COMPANY_NAME=$company_name
CURRENCY=$currency
TIMEZONE=America/New_York

# Security
JWT_SECRET=$jwt_secret

# API
FRONTEND_URL=http://localhost:3000
PORT=5000
EOF
    
    print_status ".env file created"
else
    print_status ".env file already exists"
fi

echo ""
echo -e "${BLUE}Building Docker Images...${NC}\n"

# Build backend image
print_info "Building backend Docker image..."
docker build -f Dockerfile -t asset-management:latest .
print_status "Backend image built"

# Build frontend image
print_info "Building frontend Docker image..."
docker build -f Dockerfile.frontend -t asset-management-frontend:latest .
print_status "Frontend image built"

echo ""
echo -e "${BLUE}Testing Local Deployment...${NC}\n"

# Ask user if they want to test locally
read -p "Do you want to test the deployment locally with Docker Compose? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Starting Docker Compose..."
    docker-compose up -d
    
    print_info "Waiting for services to start..."
    sleep 10
    
    # Test health endpoint
    print_info "Testing health endpoint..."
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        print_status "Backend is running and healthy"
    else
        print_warning "Backend health check failed"
    fi
    
    # Test frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_status "Frontend is running"
    else
        print_warning "Frontend not responding"
    fi
    
    print_info "Local deployment successful!"
    echo ""
    echo -e "${GREEN}Access Application:${NC}"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:5000"
    echo ""
    echo -e "${GREEN}Default Credentials:${NC}"
    echo "  Username: admin"
    echo "  Password: (from .env file)"
    echo ""
fi

echo ""
echo -e "${BLUE}Cloud Deployment Setup...${NC}\n"

echo "Choose your cloud provider:"
echo "1) AWS"
echo "2) Azure"
echo "3) DigitalOcean"
echo "4) Skip cloud setup"
read -p "Enter your choice (1-4): " cloud_choice

case $cloud_choice in
    1)
        print_info "AWS Deployment Setup"
        echo ""
        echo "Prerequisites:"
        echo "1. Create AWS Account (https://aws.amazon.com)"
        echo "2. Create IAM User with programmatic access"
        echo "3. Configure AWS CLI: aws configure"
        echo ""
        read -p "Have you configured AWS CLI? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Preparing Terraform configuration..."
            
            read -p "Enter AWS Account ID: " aws_account_id
            read -p "Enter AWS Region: " aws_region_tf
            
            cat > terraform/aws/terraform.tfvars << EOF
aws_region              = "$aws_region_tf"
project_name            = "asset-management"
environment             = "production"
backend_image           = "$aws_account_id.dkr.ecr.$aws_region_tf.amazonaws.com/asset-management:latest"
admin_email             = "$admin_email"
company_name            = "$company_name"
jwt_secret              = "$(openssl rand -base64 32)"
EOF
            
            print_status "Terraform configuration created at: terraform/aws/terraform.tfvars"
            echo ""
            echo "Next steps:"
            echo "1. Push Docker image to ECR: ./deploy-aws.sh"
            echo "2. Deploy infrastructure: cd terraform/aws && terraform apply"
        fi
        ;;
    2)
        print_info "Azure Deployment Setup"
        echo ""
        echo "Prerequisites:"
        echo "1. Create Azure Account (https://azure.microsoft.com)"
        echo "2. Install Azure CLI: az login"
        echo "3. Create Service Principal for Terraform"
        echo ""
        read -p "Have you configured Azure CLI? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Preparing Terraform configuration..."
            
            cat > terraform/azure/terraform.tfvars << EOF
azure_location  = "East US"
project_name    = "asset-management"
environment     = "production"
admin_email     = "$admin_email"
company_name    = "$company_name"
jwt_secret      = "$(openssl rand -base64 32)"
EOF
            
            print_status "Terraform configuration created at: terraform/azure/terraform.tfvars"
            echo ""
            echo "Next steps:"
            echo "1. Create Service Principal: az ad sp create-for-rbac --name terraform"
            echo "2. Deploy infrastructure: cd terraform/azure && terraform apply"
        fi
        ;;
    3)
        print_info "DigitalOcean Deployment Setup"
        echo ""
        echo "Prerequisites:"
        echo "1. Create DigitalOcean Account (https://digitalocean.com)"
        echo "2. Generate API Token in dashboard"
        echo "3. Push code to GitHub repository"
        echo ""
        read -p "Have you generated DigitalOcean API token? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -sp "Enter DigitalOcean API Token: " do_token
            echo ""
            read -p "Enter GitHub Repository (owner/repo): " github_repo
            
            print_info "Preparing Terraform configuration..."
            
            cat > terraform/digitalocean/terraform.tfvars << EOF
digitalocean_token   = "$do_token"
project_name         = "asset-management"
environment          = "production"
github_repo          = "$github_repo"
github_branch        = "main"
admin_email          = "$admin_email"
company_name         = "$company_name"
jwt_secret           = "$(openssl rand -base64 32)"
EOF
            
            print_status "Terraform configuration created at: terraform/digitalocean/terraform.tfvars"
            echo ""
            echo "Next steps:"
            echo "1. Commit and push code to GitHub"
            echo "2. Deploy infrastructure: cd terraform/digitalocean && terraform apply"
        fi
        ;;
    *)
        print_info "Skipping cloud setup"
        ;;
esac

echo ""
echo -e "${GREEN}Setup Complete!${NC}"
echo ""
echo "📚 Documentation:"
echo "  - Cloud Deployment Guide: AUTOMATIC_CLOUD_DEPLOYMENT.md"
echo "  - Deployment Guide: DEPLOYMENT_GUIDE.md"
echo "  - Database Setup: DATABASE_MIGRATION_GUIDE.md"
echo ""
echo "🎯 Next Steps:"
echo "  1. Review .env file and update credentials"
echo "  2. Test locally with: docker-compose up"
echo "  3. Deploy to cloud provider of your choice"
echo "  4. Monitor application health"
echo ""
