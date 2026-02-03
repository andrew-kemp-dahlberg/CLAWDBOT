# Lambda Functions for Clawdbot Memory API
# Repo: https://github.com/andrew-kemp-dahlberg/CLAWDBOT

# IAM role for Lambda functions
resource "aws_iam_role" "lambda_role" {
  name = "${var.function_prefix}-lambda-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Policy for DynamoDB access
resource "aws_iam_role_policy" "lambda_dynamodb" {
  name = "${var.function_prefix}-dynamodb-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          var.memories_table_arn,
          "${var.memories_table_arn}/index/*",
          var.agents_table_arn,
          "${var.agents_table_arn}/index/*",
          var.messages_table_arn,
          "${var.messages_table_arn}/index/*"
        ]
      }
    ]
  })
}

# CloudWatch Logs policy
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Placeholder zip for initial deployment
data "archive_file" "lambda_placeholder" {
  type        = "zip"
  output_path = "${path.module}/placeholder.zip"

  source {
    content  = <<EOF
exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Clawdbot API - deploy code to enable', repo: 'https://github.com/andrew-kemp-dahlberg/CLAWDBOT' })
  };
};
EOF
    filename = "index.js"
  }
}

# Memories Lambda function
resource "aws_lambda_function" "memories" {
  function_name = "${var.function_prefix}-memories-${var.environment}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  filename         = data.archive_file.lambda_placeholder.output_path
  source_code_hash = data.archive_file.lambda_placeholder.output_base64sha256

  environment {
    variables = {
      MEMORIES_TABLE = var.memories_table_name
      ENVIRONMENT    = var.environment
      REPO           = "https://github.com/andrew-kemp-dahlberg/CLAWDBOT"
    }
  }
}

# Agents Lambda function
resource "aws_lambda_function" "agents" {
  function_name = "${var.function_prefix}-agents-${var.environment}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  filename         = data.archive_file.lambda_placeholder.output_path
  source_code_hash = data.archive_file.lambda_placeholder.output_base64sha256

  environment {
    variables = {
      AGENTS_TABLE = var.agents_table_name
      ENVIRONMENT  = var.environment
      REPO         = "https://github.com/andrew-kemp-dahlberg/CLAWDBOT"
    }
  }
}

# Messages Lambda function
resource "aws_lambda_function" "messages" {
  function_name = "${var.function_prefix}-messages-${var.environment}"
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  timeout       = 30
  memory_size   = 256

  filename         = data.archive_file.lambda_placeholder.output_path
  source_code_hash = data.archive_file.lambda_placeholder.output_base64sha256

  environment {
    variables = {
      MESSAGES_TABLE = var.messages_table_name
      AGENTS_TABLE   = var.agents_table_name
      ENVIRONMENT    = var.environment
      REPO           = "https://github.com/andrew-kemp-dahlberg/CLAWDBOT"
    }
  }
}
