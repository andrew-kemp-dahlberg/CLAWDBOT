# Variables for API Module
# Repo: https://github.com/andrew-kemp-dahlberg/CLAWDBOT

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "api_name" {
  description = "Name for the API Gateway"
  type        = string
}

variable "lambda_memories_arn" {
  description = "ARN of memories Lambda function"
  type        = string
}

variable "lambda_memories_invoke_arn" {
  description = "Invoke ARN of memories Lambda function"
  type        = string
}

variable "lambda_agents_arn" {
  description = "ARN of agents Lambda function"
  type        = string
}

variable "lambda_agents_invoke_arn" {
  description = "Invoke ARN of agents Lambda function"
  type        = string
}

variable "lambda_messages_arn" {
  description = "ARN of messages Lambda function"
  type        = string
}

variable "lambda_messages_invoke_arn" {
  description = "Invoke ARN of messages Lambda function"
  type        = string
}
