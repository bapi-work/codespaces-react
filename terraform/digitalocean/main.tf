# DigitalOcean Infrastructure Configuration
# Deploys Asset Management System to DigitalOcean with App Platform and Managed MongoDB

terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.digitalocean_token
}

# DigitalOcean Spaces Bucket (for file storage)
resource "digitalocean_spaces_bucket" "assets" {
  name          = "${var.project_name}-assets"
  region        = var.digitalocean_region
  force_destroy = false

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

# DigitalOcean Database (MongoDB)
resource "digitalocean_database_cluster" "mongodb" {
  name       = "${var.project_name}-db"
  engine     = "mongodb"
  version    = "6"
  region     = var.digitalocean_region
  node_count = var.db_node_count
  size       = var.db_size
  storage_size_mib = 40960  # 40GB

  tags = ["${var.project_name}", var.environment]
}

# Database User
resource "digitalocean_database_user" "mongodb" {
  cluster_id = digitalocean_database_cluster.mongodb.id
  name       = var.db_username
}

# Database
resource "digitalocean_database_db" "mongodb" {
  cluster_id = digitalocean_database_cluster.mongodb.id
  name       = "asset-management"
}

# Firewall
resource "digitalocean_firewall" "app" {
  name            = "${var.project_name}-firewall"
  droplet_ids     = []
  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    sources {
      load_balancer_uid = digitalocean_loadbalancer.main.id
    }
  }

  inbound_rule {
    protocol = "icmp"
    sources {
      addresses = ["0.0.0.0/0", "::/0"]
    }
  }

  outbound_rule {
    protocol      = "tcp"
    port_range    = "all"
    destinations {
      addresses = ["0.0.0.0/0", "::/0"]
    }
  }

  tags = ["${var.project_name}"]
}

# Load Balancer
resource "digitalocean_loadbalancer" "main" {
  name        = "${var.project_name}-lb"
  region      = var.digitalocean_region
  forwarding_rule {
    entry_protocol  = "https"
    entry_port      = 443
    target_protocol = "http"
    target_port     = 8080
    certificate_id  = var.ssl_certificate_id != "" ? var.ssl_certificate_id : null
  }

  forwarding_rule {
    entry_protocol  = "http"
    entry_port      = 80
    target_protocol = "http"
    target_port     = 8080
  }

  healthcheck {
    protocol = "http"
    port     = 8080
    path     = "/api/health"
  }

  sticky_sessions {
    type             = "cookies"
    cookie_name      = "lb"
    cookie_ttl_seconds = 300
  }

  tags = ["${var.project_name}"]
}

# App Platform Project
resource "digitalocean_app" "main" {
  spec {
    name   = var.project_name
    region = var.digitalocean_region

    # Backend Service
    service {
      name             = "backend"
      github {
        repo                 = var.github_repo
        branch               = var.github_branch
        deploy_on_push       = true
      }
      build_command    = "npm install && npm run build"
      run_command      = "npm start"
      source_dir       = "server"
      http_port        = 5000
      internal_ports   = [5000]

      envs {
        key   = "NODE_ENV"
        value = "production"
      }
      envs {
        key   = "AUTO_INIT_DB"
        value = "true"
      }
      envs {
        key   = "ADMIN_USERNAME"
        value = var.admin_username
      }
      envs {
        key   = "ADMIN_EMAIL"
        value = var.admin_email
      }
      envs {
        key   = "COMPANY_NAME"
        value = var.company_name
      }
    }

    # Frontend Service
    service {
      name             = "frontend"
      github {
        repo                 = var.github_repo
        branch               = var.github_branch
        deploy_on_push       = true
      }
      build_command    = "npm install && npm run build"
      http_port        = 3000
      internal_ports   = [3000]

      envs {
        key   = "VITE_API_URL"
        value = "https://${digitalocean_loadbalancer.main.ip}"
      }
    }

    # Environment Variables
    env {
      key   = "MONGODB_URI"
      value = "mongodb+srv://${var.db_username}:${var.db_password}@${digitalocean_database_cluster.mongodb.host}:${digitalocean_database_cluster.mongodb.port}/asset-management?retryWrites=true&w=majority"
      scope = "RUN_TIME"
    }
    env {
      key   = "JWT_SECRET"
      value = var.jwt_secret
      scope = "RUN_TIME"
    }
    env {
      key   = "ADMIN_PASSWORD"
      value = var.admin_password
      scope = "RUN_TIME"
    }
  }

  depends_on = [
    digitalocean_database_cluster.mongodb,
    digitalocean_database_db.mongodb
  ]
}

# Outputs
output "app_domain" {
  value       = digitalocean_app.main.default_ingress
  description = "Application domain"
}

output "load_balancer_ip" {
  value       = digitalocean_loadbalancer.main.ip
  description = "Load balancer IP address"
}

output "database_uri" {
  value       = "mongodb+srv://${var.db_username}:${var.db_password}@${digitalocean_database_cluster.mongodb.host}:${digitalocean_database_cluster.mongodb.port}/asset-management?retryWrites=true&w=majority"
  description = "MongoDB connection string"
  sensitive   = true
}
