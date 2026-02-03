// Shared response utilities for Lambda handlers
// Repo: https://github.com/andrew-kemp-dahlberg/CLAWDBOT

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key, X-Agent-Name',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
};

function success(data, statusCode = 200) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(data)
  };
}

function created(data) {
  return success(data, 201);
}

function error(message, statusCode = 400, details = null) {
  const body = { error: message };
  if (details) body.details = details;

  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body)
  };
}

function notFound(resource = 'Resource') {
  return error(`${resource} not found`, 404);
}

function unauthorized(message = 'Invalid or missing API key') {
  return error(message, 401);
}

function forbidden(message = 'Access denied') {
  return error(message, 403);
}

function serverError(err) {
  console.error('Server error:', err);
  return error('Internal server error', 500);
}

module.exports = {
  success,
  created,
  error,
  notFound,
  unauthorized,
  forbidden,
  serverError,
  CORS_HEADERS
};
