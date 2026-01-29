variable "azure_location" {
  description = "Azure location"
  type        = string
  default     = "East US"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "assetmanagement"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "app_service_sku" {
  description = "App Service SKU"
  type        = string
  default     = "B2"
}

# Application Settings
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
