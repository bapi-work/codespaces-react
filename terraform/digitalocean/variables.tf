variable "digitalocean_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "asset-management"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "digitalocean_region" {
  description = "DigitalOcean region"
  type        = string
  default     = "nyc3"
}

# Database
variable "db_node_count" {
  description = "Number of database nodes"
  type        = number
  default     = 1
}

variable "db_size" {
  description = "Database node size"
  type        = string
  default     = "db-s-1vcpu-1gb"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# GitHub
variable "github_repo" {
  description = "GitHub repository (owner/repo format)"
  type        = string
}

variable "github_branch" {
  description = "GitHub branch to deploy"
  type        = string
  default     = "main"
}

# Application
variable "admin_username" {
  description = "Admin username"
  type        = string
  default     = "admin"
}

variable "admin_email" {
  description = "Admin email"
  type        = string
}

variable "admin_password" {
  description = "Admin password"
  type        = string
  sensitive   = true
}

variable "company_name" {
  description = "Company name"
  type        = string
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}

variable "ssl_certificate_id" {
  description = "DigitalOcean SSL certificate ID"
  type        = string
  default     = ""
}
