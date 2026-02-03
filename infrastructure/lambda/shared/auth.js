// API Key authentication utilities
// Repo: https://github.com/andrew-kemp-dahlberg/CLAWDBOT

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Generate a new API key
function generateApiKey() {
  return `clawdbot_${crypto.randomBytes(24).toString('hex')}`;
}

// Hash an API key for storage
function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

// Validate API key and return agent info
async function validateApiKey(apiKey, agentsTable) {
  if (!apiKey) {
    return { valid: false, error: 'Missing API key' };
  }

  // Special case: admin key from environment
  const adminKey = process.env.ADMIN_API_KEY;
  if (adminKey && apiKey === adminKey) {
    return { valid: true, agent: { name: 'admin', type: 'admin' }, isAdmin: true };
  }

  const hashedKey = hashApiKey(apiKey);

  try {
    // Look up agent by API key hash
    // Note: In production, you'd want a GSI on apiKeyHash for efficient lookup
    // For now, we'll scan (acceptable for small agent counts)
    const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

    const scanResult = await docClient.send(new ScanCommand({
      TableName: agentsTable,
      FilterExpression: 'apiKeyHash = :hash',
      ExpressionAttributeValues: {
        ':hash': hashedKey
      }
    }));

    if (!scanResult.Items || scanResult.Items.length === 0) {
      return { valid: false, error: 'Invalid API key' };
    }

    const agent = scanResult.Items[0];

    if (agent.status === 'deprecated') {
      return { valid: false, error: 'Agent is deprecated' };
    }

    return { valid: true, agent, isAdmin: false };
  } catch (err) {
    console.error('Auth error:', err);
    return { valid: false, error: 'Authentication failed' };
  }
}

// Extract API key from event
function getApiKey(event) {
  const headers = event.headers || {};
  // Try different header formats (API Gateway normalizes to lowercase)
  return headers['x-api-key'] || headers['X-Api-Key'] || headers['authorization']?.replace('Bearer ', '');
}

// Extract agent name from event (for agent-specific operations)
function getAgentName(event) {
  const headers = event.headers || {};
  return headers['x-agent-name'] || headers['X-Agent-Name'];
}

module.exports = {
  generateApiKey,
  hashApiKey,
  validateApiKey,
  getApiKey,
  getAgentName
};
