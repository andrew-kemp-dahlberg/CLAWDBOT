// Memories Lambda Handler
// Handles CRUD operations for memory entries
// Repo: https://github.com/andrew-kemp-dahlberg/CLAWDBOT

const { v4: uuidv4 } = require('uuid');
const { success, created, error, notFound, unauthorized, serverError } = require('./shared/response');
const { getItem, putItem, queryItems, scanItems } = require('./shared/db');
const { validateApiKey, getApiKey } = require('./shared/auth');

const MEMORIES_TABLE = process.env.MEMORIES_TABLE;
const AGENTS_TABLE = process.env.AGENTS_TABLE || process.env.MEMORIES_TABLE.replace('memories', 'agents');

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return success({ ok: true });
  }

  try {
    // Validate API key
    const apiKey = getApiKey(event);
    const auth = await validateApiKey(apiKey, AGENTS_TABLE);

    if (!auth.valid) {
      return unauthorized(auth.error);
    }

    const method = event.requestContext?.http?.method || event.httpMethod;
    const path = event.rawPath || event.path;

    // Route: GET /memories/{id}
    if (method === 'GET' && event.pathParameters?.id) {
      return await getMemory(event.pathParameters.id);
    }

    // Route: GET /memories
    if (method === 'GET') {
      return await listMemories(event.queryStringParameters || {}, auth);
    }

    // Route: POST /memories
    if (method === 'POST') {
      return await createMemory(JSON.parse(event.body || '{}'), auth);
    }

    return error('Method not allowed', 405);
  } catch (err) {
    return serverError(err);
  }
};

async function getMemory(id) {
  const memory = await getItem(MEMORIES_TABLE, { id });

  if (!memory) {
    return notFound('Memory');
  }

  return success(memory);
}

async function listMemories(params, auth) {
  const { agent, type, since, until, limit = '100', offset = '0' } = params;
  const limitNum = Math.min(parseInt(limit), 1000);

  let items = [];

  // Query by agent using GSI
  if (agent) {
    const keyCondition = {
      expression: '#agent = :agent',
      names: { '#agent': 'agent' },
      values: { ':agent': agent }
    };

    // Add timestamp range if provided
    if (since && until) {
      keyCondition.expression += ' AND #ts BETWEEN :since AND :until';
      keyCondition.names['#ts'] = 'timestamp';
      keyCondition.values[':since'] = since;
      keyCondition.values[':until'] = until;
    } else if (since) {
      keyCondition.expression += ' AND #ts >= :since';
      keyCondition.names['#ts'] = 'timestamp';
      keyCondition.values[':since'] = since;
    } else if (until) {
      keyCondition.expression += ' AND #ts <= :until';
      keyCondition.names['#ts'] = 'timestamp';
      keyCondition.values[':until'] = until;
    }

    const options = { limit: limitNum };

    // Filter by type if provided
    if (type) {
      options.filterExpression = '#type = :type';
      options.filterValues = { ':type': type };
      if (!keyCondition.names) keyCondition.names = {};
      keyCondition.names['#type'] = 'type';
    }

    items = await queryItems(MEMORIES_TABLE, 'agent-timestamp-index', keyCondition, options);
  }
  // Query by type using GSI
  else if (type) {
    const keyCondition = {
      expression: '#type = :type',
      names: { '#type': 'type' },
      values: { ':type': type }
    };

    if (since) {
      keyCondition.expression += ' AND #ts >= :since';
      keyCondition.names['#ts'] = 'timestamp';
      keyCondition.values[':since'] = since;
    }

    items = await queryItems(MEMORIES_TABLE, 'type-timestamp-index', keyCondition, { limit: limitNum });
  }
  // Full scan (not recommended for large datasets)
  else {
    const options = { limit: limitNum };

    if (since || until) {
      const filters = [];
      const filterValues = {};

      if (since) {
        filters.push('#ts >= :since');
        filterValues[':since'] = since;
      }
      if (until) {
        filters.push('#ts <= :until');
        filterValues[':until'] = until;
      }

      options.filterExpression = filters.join(' AND ');
      options.filterValues = filterValues;
      options.filterNames = { '#ts': 'timestamp' };
    }

    items = await scanItems(MEMORIES_TABLE, options);
    // Sort by timestamp descending
    items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  // Apply offset
  const offsetNum = parseInt(offset);
  if (offsetNum > 0) {
    items = items.slice(offsetNum);
  }

  return success({
    data: items.slice(0, limitNum),
    total: items.length,
    limit: limitNum,
    offset: offsetNum
  });
}

async function createMemory(body, auth) {
  const { agent, type, summary, content, metadata } = body;

  // Validate required fields
  if (!agent || !type || !summary) {
    return error('Missing required fields: agent, type, summary');
  }

  // Validate type
  const validTypes = ['api_call', 'decision', 'learning', 'message', 'session'];
  if (!validTypes.includes(type)) {
    return error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
  }

  // Non-admins can only create memories for themselves
  if (!auth.isAdmin && auth.agent.name !== agent) {
    return error(`Cannot create memories for other agents`, 403);
  }

  const memory = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    agent,
    type,
    summary,
    content: content || null,
    metadata: metadata || {},
    repo: 'https://github.com/andrew-kemp-dahlberg/CLAWDBOT'
  };

  await putItem(MEMORIES_TABLE, memory);

  return created(memory);
}
