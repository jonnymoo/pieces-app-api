import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  // Request body is passed in as a JSON encoded string in 'event.body'

  const data = JSON.parse(event.body);

  const params = {
    TableName: process.env.tableName,
    // 'Item' contains the attributes of the item to be created
    // - 'userId': user identities are federated through the Cognito Idenitity Pool
    //             we will use the identity id as the user id of the authenticated user
    // - 'pieceId': a unique uuid
    // - 'content': parsed from request body
    // - 'createdAt': current Unix timestamp

    Item: {
      userId: event.requestContext.identity.cognitoIdentityId,
      pieceId: uuid.v1(),
      content: data.content,
      createdAt: Date.now(),
      lastPractisedAt: null,
      practiseCount: 0
    }
  };

  try {
    await dynamoDbLib.call("put", params);
    return success(params.Item);
  } catch (e) {
    console.log(e);
    return failure({ status: false });
  }
}
