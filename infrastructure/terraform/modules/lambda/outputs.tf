# Outputs for Lambda Module
# Repo: https://github.com/andrew-kemp-dahlberg/CLAWDBOT

output "memories_function_arn" {
  value = aws_lambda_function.memories.arn
}

output "memories_function_invoke_arn" {
  value = aws_lambda_function.memories.invoke_arn
}

output "agents_function_arn" {
  value = aws_lambda_function.agents.arn
}

output "agents_function_invoke_arn" {
  value = aws_lambda_function.agents.invoke_arn
}

output "messages_function_arn" {
  value = aws_lambda_function.messages.arn
}

output "messages_function_invoke_arn" {
  value = aws_lambda_function.messages.invoke_arn
}
