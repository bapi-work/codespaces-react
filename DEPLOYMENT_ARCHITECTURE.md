# Cloud Deployment Architecture

## Deployment Architecture Overview

### AWS Architecture (Terraform)

```
┌─────────────────────────────────────────────────────────────────┐
│                      AWS Cloud (Region)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │             Internet Gateway                             │  │
│  └────────────────────┬────────────────────────────────────┘  │
│                       │                                        │
│  ┌────────────────────▼────────────────────────────────────┐  │
│  │   Application Load Balancer (Public Subnet)             │  │
│  └────────────────────┬────────────────────────────────────┘  │
│                       │                                        │
│  ┌────────────────────▼────────────────────────────────────┐  │
│  │              ECS Cluster (Fargate)                      │  │
│  │  ┌──────────────────────────────────────────────────┐   │  │
│  │  │  Task 1: Backend (Node.js)                       │   │  │
│  │  │  - Auto-scales 2-5 instances                     │   │  │
│  │  │  - Port: 5000                                    │   │  │
│  │  │  - Health check: /api/health                     │   │  │
│  │  │  - Auto-init: YES                                │   │  │
│  │  └──────────────────────────────────────────────────┘   │  │
│  └─────────────────────┬────────────────────────────────────┘  │
│                        │                                        │
│  ┌─────────────────────▼────────────────────────────────────┐  │
│  │   DocumentDB (MongoDB Compatible)                       │  │
│  │   - Managed database                                    │  │
│  │   - Multi-AZ deployment                                 │  │
│  │   - Automatic backups                                   │  │
│  │   - Performance monitoring                              │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │   CloudWatch (Monitoring & Logging)                     │ │
│  │   - Application logs                                    │ │
│  │   - Performance metrics                                 │ │
│  │   - Alarms & notifications                              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │   Secrets Manager                                        │ │
│  │   - JWT Secret                                           │ │
│  │   - Database credentials                                │ │
│  │   - Admin password                                       │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
└───────────────────────────────────────────────────────────────┘

Flow:
1. User accesses http://alb-dns-name
2. ALB routes to ECS task
3. Backend service auto-initializes DB (first run)
4. Application ready with admin user
```

---

### Azure Architecture (Terraform)

```
┌──────────────────────────────────────────────────────────┐
│               Azure Resource Group                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │       Azure Virtual Network                       │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │         Application Service Plan             │ │ │
│  │  │                                               │ │ │
│  │  │  ┌────────────────────────────────────────┐  │ │ │
│  │  │  │  Backend App Service (Linux)           │  │ │ │
│  │  │  │  - Node.js runtime                     │  │ │ │
│  │  │  │  - Always on: Yes                      │  │ │ │
│  │  │  │  - Auto-init: YES                      │  │ │ │
│  │  │  │  - SSL/TLS: Supported                  │  │ │ │
│  │  │  └────────────────────────────────────────┘  │ │ │
│  │  │                                               │ │ │
│  │  │  ┌────────────────────────────────────────┐  │ │ │
│  │  │  │  Frontend App Service (Linux)          │  │ │ │
│  │  │  │  - Static site hosting                 │  │ │ │
│  │  │  │  - React build                         │  │ │ │
│  │  │  │  - CDN enabled                         │  │ │ │
│  │  │  └────────────────────────────────────────┘  │ │ │
│  │  │                                               │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │    CosmosDB with MongoDB API                      │ │
│  │    - Global distribution                         │ │
│  │    - Automatic failover                          │ │
│  │    - Serverless pricing option                   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │    Application Insights                          │ │
│  │    - Real-time monitoring                        │ │
│  │    - Performance analytics                       │ │
│  │    - Alerts & diagnostics                        │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘

Flow:
1. User accesses https://backend-app.azurewebsites.net
2. App Service serves backend
3. Auto-initializes CosmosDB (first run)
4. Application ready with admin user
```

---

### DigitalOcean Architecture (Terraform)

```
┌─────────────────────────────────────────────────────────┐
│            DigitalOcean Namespace                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │         Load Balancer (HTTPS)                    │ │
│  │  - SSL Certificate support                       │ │
│  │  - Sticky sessions                               │ │
│  └───────────────────┬───────────────────────────────┘ │
│                      │                                  │
│  ┌───────────────────▼───────────────────────────────┐ │
│  │      App Platform (Managed Containers)           │ │
│  │                                                   │ │
│  │  ┌──────────────────────────────────────────────┐│ │
│  │  │ Backend Component (Docker)                   ││ │
│  │  │ - GitHub integration                         ││ │
│  │  │ - Auto-deploy on push                        ││ │
│  │  │ - Auto-init: YES                             ││ │
│  │  │ - Scaling: Automatic                         ││ │
│  │  └──────────────────────────────────────────────┘│ │
│  │                                                   │ │
│  │  ┌──────────────────────────────────────────────┐│ │
│  │  │ Frontend Component (Docker)                  ││ │
│  │  │ - React build & serve                        ││ │
│  │  │ - CDN integration                            ││ │
│  │  │ - Auto-deploy on push                        ││ │
│  │  └──────────────────────────────────────────────┘│ │
│  │                                                   │ │
│  └───────────────────┬───────────────────────────────┘ │
│                      │                                  │
│  ┌───────────────────▼───────────────────────────────┐ │
│  │    Managed MongoDB Database                      │ │
│  │    - Automated backups                           │ │
│  │    - High availability                           │ │
│  │    - 40GB storage                                │ │
│  │    - Connection pooling                          │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │    Spaces (File Storage)                         │ │
│  │    - Asset uploads                               │ │
│  │    - CDN distribution                            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │    Monitoring & Alerts                           │ │
│  │    - Real-time logs                              │ │
│  │    - Health checks                               │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘

Flow:
1. User accesses https://app-domain.ondigitalocean.app
2. Load Balancer routes to backend
3. Backend auto-initializes MongoDB (first run)
4. Application ready with admin user
```

---

### Local Docker Architecture

```
┌──────────────────────────────────────────┐
│      Local Docker Environment            │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Host (Port 3000)                 │ │
│  │  │                                 │ │
│  │  ├─ Frontend (React)               │ │
│  │  │  └─ http://localhost:3000      │ │
│  │  │                                 │ │
│  └────────────────────────────────────┘ │
│                  │                       │
│  ┌───────────────▼────────────────────┐ │
│  │  nginx Container (Reverse Proxy)   │ │
│  │  - Port 3000                       │ │
│  │  - API proxy to :5000              │ │
│  └───────────────────────────────────┘ │
│                  │                      │
│  ┌───────────────▼────────────────────┐ │
│  │  Backend Container (Node.js)       │ │
│  │  - Port 5000                       │ │
│  │  - Auto-init: YES                  │ │
│  │  - Health: http://localhost:5000   │ │
│  │            /api/health             │ │
│  └───────────────────────────────────┘ │
│                  │                      │
│  ┌───────────────▼────────────────────┐ │
│  │  MongoDB Container                 │ │
│  │  - Port 27017                      │ │
│  │  - Auth enabled                    │ │
│  │  - Volume: mongodb_data            │ │
│  └────────────────────────────────────┘ │
│                                          │
└──────────────────────────────────────────┘

Commands:
- docker-compose up -d    (Start all)
- docker-compose logs     (View logs)
- docker-compose down     (Stop all)
```

---

## Database Initialization Flow

### Sequence Diagram

```
Application Start
    │
    ├─ Connect to MongoDB
    │  └─ Wait for connection (retry: 5x)
    │
    ├─ Check AUTO_INIT_DB env var
    │  └─ If not set or false: Skip init, Start app
    │
    ├─ Check if DB has collections
    │  └─ If collections exist: Skip init, Start app
    │
    └─ Initialize Database:
       │
       ├─ Create Admin User
       │  ├─ Username: ADMIN_USERNAME
       │  ├─ Password: Hash(ADMIN_PASSWORD)
       │  ├─ Email: ADMIN_EMAIL
       │  └─ Role: admin
       │
       ├─ Create Asset Types (8)
       │  ├─ Laptop
       │  ├─ Desktop
       │  ├─ Monitor
       │  ├─ Printer
       │  ├─ Furniture
       │  ├─ Network Equipment
       │  ├─ Mobile Device
       │  └─ Software License
       │
       ├─ Create Locations (3)
       │  ├─ Main Office
       │  ├─ Remote
       │  └─ Warehouse
       │
       ├─ Create Employees (3)
       │  ├─ System Administrator (Admin)
       │  ├─ John Manager
       │  └─ Jane Employee
       │
       ├─ Create Sample Assets (2)
       │  ├─ MacBook Pro 16"
       │  └─ Dell Monitor 27"
       │
       ├─ Create System Settings
       │  ├─ Company Name
       │  ├─ Currency
       │  ├─ Timezone
       │  └─ Features
       │
       ├─ Create Audit Log Entry
       │  └─ SYSTEM_INIT action logged
       │
       └─ Log credentials to console
          └─ "Ready to login with admin/password"

Application Ready ✓
```

---

## Component Interaction

### Deployment Scenario: First AWS Deployment

```
1. Terraform Apply
   ↓
2. Create VPC, Subnets, Security Groups
   ↓
3. Create DocumentDB Cluster
   ↓
4. Create ECS Cluster & Task Definition
   ↓
5. Launch ECS Service (2 tasks)
   ↓
6. Task 1 Starts:
   - Set env vars
   - Start Node.js app
   - Connect to DocumentDB
   - Check AUTO_INIT_DB=true
   - Initialize database
   - Create admin user
   - Create asset types
   - Create sample data
   - Ready for traffic
   ↓
7. Task 2 Starts:
   - Set env vars
   - Start Node.js app
   - Connect to DocumentDB
   - Check if DB already initialized
   - DB already has collections
   - Skip initialization
   - Ready for traffic
   ↓
8. ALB Health Checks Pass
   ↓
9. Application Ready ✓
```

---

## Security Architecture

```
┌─────────────────────────────────────────┐
│         Security Layers                 │
├─────────────────────────────────────────┤
│                                         │
│ Layer 1: Network Security               │
│ ├─ Firewall/Security Groups             │
│ ├─ VPC/Virtual Networks                 │
│ ├─ Public/Private Subnets               │
│ └─ SSL/TLS (HTTPS)                      │
│                                         │
│ Layer 2: Application Security           │
│ ├─ Helmet (HTTP headers)                │
│ ├─ CORS validation                      │
│ ├─ Rate limiting                        │
│ └─ Input validation                     │
│                                         │
│ Layer 3: Authentication                 │
│ ├─ JWT tokens                           │
│ ├─ Password hashing (bcryptjs)          │
│ ├─ Session management                   │
│ └─ Two-factor authentication            │
│                                         │
│ Layer 4: Database Security              │
│ ├─ Encrypted connections                │
│ ├─ Database authentication              │
│ ├─ User permissions                     │
│ └─ Backups & recovery                   │
│                                         │
│ Layer 5: Secrets Management             │
│ ├─ AWS Secrets Manager                  │
│ ├─ Azure Key Vault                      │
│ ├─ Environment variables                │
│ └─ Never hardcode credentials           │
│                                         │
└─────────────────────────────────────────┘
```

---

## Scaling Strategy

### Horizontal Scaling (Add Instances)
- AWS: Auto Scaling Group (2-5 tasks)
- Azure: App Service Scale Out (1-5 instances)
- DigitalOcean: Container replicas

### Vertical Scaling (Increase Resources)
- AWS: Upgrade task CPU/memory
- Azure: Upgrade App Service Plan
- DigitalOcean: Upgrade container specs

### Database Scaling
- AWS: DocumentDB read replicas
- Azure: CosmosDB throughput scaling
- DigitalOcean: Larger managed database

### Cost Optimization
- Use spot instances when possible
- Reserved capacity for baseline
- Scheduled scaling for known patterns
- CDN for static assets
- Caching layers

---

## Monitoring Stack

```
Application Logs
    │
    ├─ Cloud Provider Logs
    │  ├─ AWS CloudWatch
    │  ├─ Azure Application Insights
    │  └─ DigitalOcean App Logs
    │
    ├─ Metrics
    │  ├─ CPU Usage
    │  ├─ Memory Usage
    │  ├─ Request Count
    │  ├─ Response Time
    │  └─ Error Rate
    │
    ├─ Alerts
    │  ├─ High CPU (>80%)
    │  ├─ High Memory (>85%)
    │  ├─ Error Rate (>5%)
    │  └─ Service Down
    │
    └─ Dashboard
       ├─ Real-time metrics
       ├─ Historical trends
       └─ Alert configuration
```

---

This architecture ensures:
✅ High availability
✅ Auto-scaling
✅ Automated backups
✅ Security best practices
✅ Easy disaster recovery
✅ Cost optimization
✅ Comprehensive monitoring
