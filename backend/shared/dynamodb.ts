import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_REGION || "us-east-1";
const isLocal = process.env.AWS_SAM_LOCAL === "true" || process.env.NODE_ENV === "test";

// If SAM local is running or in test mode, we might want to connect to a local DynamoDB instance if configured.
// For now, we initialize client with options.
const ddbClientConfig: any = { region };

if (isLocal && process.env.DYNAMODB_ENDPOINT) {
  ddbClientConfig.endpoint = process.env.DYNAMODB_ENDPOINT;
}

export const ddbRawClient = new DynamoDBClient(ddbClientConfig);
export const ddbClient = DynamoDBDocumentClient.from(ddbRawClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const TABLE_NAME = process.env.PORTFOLIO_TABLE || "PortfolioDataTable";
export const HANDSON_TABLE_NAME = process.env.HANDSON_TABLE || "HandsonTable";
export const BLOGS_TABLE_NAME = process.env.BLOGS_TABLE || "BlogsTable";

export async function getItem<T>(pk: string, sk: string): Promise<T | null> {
  const result = await ddbClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: pk, SK: sk },
    })
  );
  return (result.Item as T) || null;
}

export async function putItem<T>(item: T): Promise<T> {
  await ddbClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item as any,
    })
  );
  return item;
}

export async function queryItems<T>(
  pk: string,
  skPrefix?: string
): Promise<T[]> {
  let KeyConditionExpression = "PK = :pk";
  const ExpressionAttributeValues: Record<string, any> = {
    ":pk": pk,
  };

  if (skPrefix) {
    KeyConditionExpression += " AND begins_with(SK, :sk)";
    ExpressionAttributeValues[":sk"] = skPrefix;
  }

  const result = await ddbClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression,
      ExpressionAttributeValues,
    })
  );

  return (result.Items as T[]) || [];
}

export async function deleteItem(pk: string, sk: string): Promise<void> {
  await ddbClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: pk, SK: sk },
    })
  );
}

export async function scanItems<T>(): Promise<T[]> {
  const result = await ddbClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );
  return (result.Items as T[]) || [];
}

export async function scanHandsonItems<T>(): Promise<T[]> {
  const result = await ddbClient.send(
    new ScanCommand({
      TableName: HANDSON_TABLE_NAME,
    })
  );
  return (result.Items as T[]) || [];
}

export async function getHandsonItem<T>(slug: string): Promise<T | null> {
  const result = await ddbClient.send(
    new GetCommand({
      TableName: HANDSON_TABLE_NAME,
      Key: { slug },
    })
  );
  return (result.Item as T) || null;
}

export async function scanBlogItems<T>(): Promise<T[]> {
  const result = await ddbClient.send(
    new ScanCommand({
      TableName: BLOGS_TABLE_NAME,
    })
  );
  return (result.Items as T[]) || [];
}

export async function getBlogItem<T>(slug: string): Promise<T | null> {
  const result = await ddbClient.send(
    new GetCommand({
      TableName: BLOGS_TABLE_NAME,
      Key: { slug },
    })
  );
  return (result.Item as T) || null;
}

export async function putBlogItem<T>(item: T): Promise<T> {
  await ddbClient.send(
    new PutCommand({
      TableName: BLOGS_TABLE_NAME,
      Item: item as any,
    })
  );
  return item;
}

export async function deleteBlogItem(slug: string): Promise<void> {
  await ddbClient.send(
    new DeleteCommand({
      TableName: BLOGS_TABLE_NAME,
      Key: { slug },
    })
  );
}

