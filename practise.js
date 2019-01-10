import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
  try {
    const piece = await dynamoDbLib.call("get", {
      TableName: process.env.tableName,
      Key: {
        userId: event.requestContext.identity.cognitoIdentityId,
        pieceId: event.pathParameters.id
      }
    });

    // Only increment if last practise was less that today
    if (piece.item.lastPractisedAt < new Date().setHours(0, 0, 0, 0)) {
      await dynamoDbLib.call("update", {
        TableName: process.env.tableName,
        Key: {
          userId: event.requestContext.identity.cognitoIdentityId,
          pieceId: event.pathParameters.id
        },
        UpdateExpression:
          "SET lastPractisedAt= :lastPractisedAt, practiseCount = :practiseCount",
        ExpressionAttributeValues: {
          ":lastPractisedAt": Date.now(),
          ":practiseCount": result.item.practiseCount + 1
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
