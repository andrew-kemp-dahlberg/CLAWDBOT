# Variables for Database Module
# Repo: https://github.com/andrew-kemp-dahlberg/CLAWDBOT

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "table_prefix" {
  description = "Prefix for table names"
  type        = string
}
