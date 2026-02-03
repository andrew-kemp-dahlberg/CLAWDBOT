# DynamoDB Tables for Clawdbot Memory API
# Repo: https://github.com/andrew-kemp-dahlberg/CLAWDBOT

# Memories table - stores all memory entries
resource "aws_dynamodb_table" "memories" {
  name         = "${var.table_prefix}-memories-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "agent"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  attribute {
    name = "type"
    type = "S"
  }

  # GSI for querying by agent
  global_secondary_index {
    name            = "agent-timestamp-index"
    hash_key        = "agent"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  # GSI for querying by type
  global_secondary_index {
    name            = "type-timestamp-index"
    hash_key        = "type"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  tags = {
    Name = "Clawdbot Memories"
  }
}

# Agents table - registry of all agents
resource "aws_dynamodb_table" "agents" {
  name         = "${var.table_prefix}-agents-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "name"

  attribute {
    name = "name"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  # GSI for querying active agents
  global_secondary_index {
    name            = "status-index"
    hash_key        = "status"
    projection_type = "ALL"
  }

  tags = {
    Name = "Clawdbot Agents"
  }
}

# Messages table - inter-agent communication
resource "aws_dynamodb_table" "messages" {
  name         = "${var.table_prefix}-messages-${var.environment}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "to"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "S"
  }

  attribute {
    name = "from"
    type = "S"
  }

  # GSI for querying by recipient (inbox)
  global_secondary_index {
    name            = "to-timestamp-index"
    hash_key        = "to"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  # GSI for querying by sender (outbox)
  global_secondary_index {
    name            = "from-timestamp-index"
    hash_key        = "from"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  tags = {
    Name = "Clawdbot Messages"
  }
}
