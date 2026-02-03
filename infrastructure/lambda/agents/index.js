// Agents Lambda Handler
// Handles CRUD operations for agent registry
// Repo: https://github.com/andrew-kemp-dahlberg/CLAWDBOT

const { v4: uuidv4 } = require('uuid');
const { success, created, error, notFound, unauthorized, forbidden, serverError } = require('./shared/response');
const { getItem, putItem, updateItem, queryItems, scanItems } = require('./shared/db');
const { validateApiKey, getApiKey, generateApiKey, hashApiKey } = require('./shared/auth');

const AGENTS_TABLE = process.env.AGENTS_TABLE;
const MEMORIES_TABLE = process.env.MEMORIES_TABLE || process.env.AGENTS_TABLE.replace('agents', 'memories');

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return success({ ok: true });
  }

  try {
    const method = event.requestContext?.http?.method || event.httpMethod;
    const path = event.rawPath || event.path;
    const agentName = event.pathParameters?.name;

    // POST /agents (register new agent) - requires admin or no auth for first agent
    if (method === 'POST' && !agentName) {
      return await registerAgent(JSON.parse(event.body || '{}'), event);
    }

    // All other routes require authentication
    const apiKey = getApiKey(event);
    const auth = await validateApiKey(apiKey, AGENTS_TABLE);

    if (!auth.valid) {
      return unauthorized(auth.error);
    }

    // Route: GET /agents/{name}/memories
    if (method === 'GET' && agentName && path.endsWith('/memories')) {
      return await getAgentMemories(agentName, event.queryStringParameters || {});
    }

    // Route: GET /agents/{name}
    if (method === 'GET' && agentName) {
      return await getAgent(agentName);
    }

    // Route: GET /agents
    if (method === 'GET') {
      return await listAgents(event.queryStringParameters || {});
    }

    // Route: PATCH /agents/{name}
    if (method === 'PATCH' && agentName) {
      return await updateAgent(agentName, JSON.parse(event.body || '{}'), auth);
    }

    return error('Method not allowed', 405);
  } catch (err) {
    return serverError(err);
  }
};

async function registerAgent(body, event) {
  const { name, endpoint, type, description } = body;

  // Validate required fields
  if (!name || !endpoint || !type) {
    return error('Missing required fields: name, endpoint, type');
  }

  // Validate type
  const validTypes = ['file-based', 'webhook', 'human', 'api'];
  if (!validTypes.includes(type)) {
    return error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
  }

  // Validate name format (alphanumeric, dash, underscore)
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    return error('Invalid name. Must contain only letters, numbers, dashes, and underscores');
  }

  // Check if agent already exists
  const existing = await getItem(AGENTS_TABLE, { name });
  if (existing) {
    return error('Agent already exists', 409);
  }

  // Check if this is the first agent (allow without auth) or requires admin
  const agents = await scanItems(AGENTS_TABLE, { limit: 1 });
  const isFirstAgent = agents.length === 0;

  if (!isFirstAgent) {
    // Require admin auth for subsequent registrations
    const apiKey = getApiKey(event);
    const auth = await validateApiKey(apiKey, AGENTS_TABLE);

    if (!auth.valid || !auth.isAdmin) {
      return forbidden('Only admins can register new agents');
    }
  }

  // Generate API key for the new agent
  const apiKey = generateApiKey();
  const apiKeyHash = hashApiKey(apiKey);

  const agent = {
    name,
    endpoint,
    type,
    status: 'active',
    description: description || null,
    apiKeyHash,
    created: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    repo: 'https://github.com/andrew-kemp-dahlberg/CLAWDBOT'
  };

  await putItem(AGENTS_TABLE, agent);

  // Return agent info with the API key (only returned once!)
  return created({
    ...agent,
    apiKey,
    apiKeyHash: undefined, // Don't expose the hash
    warning: 'Save this API key! It will not be shown again.'
  });
}

async function getAgent(name) {
  const agent = await getItem(AGENTS_TABLE, { name });

  if (!agent) {
    return notFound('Agent');
  }

  // Don't expose API key hash
  const { apiKeyHash, ...safeAgent } = agent;
  return success(safeAgent);
}

async function listAgents(params) {
  const { status, type } = params;

  let items;

  if (status) {
    // Query by status using GSI
    items = await queryItems(AGENTS_TABLE, 'status-index', {
      expression: '#status = :status',
      names: { '#status': 'status' },
      values: { ':status': status }
    });
  } else {
    items = await scanItems(AGENTS_TABLE);
  }

  // Filter by type if provided
  if (type) {
    items = items.filter(a => a.type === type);
  }

  // Remove API key hashes
  const safeItems = items.map(({ apiKeyHash, ...rest }) => rest);

  return success(safeItems);
}

async function updateAgent(name, body, auth) {
  const { endpoint, status, description } = body;

  // Check agent exists
  const existing = await getItem(AGENTS_TABLE, { name });
  if (!existing) {
    return notFound('Agent');
  }

  // Non-admins can only update themselves
  if (!auth.isAdmin && auth.agent.name !== name) {
    return forbidden('Cannot update other agents');
  }

  // Validate status if provided
  if (status) {
    const validStatuses = ['active', 'dormant', 'deprecated'];
    if (!validStatuses.includes(status)) {
      return error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
  }

  const updates = {
    lastActive: new Date().toISOString()
  };

  if (endpoint !== undefined) updates.endpoint = endpoint;
  if (status !== undefined) updates.status = status;
  if (description !== undefined) updates.description = description;

  const updated = await updateItem(AGENTS_TABLE, { name }, updates);

  // Don't expose API key hash
  const { apiKeyHash, ...safeAgent } = updated;
  return success(safeAgent);
}

async function getAgentMemories(agentName, params) {
  const { type, limit = '100' } = params;
  const limitNum = Math.min(parseInt(limit), 1000);

  // Check agent exists
  const agent = await getItem(AGENTS_TABLE, { name: agentName });
  if (!agent) {
    return notFound('Agent');
  }

  // Query memories for this agent
  const keyCondition = {
    expression: '#agent = :agent',
    names: { '#agent': 'agent' },
    values: { ':agent': agentName }
  };

  const options = { limit: limitNum };

  if (type) {
    options.filterExpression = '#type = :type';
    options.filterValues = { ':type': type };
    keyCondition.names['#type'] = 'type';
  }

  const memories = await queryItems(MEMORIES_TABLE, 'agent-timestamp-index', keyCondition, options);

  return success(memories);
}
