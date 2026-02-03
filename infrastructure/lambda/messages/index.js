// Messages Lambda Handler
// Handles inter-agent messaging
// Repo: https://github.com/andrew-kemp-dahlberg/CLAWDBOT

const { v4: uuidv4 } = require('uuid');
const { success, created, error, notFound, unauthorized, forbidden, serverError } = require('./shared/response');
const { getItem, putItem, updateItem, queryItems } = require('./shared/db');
const { validateApiKey, getApiKey } = require('./shared/auth');

const MESSAGES_TABLE = process.env.MESSAGES_TABLE;
const AGENTS_TABLE = process.env.AGENTS_TABLE;

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
    const agentName = event.pathParameters?.name;
    const messageId = event.pathParameters?.messageId;

    // Route: POST /agents/{name}/messages/{messageId}/read
    if (method === 'POST' && agentName && messageId && path.endsWith('/read')) {
      return await markAsRead(agentName, messageId, auth);
    }

    // Route: GET /agents/{name}/messages
    if (method === 'GET' && agentName) {
      return await getMessages(agentName, event.queryStringParameters || {}, auth);
    }

    // Route: POST /agents/{name}/messages
    if (method === 'POST' && agentName) {
      return await sendMessage(agentName, JSON.parse(event.body || '{}'), auth);
    }

    return error('Method not allowed', 405);
  } catch (err) {
    return serverError(err);
  }
};

async function getMessages(agentName, params, auth) {
  const { unread, direction = 'inbox', limit = '100' } = params;
  const limitNum = Math.min(parseInt(limit), 1000);

  // Check agent exists
  const agent = await getItem(AGENTS_TABLE, { name: agentName });
  if (!agent) {
    return notFound('Agent');
  }

  // Non-admins can only read their own messages
  if (!auth.isAdmin && auth.agent.name !== agentName) {
    return forbidden('Cannot read other agents\' messages');
  }

  let messages;

  if (direction === 'outbox') {
    // Query sent messages using from-timestamp-index
    messages = await queryItems(MESSAGES_TABLE, 'from-timestamp-index', {
      expression: '#from = :from',
      names: { '#from': 'from' },
      values: { ':from': agentName }
    }, { limit: limitNum });
  } else {
    // Query inbox using to-timestamp-index
    const options = { limit: limitNum };

    if (unread === 'true') {
      options.filterExpression = '#read = :read';
      options.filterValues = { ':read': false };
    }

    messages = await queryItems(MESSAGES_TABLE, 'to-timestamp-index', {
      expression: '#to = :to',
      names: { '#to': 'to' },
      values: { ':to': agentName }
    }, options);
  }

  return success(messages);
}

async function sendMessage(recipientName, body, auth) {
  const { from, subject, body: messageBody, replyTo } = body;

  // Validate required fields
  if (!from || !subject || !messageBody) {
    return error('Missing required fields: from, subject, body');
  }

  // Non-admins can only send messages as themselves
  if (!auth.isAdmin && auth.agent.name !== from) {
    return forbidden('Cannot send messages as another agent');
  }

  // Check recipient exists
  const recipient = await getItem(AGENTS_TABLE, { name: recipientName });
  if (!recipient) {
    return notFound('Recipient agent');
  }

  // Check sender exists (unless admin)
  if (!auth.isAdmin) {
    const sender = await getItem(AGENTS_TABLE, { name: from });
    if (!sender) {
      return error('Sender agent not found');
    }
  }

  // If replying, check the original message exists
  if (replyTo) {
    const originalMessage = await getItem(MESSAGES_TABLE, { id: replyTo });
    if (!originalMessage) {
      return error('Reply-to message not found');
    }
  }

  const message = {
    id: uuidv4(),
    from,
    to: recipientName,
    subject,
    body: messageBody,
    timestamp: new Date().toISOString(),
    read: false,
    replyTo: replyTo || null,
    repo: 'https://github.com/andrew-kemp-dahlberg/CLAWDBOT'
  };

  await putItem(MESSAGES_TABLE, message);

  // Update sender's lastActive
  if (!auth.isAdmin) {
    await updateItem(AGENTS_TABLE, { name: from }, {
      lastActive: new Date().toISOString()
    });
  }

  return created(message);
}

async function markAsRead(agentName, messageId, auth) {
  // Check agent exists
  const agent = await getItem(AGENTS_TABLE, { name: agentName });
  if (!agent) {
    return notFound('Agent');
  }

  // Non-admins can only mark their own messages as read
  if (!auth.isAdmin && auth.agent.name !== agentName) {
    return forbidden('Cannot mark other agents\' messages as read');
  }

  // Check message exists
  const message = await getItem(MESSAGES_TABLE, { id: messageId });
  if (!message) {
    return notFound('Message');
  }

  // Check message belongs to this agent
  if (message.to !== agentName) {
    return forbidden('Message does not belong to this agent');
  }

  // Mark as read
  const updated = await updateItem(MESSAGES_TABLE, { id: messageId }, {
    read: true,
    readAt: new Date().toISOString()
  });

  // Update agent's lastActive
  await updateItem(AGENTS_TABLE, { name: agentName }, {
    lastActive: new Date().toISOString()
  });

  return success(updated);
}
