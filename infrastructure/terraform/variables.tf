# Variables for Clawdbot Infrastructure
# Repo: https://github.com/andrew-kemp-dahlberg/CLAWDBOT

variable "aws_region" {
  description = "AWS region to deploy to"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "table_prefix" {
  description = "Prefix for DynamoDB table names"
  type        = string
  default     = "clawdbot"
}

variable "function_prefix" {
  description = "Prefix for Lambda function names"
  type        = string
  default     = "clawdbot"
}

variable "api_name" {
  description = "Name for the API Gateway"
  type        = string
  default     = "clawdbot-memory-api"
}

variable "admin_api_key" {
  description = "Admin API key for privileged operations. Generate with: openssl rand -hex 32"
  type        = string
  default     = ""
  sensitive   = true
}
