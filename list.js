import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import { getUser } from "./libs/user-lib";

export async function main(event, context) {
  const userId = event.requestContext.identity.cognitoIdentityId;

  const params = {
    TableName: process.env.tableName,
    // 'KeyConditionExpression' defines the condition for the query
    // - 'userId = :userId': only return items with matching 'userId'
    //   partition key
    // 'ExpressionAttributeValues' defines the value in the condition
    // - ':userId': defines 'userId' to be Identity Pool identity id
    //   of the authenticated user
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId
    }
  };

  const versionId = event.pathParameters.versionId;

  try {
    // If we are sending through a version - see if it
    // is the same as we have on the user table - if so
    // we haven't changed so don't bother returning anything
    const user = await getUser(userId);

    if (user.versionId === versionId) {
      return success(null);
    }

    const result = await dynamoDbLib.call("query", params);
    // Return the matching list of items in response body
    return success({
      items: result.Items,
      versionId: user.versionId
    });
  } catch (e) {
    return failure({ status: false });
  }
}
