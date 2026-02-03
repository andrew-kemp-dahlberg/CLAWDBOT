# Variables for Lambda Module
# Repo: https://github.com/andrew-kemp-dahlberg/CLAWDBOT

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "function_prefix" {
  description = "Prefix for function names"
  type        = string
}

variable "memories_table_name" {
  description = "DynamoDB memories table name"
  type        = string
}

variable "memories_table_arn" {
  description = "DynamoDB memories table ARN"
  type        = string
}

variable "agents_table_name" {
  description = "DynamoDB agents table name"
  type        = string
}

variable "agents_table_arn" {
  description = "DynamoDB agents table ARN"
  type        = string
}

variable "messages_table_name" {
  description = "DynamoDB messages table name"
  type        = string
}

variable "messages_table_arn" {
  description = "DynamoDB messages table ARN"
  type        = string
}
