import * as dynamoDbLib from "./dynamodb-lib";
import uuid from "uuid";

export async function updateVersion(userId) {
  const params = {
    TableName: process.env.userTableName,
    Key: {
      userId: event.requestContext.identity.cognitoIdentityId
    },
    UpdateExpression: "SET versionId = :versionId",
    ExpressionAttributeValues: {
      ":versionId": uuid.v1()
    },
    ReturnValues: "ALL_NEW"
  };

  return await dynamoDbLib.call("update", params);
}

export async function getUser(userId) {
  const user = await dynamoDbLib.call("get", {
    TableName: process.env.userTableName,
    Key: {
      userId: userId
    }
  });

  console.log("Get User user", user);
  console.log("Get User user.UserID", user.userId);
  // No user? Create one
  if (user.Item) {
    console.log("returning user");
    return user.Item;
  } else {
    console.log("creating new user");
    const newUser = {
      userId: userId,
      name: "stinky",
      versionId: uuid.v1()
    };
    await dynamoDbLib.call("put", {
      TableName: process.env.userTableName,
      Item: newUser
    });

    console.log("Get User newUser", newUser);

    return newUser;
  }
}
