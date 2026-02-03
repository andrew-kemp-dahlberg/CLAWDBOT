#!/bin/bash
# Deploy Lambda functions
# Repo: https://github.com/andrew-kemp-dahlberg/CLAWDBOT

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LAMBDA_DIR="$(dirname "$SCRIPT_DIR")"
BUILD_DIR="$LAMBDA_DIR/build"
ENVIRONMENT="${ENVIRONMENT:-dev}"
FUNCTION_PREFIX="${FUNCTION_PREFIX:-clawdbot}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[DEPLOY]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

deploy_function() {
    local function_name=$1
    local full_name="${FUNCTION_PREFIX}-${function_name}-${ENVIRONMENT}"

    log "Deploying $function_name..."

    # Create build directory
    rm -rf "$BUILD_DIR/$function_name"
    mkdir -p "$BUILD_DIR/$function_name"

    # Copy function code
    cp "$LAMBDA_DIR/$function_name/index.js" "$BUILD_DIR/$function_name/"

    # Copy shared modules
    mkdir -p "$BUILD_DIR/$function_name/shared"
    cp "$LAMBDA_DIR/shared/"*.js "$BUILD_DIR/$function_name/shared/"

    # Install dependencies (minimal package.json for production)
    cat > "$BUILD_DIR/$function_name/package.json" << EOF
{
  "name": "clawdbot-$function_name",
  "version": "1.0.0",
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.500.0",
    "@aws-sdk/lib-dynamodb": "^3.500.0",
    "uuid": "^9.0.0"
  }
}
EOF

    cd "$BUILD_DIR/$function_name"
    npm install --production --silent

    # Create zip
    zip -r -q "../${function_name}.zip" .

    # Deploy to AWS
    log "Updating Lambda function: $full_name"
    aws lambda update-function-code \
        --function-name "$full_name" \
        --zip-file "fileb://$BUILD_DIR/${function_name}.zip" \
        --output text \
        --query 'FunctionArn'

    log "Deployed $function_name successfully"
}

# Main
case "$1" in
    memories|agents|messages)
        deploy_function "$1"
        ;;
    all)
        deploy_function "memories"
        deploy_function "agents"
        deploy_function "messages"
        log "All functions deployed!"
        ;;
    *)
        echo "Usage: $0 {memories|agents|messages|all}"
        exit 1
        ;;
esac
