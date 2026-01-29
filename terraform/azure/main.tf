# Azure Infrastructure Configuration
# Deploys Asset Management System to Azure with CosmosDB (MongoDB API)

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${var.project_name}-rg"
  location = var.azure_location

  tags = {
    environment = var.environment
    project     = var.project_name
  }
}

# Virtual Network
resource "azurerm_virtual_network" "main" {
  name                = "${var.project_name}-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}

# Subnet
resource "azurerm_subnet" "main" {
  name                 = "${var.project_name}-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.1.0/24"]
}

# CosmosDB Account (MongoDB API)
resource "azurerm_cosmosdb_account" "main" {
  name                = "${var.project_name}-cosmos"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  offer_type          = "Standard"
  kind                = "MongoDB"

  capabilities {
    name = "EnableMongo"
  }

  capabilities {
    name = "EnableServerless"
  }

  consistency_policy {
    consistency_level       = "Eventual"
    max_interval_in_seconds = 5
    max_staleness_prefix    = 100
  }

  geo_location {
    location          = azurerm_resource_group.main.location
    failover_priority = 0
  }

  tags = {
    environment = var.environment
  }
}

# CosmosDB Database
resource "azurerm_cosmosdb_mongo_database" "main" {
  name                = "asset-management"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
}

# App Service Plan
resource "azurerm_service_plan" "main" {
  name                = "${var.project_name}-plan"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = var.app_service_sku

  tags = {
    environment = var.environment
  }
}

# App Service (Backend)
resource "azurerm_linux_web_app" "backend" {
  name                = "${var.project_name}-backend"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on         = true
    minimum_tls_version = "1.2"

    application_stack {
      node_version = "22"
    }

    app_command_line = "npm start"
  }

  app_settings = {
    "NODE_ENV"                      = "production"
    "PORT"                          = "8080"
    "AUTO_INIT_DB"                  = "true"
    "MONGODB_URI"                   = azurerm_cosmosdb_account.main.connection_strings[0]
    "JWT_SECRET"                    = var.jwt_secret
    "ADMIN_USERNAME"                = var.admin_username
    "ADMIN_PASSWORD"                = var.admin_password
    "ADMIN_EMAIL"                   = var.admin_email
    "COMPANY_NAME"                  = var.company_name
    "FRONTEND_URL"                  = "https://${azurerm_linux_web_app.frontend.default_hostname}"
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
  }

  depends_on = [
    azurerm_cosmosdb_mongo_database.main
  ]

  tags = {
    environment = var.environment
  }
}

# App Service (Frontend)
resource "azurerm_linux_web_app" "frontend" {
  name                = "${var.project_name}-frontend"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id

  site_config {
    always_on = true
    minimum_tls_version = "1.2"

    application_stack {
      node_version = "22"
    }
  }

  app_settings = {
    "NODE_ENV"              = "production"
    "VITE_API_URL"          = "https://${azurerm_linux_web_app.backend.default_hostname}"
    "WEBSITE_RUN_FROM_PACKAGE" = "1"
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
  }

  depends_on = [
    azurerm_linux_web_app.backend
  ]

  tags = {
    environment = var.environment
  }
}

# Application Insights
resource "azurerm_application_insights" "main" {
  name                = "${var.project_name}-insights"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"

  tags = {
    environment = var.environment
  }
}

# Application Insights Alert
resource "azurerm_monitor_metric_alert" "cpu_alert" {
  name                = "${var.project_name}-cpu-alert"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [azurerm_linux_web_app.backend.id]
  description         = "Alert when CPU is high"
  severity            = 2

  criteria {
    metric_name      = "CpuPercentage"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 80
    metric_namespace = "Microsoft.Web/serverfarms"
  }
}

# Outputs
output "backend_url" {
  value       = "https://${azurerm_linux_web_app.backend.default_hostname}"
  description = "Backend application URL"
}

output "frontend_url" {
  value       = "https://${azurerm_linux_web_app.frontend.default_hostname}"
  description = "Frontend application URL"
}

output "cosmosdb_connection_string" {
  value       = azurerm_cosmosdb_account.main.connection_strings[0]
  description = "CosmosDB connection string"
  sensitive   = true
}
