import * as dynamoDbLib from "./dynamodb-lib";

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

  console.log(user);
  // No user? Create one
  if (user.userId) {
    return user;
  } else {
    const newUser = {
      userId: userId,
      name: "stinky",
      versionId: uuid.v1()
    };
    await dynamoDbLib.call("put", {
      TableName: process.env.userTableName,
      Item: newUser
    });
    console.log(newUser);

    return newUser;
  }
}
