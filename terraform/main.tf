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

# Variables
variable "subscription_id" {
  description = "Azure Subscription ID"
  type        = string
}

variable "location" {
  default = "Central India"
}

# Resource Group
resource "azurerm_resource_group" "megaverse" {
  name     = "megaverse-rg"
  location = var.location
}

# App Service Plan (F1 Free)
resource "azurerm_service_plan" "megaverse" {
  name                = "megaverse-plan"
  location            = azurerm_resource_group.megaverse.location
  resource_group_name = azurerm_resource_group.megaverse.name
  os_type             = "Linux"
  sku_name            = "F1"
}

# App Service (Web App)
resource "azurerm_linux_web_app" "megaverse" {
  name                = "megaverse-api"
  location            = azurerm_resource_group.megaverse.location
  resource_group_name = azurerm_resource_group.megaverse.name
  service_plan_id     = azurerm_service_plan.megaverse.id

  site_config {
    application_stack {
      node_version = "20-lts"
    }
  }

  app_settings = {
    PORT     = "8080"
    NODE_ENV = "production"
  }
}

# PostgreSQL Flexible Server (B1ms Free tier)
resource "azurerm_postgresql_flexible_server" "megaverse" {
  name                   = "megaverse-db"
  location               = azurerm_resource_group.megaverse.location
  resource_group_name    = azurerm_resource_group.megaverse.name
  administrator_login    = "dbadmin"
  administrator_password = random_password.db_password.result
  sku_name               = "B_Standard_B1ms"
  storage_mb             = 32768
  version                = "15"
  backup_retention_days  = 7
}

# Database Password
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# PostgreSQL Database
resource "azurerm_postgresql_flexible_server_database" "megaverse_db" {
  name      = "megaverse_db"
  server_id = azurerm_postgresql_flexible_server.megaverse.id
  charset   = "UTF8"
}

# Firewall Rule
resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "AllowAllAzureServices"
  server_id        = azurerm_postgresql_flexible_server.megaverse.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "255.255.255.255"
}

# Outputs
output "app_service_url" {
  value = "https://${azurerm_linux_web_app.megaverse.default_hostname}"
}

output "database_host" {
  value = azurerm_postgresql_flexible_server.megaverse.fqdn
}

output "database_password" {
  value     = random_password.db_password.result
  sensitive = true
}
