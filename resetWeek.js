import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  try {
    // Query for each piece
    const result = await dynamoDbLib.call("query", {
      TableName: process.env.tableName,
      KeyConditionExpression: "userId = :userId",
      FilterExpression: "weekPractiseCount > :weekPractiseCount",
      ExpressionAttributeValues: {
        ":userId": event.requestContext.identity.cognitoIdentityId,
        ":weekPractiseCount": 0
      }
    });

    // Loop through each one and set the week practise count to 0
    for (let i = 0; i < result.Items.length; i++) {
      await dynamoDbLib.call("update", {
        TableName: process.env.tableName,
        Key: {
          userId: event.requestContext.identity.cognitoIdentityId,
          pieceId: result.Items[i].pieceId
        },
        UpdateExpression: "SET weekPractiseCount = :weekPractiseCount",
        ExpressionAttributeValues: {
          ":weekPractiseCount": 0
        },
        ReturnValues: "ALL_NEW"
      });
    }
    return success({ status: true });
  } catch (e) {
    console.log(e);
    return failure({ status: false });
  }
}
