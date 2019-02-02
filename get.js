import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import { getUser } from "./libs/user-lib";

export async function main(event, context) {
  const userId = event.requestContext.identity.cognitoIdentityId;

  const params = {
    TableName: process.env.tableName,
    // 'Key' defines the partition key and sort key of the item to be retrieved
    // - 'userId': Identity Pool identity id of the authenticated user
    // - 'pieceId': path parameter
    Key: {
      userId: userId,
      pieceId: event.pathParameters.id
    }
  };

  try {
    const user = await getUser(userId);
    const result = await dynamoDbLib.call("get", params);
    if (result.Item) {
      // Return the retrieved item
      return success({ item: result.Item, versionId: user.versionId });
    } else {
      return failure({ status: false, error: "Item not found." });
    }
  } catch (e) {
    return failure({ status: false });
  }
}
