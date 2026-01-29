# Quick Cloud Deployment Reference

## One-Line Deployment Commands

### Local Testing
```bash
# Test with Docker Compose (includes auto database setup)
docker-compose up -d
# Access at: http://localhost:3000
```

### AWS Deployment
```bash
# Option 1: Terraform (Recommended)
cd terraform/aws
terraform init
terraform plan
terraform apply

# Option 2: AWS Elastic Beanstalk
eb create asset-management-env --instance-type t3.micro
```

### Azure Deployment
```bash
cd terraform/azure
terraform init
terraform plan
terraform apply
```

### DigitalOcean Deployment
```bash
cd terraform/digitalocean
terraform init
terraform plan
terraform apply
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| `.env` | Environment variables (create from template) |
| `Dockerfile` | Backend container image |
| `Dockerfile.frontend` | Frontend container image |
| `docker-compose.yml` | Local development setup |
| `terraform/aws/main.tf` | AWS infrastructure |
| `terraform/azure/main.tf` | Azure infrastructure |
| `terraform/digitalocean/main.tf` | DigitalOcean infrastructure |
| `server/scripts/initializeDatabase.js` | Database initialization |
| `nginx.conf` | Frontend reverse proxy config |

---

## Environment Variables

### Required for Auto-Initialization
```
AUTO_INIT_DB=true
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourPassword123!
ADMIN_EMAIL=admin@company.com
JWT_SECRET=your-super-secret-32-char-key
COMPANY_NAME=Your Company
```

### Optional
```
CURRENCY=USD
TIMEZONE=America/New_York
MONGODB_URI=mongodb://localhost:27017/asset-management
NODE_ENV=production
PORT=5000
```

---

## Default Database Setup

When `AUTO_INIT_DB=true`:

✅ Creates 1 admin user  
✅ Creates 8 asset types  
✅ Creates 3 locations  
✅ Creates 3 sample employees  
✅ Creates 2 sample assets  
✅ Creates system settings  
✅ Creates audit log entry  

---

## Access Credentials After Deploy

```
Username: admin  (or value from ADMIN_USERNAME)
Password: [value from ADMIN_PASSWORD]
Email:    [value from ADMIN_EMAIL]
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Database not initializing | Check `AUTO_INIT_DB=true` in env vars |
| Container won't start | View logs: `docker-compose logs backend` |
| Connection refused | Wait 30 seconds for services to start |
| Admin login fails | Check password in .env file |
| Port already in use | Change PORT in .env or docker-compose.yml |

---

## Performance Tips

1. **AWS**: Use auto-scaling with min=2, max=5 tasks
2. **Azure**: Enable CDN for frontend assets
3. **DigitalOcean**: Use Managed MongoDB for reliability
4. **All**: Enable caching headers in nginx.conf
5. **All**: Set up monitoring and alerts

---

## Security Best Practices

1. ✅ Change default admin password immediately
2. ✅ Use strong JWT_SECRET (32+ characters)
3. ✅ Enable HTTPS/SSL certificates
4. ✅ Use database with authentication
5. ✅ Restrict security group/firewall rules
6. ✅ Enable backup and recovery
7. ✅ Rotate credentials regularly
8. ✅ Use managed databases when possible

---

## Useful Commands

```bash
# Local testing
docker-compose ps              # View running containers
docker-compose logs backend    # View backend logs
docker-compose down            # Stop containers

# Terraform
terraform destroy              # Tear down infrastructure
terraform output               # View outputs (URLs, IPs)
terraform state list           # View managed resources

# Database
npm run init-db               # Manually initialize database
npm run dev                   # Start dev server

# AWS
aws ecs list-services         # List ECS services
aws rds describe-db-instances # View database

# Azure
az app service list           # List deployed apps
az cosmosdb show              # View Cosmos database

# DigitalOcean
doctl apps list               # List deployed apps
doctl databases list          # List databases
```

---

## Deployment Time Estimates

| Provider | Time | Cost (First Month) |
|----------|------|-------------------|
| Docker Compose | 2 min | Free (local) |
| AWS | 15-20 min | $50-100 |
| Azure | 10-15 min | $30-80 |
| DigitalOcean | 5-10 min | $10-25 |

---

## Next Steps After Deployment

1. Change admin password
2. Add real employees
3. Import asset data (via CSV)
4. Configure email notifications
5. Set backup schedule
6. Enable 2FA for admin
7. Monitor application health
8. Set up SSL certificate

---

For detailed instructions, see:
- [AUTOMATIC_CLOUD_DEPLOYMENT.md](AUTOMATIC_CLOUD_DEPLOYMENT.md)
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
