import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import { updateVersion } from "./libs/user-lib";

export async function main(event, context) {
  const userId = event.requestContext.identity.cognitoIdentityId;

  // Request body is passed in as a JSON encoded string in 'event.body'
  const data = JSON.parse(event.body);

  const params = {
    TableName: process.env.tableName,
    Item: {
      userId: userId,
      pieceId: uuid.v1(),
      content: data.content,
      createdAt: Date.now(),
      lastPractisedAt: null,
      practiseCount: 0
    }
  };

  try {
    const version = await updateVersion(userId);
    await dynamoDbLib.call("put", params);
    return success({ item: params.Item, version: version });
  } catch (e) {
    console.log(e);
    return failure({ status: false });
  }
}
