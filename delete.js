import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import { updateVersion } from "./libs/user-lib";

export async function main(event, context) {
  const userId = event.requestContext.identity.cognitoIdentityId;

  const params = {
    TableName: process.env.tableName,
    // 'Key' defines the partition key and sort key of the item to be removed
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'pieceId': path parameter
    Key: {
      userId: userId,
      pieceId: event.pathParameters.id
    }
  };

  try {
    const version = await updateVersion(userId);
    const result = await dynamoDbLib.call("delete", params);
    return success({ version: version });
  } catch (e) {
    return failure({ status: false });
  }
}
