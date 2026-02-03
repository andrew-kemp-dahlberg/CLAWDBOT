# Clawdbot Infrastructure

**Repo:** https://github.com/andrew-kemp-dahlberg/CLAWDBOT

Terraform configuration for the Clawdbot Memory API.

## Architecture

- **API Gateway** - HTTP API for REST endpoints
- **Lambda** - Serverless functions for API handlers
- **DynamoDB** - NoSQL tables for memories, agents, messages

## Prerequisites

1. AWS CLI configured with credentials
2. Terraform >= 1.0

## Quick Start

```bash
cd infrastructure/terraform

# Initialize
terraform init

# Plan (see what will be created)
terraform plan

# Apply (create resources)
terraform apply

# Get the API endpoint
terraform output api_endpoint
```

## Configuration

Edit `terraform.tfvars` to customize:

```hcl
aws_region   = "us-east-1"
environment  = "dev"
table_prefix = "clawdbot"
api_name     = "clawdbot-memory-api"
```

## Modules

| Module | Purpose |
|--------|---------|
| `modules/database` | DynamoDB tables |
| `modules/lambda` | Lambda functions |
| `modules/api` | API Gateway |

## Tables

| Table | Hash Key | Sort Key | Purpose |
|-------|----------|----------|---------|
| memories | id | - | All memory entries |
| agents | name | - | Agent registry |
| messages | id | - | Inter-agent messages |

## Indexes

### Memories
- `agent-timestamp-index` - Query by agent, sorted by time
- `type-timestamp-index` - Query by type, sorted by time

### Messages
- `to-timestamp-index` - Inbox queries
- `from-timestamp-index` - Outbox queries

## Deploying Lambda Code

The infrastructure creates placeholder Lambda functions. Deploy actual code:

```bash
# Build and package
cd ../../workspace/api/lambda
npm install
zip -r function.zip .

# Deploy
aws lambda update-function-code \
  --function-name clawdbot-memories-dev \
  --zip-file fileb://function.zip
```

## Costs

With PAY_PER_REQUEST billing:
- DynamoDB: ~$0 for low traffic, scales with usage
- Lambda: Free tier covers 1M requests/month
- API Gateway: ~$1 per million requests

## Cleanup

```bash
terraform destroy
```
