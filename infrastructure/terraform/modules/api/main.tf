# API Gateway for Clawdbot Memory API
# Repo: https://github.com/andrew-kemp-dahlberg/CLAWDBOT

resource "aws_apigatewayv2_api" "main" {
  name          = "${var.api_name}-${var.environment}"
  protocol_type = "HTTP"
  description   = "Clawdbot Memory API - https://github.com/andrew-kemp-dahlberg/CLAWDBOT"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization", "X-Api-Key", "X-Agent-Name"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = var.environment
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_logs.arn
    format = jsonencode({
      requestId        = "$context.requestId"
      ip               = "$context.identity.sourceIp"
      requestTime      = "$context.requestTime"
      httpMethod       = "$context.httpMethod"
      routeKey         = "$context.routeKey"
      status           = "$context.status"
      responseLength   = "$context.responseLength"
      integrationError = "$context.integrationErrorMessage"
    })
  }
}

resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/apigateway/${var.api_name}-${var.environment}"
  retention_in_days = 30
}

# --- Memories Routes ---

resource "aws_apigatewayv2_integration" "memories" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.lambda_memories_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_memories" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /memories"
  target    = "integrations/${aws_apigatewayv2_integration.memories.id}"
}

resource "aws_apigatewayv2_route" "post_memories" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /memories"
  target    = "integrations/${aws_apigatewayv2_integration.memories.id}"
}

resource "aws_apigatewayv2_route" "get_memory" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /memories/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.memories.id}"
}

resource "aws_lambda_permission" "memories" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_memories_arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# --- Agents Routes ---

resource "aws_apigatewayv2_integration" "agents" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.lambda_agents_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_agents" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /agents"
  target    = "integrations/${aws_apigatewayv2_integration.agents.id}"
}

resource "aws_apigatewayv2_route" "post_agents" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /agents"
  target    = "integrations/${aws_apigatewayv2_integration.agents.id}"
}

resource "aws_apigatewayv2_route" "get_agent" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /agents/{name}"
  target    = "integrations/${aws_apigatewayv2_integration.agents.id}"
}

resource "aws_apigatewayv2_route" "patch_agent" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "PATCH /agents/{name}"
  target    = "integrations/${aws_apigatewayv2_integration.agents.id}"
}

resource "aws_apigatewayv2_route" "get_agent_memories" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /agents/{name}/memories"
  target    = "integrations/${aws_apigatewayv2_integration.agents.id}"
}

resource "aws_lambda_permission" "agents" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_agents_arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# --- Messages Routes ---

resource "aws_apigatewayv2_integration" "messages" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = var.lambda_messages_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_agent_messages" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /agents/{name}/messages"
  target    = "integrations/${aws_apigatewayv2_integration.messages.id}"
}

resource "aws_apigatewayv2_route" "post_agent_messages" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /agents/{name}/messages"
  target    = "integrations/${aws_apigatewayv2_integration.messages.id}"
}

resource "aws_apigatewayv2_route" "post_message_read" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /agents/{name}/messages/{messageId}/read"
  target    = "integrations/${aws_apigatewayv2_integration.messages.id}"
}

resource "aws_lambda_permission" "messages" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_messages_arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
