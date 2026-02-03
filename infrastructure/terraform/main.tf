# Clawdbot Memory API Infrastructure
# Repo: https://github.com/andrew-kemp-dahlberg/CLAWDBOT
#
# This Terraform configuration creates:
# - DynamoDB tables for memories, agents, messages
# - Lambda functions for API handlers
# - API Gateway for REST endpoints
# - IAM roles and policies

terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment to use S3 backend for state
  # backend "s3" {
  #   bucket = "clawdbot-terraform-state"
  #   key    = "api/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "clawdbot"
      Environment = var.environment
      ManagedBy   = "terraform"
      Repo        = "https://github.com/andrew-kemp-dahlberg/CLAWDBOT"
    }
  }
}

# Database module - DynamoDB tables
module "database" {
  source = "./modules/database"

  environment = var.environment
  table_prefix = var.table_prefix
}

# Lambda module - API handler functions
module "lambda" {
  source = "./modules/lambda"

  environment     = var.environment
  function_prefix = var.function_prefix

  memories_table_name = module.database.memories_table_name
  memories_table_arn  = module.database.memories_table_arn
  agents_table_name   = module.database.agents_table_name
  agents_table_arn    = module.database.agents_table_arn
  messages_table_name = module.database.messages_table_name
  messages_table_arn  = module.database.messages_table_arn
}

# API Gateway module
module "api" {
  source = "./modules/api"

  environment = var.environment
  api_name    = var.api_name

  lambda_memories_arn        = module.lambda.memories_function_arn
  lambda_memories_invoke_arn = module.lambda.memories_function_invoke_arn
  lambda_agents_arn          = module.lambda.agents_function_arn
  lambda_agents_invoke_arn   = module.lambda.agents_function_invoke_arn
  lambda_messages_arn        = module.lambda.messages_function_arn
  lambda_messages_invoke_arn = module.lambda.messages_function_invoke_arn
}
