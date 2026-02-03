# Outputs for Clawdbot Infrastructure
# Repo: https://github.com/andrew-kemp-dahlberg/CLAWDBOT

output "api_endpoint" {
  description = "Base URL for the API"
  value       = module.api.api_endpoint
}

output "api_id" {
  description = "API Gateway ID"
  value       = module.api.api_id
}

output "memories_table" {
  description = "DynamoDB memories table name"
  value       = module.database.memories_table_name
}

output "agents_table" {
  description = "DynamoDB agents table name"
  value       = module.database.agents_table_name
}

output "messages_table" {
  description = "DynamoDB messages table name"
  value       = module.database.messages_table_name
}
