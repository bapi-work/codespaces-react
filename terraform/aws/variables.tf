variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
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

# Database
variable "db_username" {
  description = "Database username"
  type        = string
  default     = "admin"
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "docdb_instance_count" {
  description = "Number of DocumentDB instances"
  type        = number
  default     = 2
}

variable "docdb_instance_class" {
  description = "DocumentDB instance class"
  type        = string
  default     = "db.t3.small"
}

# ECS
variable "backend_image" {
  description = "Backend Docker image URI"
  type        = string
  default     = "asset-management:latest"
}

variable "ecs_task_cpu" {
  description = "ECS task CPU"
  type        = string
  default     = "256"
}

variable "ecs_task_memory" {
  description = "ECS task memory"
  type        = string
  default     = "512"
}

variable "ecs_desired_count" {
  description = "Desired number of tasks"
  type        = number
  default     = 2
}

variable "ecs_min_capacity" {
  description = "Minimum ECS capacity"
  type        = number
  default     = 2
}

variable "ecs_max_capacity" {
  description = "Maximum ECS capacity"
  type        = number
  default     = 5
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

# Secrets
variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}
