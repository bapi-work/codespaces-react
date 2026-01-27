# Cloud Deployment Guide

**Version**: 1.0  
**Last Updated**: January 27, 2026

This comprehensive guide covers deploying the Asset Management System to major cloud platforms with complete instructions for each provider.

---

## Table of Contents
1. [Cloud Platform Comparison](#cloud-platform-comparison)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [AWS Deployment](#aws-deployment)
4. [Azure Deployment](#azure-deployment)
5. [Google Cloud Deployment](#google-cloud-deployment)
6. [DigitalOcean Deployment](#digitalocean-deployment)
7. [Heroku Deployment](#heroku-deployment)
8. [Database Options](#database-options)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Monitoring & Scaling](#monitoring--scaling)
11. [Cost Optimization](#cost-optimization)
12. [Troubleshooting](#troubleshooting)

---

## Cloud Platform Comparison

| Feature | AWS | Azure | Google Cloud | DigitalOcean | Heroku |
|---------|-----|-------|--------------|--------------|--------|
| **Difficulty** | Medium | Medium | Hard | Easy | Very Easy |
| **Cost** | $$$ | $$$ | $$$ | $ | $$ |
| **Performance** | Excellent | Excellent | Excellent | Very Good | Good |
| **Managed DB** | RDS | Cosmos DB | Cloud SQL | Managed DB | Database Add-on |
| **Free Tier** | 12 months | 12 months | $300 credit | N/A | 5 free apps |
| **Best For** | Enterprise | Enterprise | Startups | SMB | Rapid Prototyping |

---

## Pre-Deployment Checklist

### Code Repository
- [ ] Code committed to GitHub/GitLab/Bitbucket
- [ ] `.env` file excluded from version control (.gitignore)
- [ ] All secrets in environment variables
- [ ] Build scripts defined in package.json
- [ ] Docker image tested locally

### Environment Variables
- [ ] JWT_SECRET configured (32+ character random string)
- [ ] DATABASE_URL configured correctly
- [ ] NODE_ENV set to production
- [ ] API endpoints updated for production domain
- [ ] Email credentials secured

### Database
- [ ] Database backed up
- [ ] Indices created for performance
- [ ] Connection pooling configured
- [ ] Database user created with limited permissions
- [ ] Database version matches development

### Application
- [ ] All tests pass (`npm test`)
- [ ] No console errors or warnings
- [ ] Security audit passed (see SECURITY_AUDIT_REPORT.md)
- [ ] Production build tested locally (`npm run build`)
- [ ] All features tested in production mode

### Monitoring
- [ ] Error logging configured
- [ ] Performance monitoring setup
- [ ] Database monitoring configured
- [ ] Alert thresholds defined
- [ ] Backup strategy documented

---

## AWS Deployment

### Option 1: Elastic Beanstalk (Recommended for beginners)

#### Step 1: Prepare Application
```bash
# Create .ebextensions directory for configuration
mkdir -p .ebextensions

# Create nodejs configuration
cat > .ebextensions/nodecommand.config << 'EOF'
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeVersion: 22.15.0
    ProxyServer: nginx
EOF

# Create environment variables config
cat > .ebextensions/environment.config << 'EOF'
option_settings:
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    JWT_SECRET: ${JWT_SECRET}
    MONGODB_URI: ${MONGODB_URI}
EOF
```

#### Step 2: Install AWS CLI and EB CLI
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install Elastic Beanstalk CLI
pip install awsebcli --upgrade --user

# Configure AWS credentials
aws configure
# Enter: AWS Access Key ID
# Enter: AWS Secret Access Key
# Enter: Region (e.g., us-east-1)
# Enter: Output format (json)
```

#### Step 3: Initialize and Deploy
```bash
# Initialize Elastic Beanstalk
eb init -p "Node.js 22 running on 64bit Amazon Linux 2" asset-management-api

# Create environment
eb create asset-management-prod --instance-type t3.medium

# Set environment variables
eb setenv JWT_SECRET="<your-secret>" MONGODB_URI="<your-uri>"

# Deploy
eb deploy

# View logs
eb logs

# Monitor application
eb status
eb health
```

#### Step 4: Configure RDS Database
```bash
# Add RDS database to Elastic Beanstalk environment
# (Using AWS Console or AWS CLI)
# Database Type: MongoDB Atlas or Amazon DocumentDB
# Instance: db.t3.small (or larger)
# Backup Retention: 7 days
```

#### Step 5: Setup Auto-scaling
```bash
# Create scaling configuration
cat > .ebextensions/autoscale.config << 'EOF'
option_settings:
  aws:autoscaling:asg:
    MinSize: 2
    MaxSize: 6
  aws:autoscaling:trigger:
    MeasureName: CPUUtilization
    Statistic: Average
    Unit: Percent
    UpperThreshold: 70
    LowerThreshold: 30
EOF
```

---

### Option 2: ECS with Fargate (More Control)

#### Step 1: Create ECR Repository
```bash
# Create Docker image repository
aws ecr create-repository --repository-name asset-management

# Get login token and login to Docker
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push image
docker build -t asset-management:latest .
docker tag asset-management:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/asset-management:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/asset-management:latest
```

#### Step 2: Create ECS Cluster
```bash
# Create cluster
aws ecs create-cluster --cluster-name asset-management-cluster

# Create task definition
cat > task-definition.json << 'EOF'
{
  "family": "asset-management",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "asset-management",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/asset-management:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "hostPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:account:secret:jwt-secret"
        },
        {
          "name": "MONGODB_URI",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:account:secret:mongodb-uri"
        }
      ]
    }
  ]
}
EOF

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster asset-management-cluster \
  --service-name asset-management-service \
  --task-definition asset-management:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}"
```

#### Step 3: Setup Application Load Balancer
```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name asset-management-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx \
  --scheme internet-facing

# Create target group
aws elbv2 create-target-group \
  --name asset-management-tg \
  --protocol HTTP \
  --port 5000 \
  --vpc-id vpc-xxx

# Register targets and create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:...
```

---

### Option 3: EC2 + Auto Scaling

#### Step 1: Launch EC2 Instance
```bash
# Create security group
aws ec2 create-security-group \
  --group-name asset-management-sg \
  --description "Asset Management Application"

# Add inbound rules
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxx \
  --protocol tcp \
  --port 5000 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id sg-xxx \
  --protocol tcp \
  --port 22 \
  --cidr your-ip/32

# Launch instance
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-xxx \
  --user-data file://setup.sh
```

#### Step 2: Create Launch Template
```bash
# Create launch template for auto-scaling
aws ec2 create-launch-template \
  --launch-template-name asset-management-lt \
  --launch-template-data '{
    "ImageId":"ami-0c55b159cbfafe1f0",
    "InstanceType":"t3.medium",
    "KeyName":"your-key-pair",
    "SecurityGroupIds":["sg-xxx"]
  }'
```

---

## Azure Deployment

### Option 1: Azure App Service (Recommended)

#### Step 1: Install Azure CLI
```bash
# Install Azure CLI
curl https://aka.ms/InstallAzureCLIDeb | bash

# Login to Azure
az login

# Set subscription
az account set --subscription "subscription-id"
```

#### Step 2: Create Resource Group
```bash
# Create resource group
az group create \
  --name asset-management-rg \
  --location eastus
```

#### Step 3: Create App Service Plan
```bash
# Create App Service Plan
az appservice plan create \
  --name asset-management-plan \
  --resource-group asset-management-rg \
  --sku B2 \
  --is-linux
```

#### Step 4: Deploy Application
```bash
# Create web app
az webapp create \
  --resource-group asset-management-rg \
  --plan asset-management-plan \
  --name asset-management-api \
  --runtime "NODE|22-LTS"

# Configure deployment from GitHub
az webapp deployment source config \
  --name asset-management-api \
  --resource-group asset-management-rg \
  --repo-url https://github.com/your-repo/asset-management \
  --branch main \
  --git-token your-github-token

# Set environment variables
az webapp config appsettings set \
  --resource-group asset-management-rg \
  --name asset-management-api \
  --settings \
    NODE_ENV=production \
    JWT_SECRET="<your-secret>" \
    MONGODB_URI="<your-uri>"
```

#### Step 5: Setup Database
```bash
# Create Cosmos DB for MongoDB
az cosmosdb create \
  --resource-group asset-management-rg \
  --name asset-management-db \
  --kind MongoDB \
  --server-version 4.0

# Get connection string
az cosmosdb keys list \
  --resource-group asset-management-rg \
  --name asset-management-db \
  --type connection-strings
```

#### Step 6: Configure SSL/TLS
```bash
# Bind custom domain (requires DNS configuration)
az webapp config ssl bind \
  --certificate-thumbprint your-thumbprint \
  --ssl-type SNI \
  --name asset-management-api \
  --resource-group asset-management-rg
```

---

## Google Cloud Deployment

### Option 1: Cloud Run (Serverless)

#### Step 1: Install Google Cloud SDK
```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize and authenticate
gcloud init
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

#### Step 2: Create Dockerfile
```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server/server.js"]
```

#### Step 3: Build and Push Image
```bash
# Configure Docker authentication
gcloud auth configure-docker gcr.io

# Build image
docker build -t gcr.io/YOUR_PROJECT_ID/asset-management:latest .

# Push to Container Registry
docker push gcr.io/YOUR_PROJECT_ID/asset-management:latest
```

#### Step 4: Deploy to Cloud Run
```bash
# Deploy service
gcloud run deploy asset-management-api \
  --image gcr.io/YOUR_PROJECT_ID/asset-management:latest \
  --platform managed \
  --region us-central1 \
  --memory 512Mi \
  --cpu 1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,JWT_SECRET=<secret>,MONGODB_URI=<uri>

# Get service URL
gcloud run services describe asset-management-api --region us-central1
```

#### Step 5: Setup Cloud SQL
```bash
# Create Cloud SQL instance for MongoDB
gcloud sql instances create asset-management-db \
  --tier db-n1-standard-1 \
  --region us-central1 \
  --database-version MONGO_5_0

# Create database
gcloud sql databases create asset_management \
  --instance=asset-management-db

# Get connection string
gcloud sql instances describe asset-management-db
```

---

## DigitalOcean Deployment

### Option 1: App Platform (Easiest)

#### Step 1: Create DigitalOcean Account
- Sign up at digitalocean.com
- Add payment method
- Create new project

#### Step 2: Connect GitHub Repository
```bash
# Create new app through DigitalOcean dashboard
# App Platform → Create App → GitHub → Select Repository
```

#### Step 3: Configure Build Settings
```yaml
name: asset-management-api
services:
- name: backend
  github:
    repo: your-repo/asset-management
    branch: main
  build_command: npm install && npm run build
  run_command: node server/server.js
  envs:
  - key: NODE_ENV
    value: production
  - key: JWT_SECRET
    scope: RUN_AND_BUILD_TIME
    value: ${JWT_SECRET}
  - key: MONGODB_URI
    scope: RUN_AND_BUILD_TIME
    value: ${MONGODB_URI}
  http_port: 5000
  log_destinations:
  - name: papertrail
    type: papertrail
databases:
- name: mongodb
  engine: MONGODB
  version: "5.0"
```

#### Step 4: Deploy
```bash
# Save configuration and deploy from dashboard
# Check deployment logs and status
# Access application via provided URL
```

### Option 2: Droplet + Docker

#### Step 1: Create Droplet
```bash
# SSH into droplet
ssh root@your_droplet_ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### Step 2: Create Docker Compose Configuration
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
      - MONGODB_URI=${MONGODB_URI}
    depends_on:
      - mongodb
    restart: always

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGODB_USER}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGODB_PASSWORD}
    volumes:
      - mongo_data:/data/db
    restart: always

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
    depends_on:
      - backend
    restart: always

volumes:
  mongo_data:
```

#### Step 3: Deploy with Docker Compose
```bash
# Clone repository
git clone https://github.com/your-repo/asset-management.git
cd asset-management

# Create .env file
cat > .env << 'EOF'
JWT_SECRET=<your-secret>
MONGODB_URI=mongodb://user:password@mongodb:27017/asset_management
MONGODB_USER=admin
MONGODB_PASSWORD=<strong-password>
NODE_ENV=production
EOF

# Start services
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f backend
```

---

## Heroku Deployment

### Step 1: Install Heroku CLI
```bash
# Install Heroku CLI
curl https://cli.heroku.com/install.sh | sh

# Login to Heroku
heroku login
```

### Step 2: Create Heroku App
```bash
# Create app
heroku create asset-management-api

# Add MongoDB addon
heroku addons:create mongolab:sandbox --app asset-management-api

# Check connection string
heroku config:get MONGODB_URI
```

### Step 3: Configure Environment Variables
```bash
# Set environment variables
heroku config:set NODE_ENV=production --app asset-management-api
heroku config:set JWT_SECRET="<your-secret>" --app asset-management-api

# Verify
heroku config --app asset-management-api
```

### Step 4: Create Procfile
```bash
# Create Procfile for Heroku
cat > Procfile << 'EOF'
web: node server/server.js
EOF
```

### Step 5: Deploy
```bash
# Add all changes
git add .
git commit -m "Ready for Heroku deployment"

# Deploy to Heroku
git push heroku main

# View logs
heroku logs --tail --app asset-management-api

# Check application status
heroku ps --app asset-management-api
```

### Step 6: Scale Dynos
```bash
# Scale web processes
heroku ps:scale web=2 --app asset-management-api

# Monitor
heroku ps --app asset-management-api
heroku metrics --app asset-management-api
```

---

## Database Options

### MongoDB Atlas (Recommended)

#### Advantages
- Fully managed MongoDB
- Automatic backups
- Built-in replication
- Global clusters
- Free tier available

#### Setup
```bash
# Create cluster at mongodb.com/cloud
# Get connection string: mongodb+srv://user:pass@cluster.mongodb.net/dbname

# Update .env
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/asset_management"

# Test connection
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected!'))"
```

---

## CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloud

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '22'
      - run: npm ci
      - run: npm run build
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Cloud Provider
        run: |
          # Deploy script here
          npm run deploy
        env:
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
```

---

## Monitoring & Scaling

### Setup Application Monitoring
```javascript
// Add monitoring to server.js
import prometheus from 'prom-client';

const httpDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpDuration
      .labels(req.method, req.route.path, res.statusCode)
      .observe(duration);
  });
  next();
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});
```

### Setup Auto-scaling
```bash
# AWS Auto Scaling Group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name asset-management-asg \
  --launch-template LaunchTemplateName=asset-management-lt \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 2 \
  --health-check-type ELB

# Setup scaling policy
aws autoscaling put-scaling-policy \
  --auto-scaling-group-name asset-management-asg \
  --policy-name scale-up \
  --policy-type TargetTrackingScaling \
  --target-tracking-configuration '{}'
```

---

## Cost Optimization

### Recommendations
1. **Right-size instances**: Start small, scale up as needed
2. **Use spot instances**: Save 70% on AWS EC2
3. **Enable auto-scaling**: Only pay for what you use
4. **Use managed databases**: Reduce operational overhead
5. **Implement caching**: Reduce database queries
6. **Optimize images**: Reduce deployment size
7. **Schedule non-prod**: Stop dev/test environments at night
8. **Monitor costs**: Set up billing alerts

### Example Cost Estimate (Monthly)
```
AWS Elastic Beanstalk:
- 2x t3.medium instances: $30
- Data transfer: $10
- RDS MongoDB: $50
Total: ~$90/month

DigitalOcean App Platform:
- Containerized app: $12/month
- Database: $15/month
Total: ~$27/month

Heroku:
- 2x web dynos: $50
- MongoDB addon: $57
Total: ~$107/month
```

---

## Troubleshooting

### Common Issues

#### Issue: Application crashes after deployment
```bash
# Check logs
heroku logs --tail
aws logs tail /aws/elasticbeanstalk/...
gcloud logging read

# Check environment variables
heroku config
echo $MONGODB_URI

# Verify database connection
node -e "require('./server/models/User.js')"
```

#### Issue: High memory usage
```javascript
// Add memory monitoring
import os from 'os';

setInterval(() => {
  const memUsage = process.memoryUsage();
  console.log('Memory usage:', {
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
  });
}, 60000);
```

#### Issue: Database connection timeouts
```bash
# Increase connection pool size
MONGODB_POOL_SIZE=10
MONGODB_POOL_TIMEOUT=30000

# Check network connectivity
ping <database-host>
nc -zv <database-host> 27017
```

#### Issue: CORS errors in production
```javascript
// Update CORS configuration
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

---

## Additional Resources

- [AWS Documentation](https://docs.aws.amazon.com/)
- [Azure Documentation](https://docs.microsoft.com/azure/)
- [Google Cloud Documentation](https://cloud.google.com/docs)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)
- [Heroku Documentation](https://devcenter.heroku.com/)
- [MongoDB Atlas Docs](https://docs.mongodb.com/manual/)
- [Express.js Production Guide](https://expressjs.com/en/advanced/best-practice-performance.html)

---

**Need Help?** Refer to cloud provider documentation or contact your DevOps team.
