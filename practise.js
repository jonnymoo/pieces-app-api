import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import { updateVersion } from "./libs/user-lib";

export async function main(event, context) {
  const userId = event.requestContext.identity.cognitoIdentityId;

  try {
    const version = await updateVersion(userId);

    const piece = await dynamoDbLib.call("get", {
      TableName: process.env.tableName,
      Key: {
        userId: userId,
        pieceId: event.pathParameters.id
      }
    });

    // Only increment if last practise was less that today
    if (
      !piece.Item.lastPractisedAt ||
      piece.Item.lastPractisedAt < new Date().setHours(0, 0, 0, 0)
    ) {
      console.log("updating");
      await dynamoDbLib.call("update", {
        TableName: process.env.tableName,
        Key: {
          userId: userId,
          pieceId: event.pathParameters.id
        },
        UpdateExpression:
          "SET lastPractisedAt= :lastPractisedAt, practiseCount = :practiseCount, weekPractiseCount = :weekPractiseCount",
        ExpressionAttributeValues: {
          ":lastPractisedAt": Date.now(),
          ":practiseCount": piece.Item.practiseCount
            ? piece.Item.practiseCount + 1
            : 1,
          ":weekPractiseCount": piece.Item.weekPractiseCount
            ? piece.Item.weekPractiseCount + 1
            : 1
        },
        ReturnValues: "ALL_NEW"
      });
    }

    return success({ version });
  } catch (e) {
    console.log(e);
    return failure({ status: false });
  }
}
