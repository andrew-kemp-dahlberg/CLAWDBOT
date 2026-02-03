# Outputs for Database Module
# Repo: https://github.com/andrew-kemp-dahlberg/CLAWDBOT

output "memories_table_name" {
  value = aws_dynamodb_table.memories.name
}

output "memories_table_arn" {
  value = aws_dynamodb_table.memories.arn
}

output "agents_table_name" {
  value = aws_dynamodb_table.agents.name
}

output "agents_table_arn" {
  value = aws_dynamodb_table.agents.arn
}

output "messages_table_name" {
  value = aws_dynamodb_table.messages.name
}

output "messages_table_arn" {
  value = aws_dynamodb_table.messages.arn
}
