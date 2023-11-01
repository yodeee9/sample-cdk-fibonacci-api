import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand, PutItemCommand, ReturnValue } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({ region: "ap-northeast-1" });

const fibonacci = (n: number): number => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

const updateDynamoDB = async (number: number): Promise<number> => {
  const updateParams = {
    TableName: process.env.TABLE_NAME || "",
    Key: { number: { N: number.toString() } },
    UpdateExpression: "ADD times :inc",
    ExpressionAttributeValues: { ":inc": { N: "1" } },
    ReturnValues: "UPDATED_NEW" as ReturnValue,
  };

  // DynamoDBのテーブルにnumberが存在する場合はtimesをインクリメント
  // 存在しない場合は、timesを1で初期化
  try {
    const response = await ddbClient.send(new UpdateItemCommand(updateParams));
    return parseInt(response.Attributes?.times.N || "1");
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ConditionalCheckFailedException") {
      const putParams = {
        TableName: process.env.TABLE_NAME || "",
        Item: { number: { N: number.toString() }, times: { N: "1" } },
      };
      await ddbClient.send(new PutItemCommand(putParams));
      return 1;
    } else {
      throw error;
    }
  }
};

export const handler: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event: APIGatewayProxyEvent) => {
  // クエリパラメータから数字を取得
  const number = parseInt(event.queryStringParameters?.number || "0");

  // フィボナッチ数列の該当の数を計算
  const fibResult = fibonacci(number);

  // DynamoDBを更新し、計算回数を取得
  const times = await updateDynamoDB(number);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      number,
      fibonacci: fibResult,
      times,
    }),
  };
};
