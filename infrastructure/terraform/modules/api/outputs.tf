# Outputs for API Module
# Repo: https://github.com/andrew-kemp-dahlberg/CLAWDBOT

output "api_endpoint" {
  value = aws_apigatewayv2_stage.main.invoke_url
}

output "api_id" {
  value = aws_apigatewayv2_api.main.id
}
