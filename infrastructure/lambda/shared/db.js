// DynamoDB utilities
// Repo: https://github.com/andrew-kemp-dahlberg/CLAWDBOT

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true
  }
});

// Get a single item by primary key
async function getItem(tableName, key) {
  const result = await docClient.send(new GetCommand({
    TableName: tableName,
    Key: key
  }));
  return result.Item;
}

// Put an item (create or replace)
async function putItem(tableName, item) {
  await docClient.send(new PutCommand({
    TableName: tableName,
    Item: item
  }));
  return item;
}

// Update an item with expression
async function updateItem(tableName, key, updates) {
  const updateExpressions = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  for (const [field, value] of Object.entries(updates)) {
    if (value !== undefined) {
      updateExpressions.push(`#${field} = :${field}`);
      expressionAttributeNames[`#${field}`] = field;
      expressionAttributeValues[`:${field}`] = value;
    }
  }

  if (updateExpressions.length === 0) {
    return await getItem(tableName, key);
  }

  const result = await docClient.send(new UpdateCommand({
    TableName: tableName,
    Key: key,
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  }));

  return result.Attributes;
}

// Query items using an index
async function queryItems(tableName, indexName, keyCondition, options = {}) {
  const params = {
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: keyCondition.expression,
    ExpressionAttributeValues: keyCondition.values,
    ScanIndexForward: options.ascending ?? false, // Default to newest first
    Limit: options.limit
  };

  if (keyCondition.names) {
    params.ExpressionAttributeNames = keyCondition.names;
  }

  if (options.filterExpression) {
    params.FilterExpression = options.filterExpression;
    if (options.filterValues) {
      Object.assign(params.ExpressionAttributeValues, options.filterValues);
    }
  }

  const result = await docClient.send(new QueryCommand(params));
  return result.Items || [];
}

// Scan all items (use sparingly)
async function scanItems(tableName, options = {}) {
  const params = {
    TableName: tableName,
    Limit: options.limit
  };

  if (options.filterExpression) {
    params.FilterExpression = options.filterExpression;
    params.ExpressionAttributeValues = options.filterValues;
    if (options.filterNames) {
      params.ExpressionAttributeNames = options.filterNames;
    }
  }

  const result = await docClient.send(new ScanCommand(params));
  return result.Items || [];
}

// Delete an item
async function deleteItem(tableName, key) {
  await docClient.send(new DeleteCommand({
    TableName: tableName,
    Key: key
  }));
}

module.exports = {
  docClient,
  getItem,
  putItem,
  updateItem,
  queryItems,
  scanItems,
  deleteItem
};
