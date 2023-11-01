import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from "https://deno.land/x/lambda/mod.ts";
import {
  createClient,
  UpdateItemInput,
  PutItemInput,
  ReturnValue,
} from "https://denopkg.com/chiefbiiko/dynamodb/mod.ts";

const ddbClient = createClient({ region: "ap-northeast-1" });

const fibonacci = (n: number): number => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

const updateDynamoDB = async (number: number): Promise<number> => {
  const updateParams: UpdateItemInput = {
    TableName: Deno.env.get("TABLE_NAME") || "",
    Key: { number: number },
    UpdateExpression: "ADD times :inc",
    ExpressionAttributeValues: { ":inc": 1 },
    ReturnValues: "UPDATED_NEW" as ReturnValue,
  };

  // DynamoDBのテーブルにnumberが存在する場合はtimesをインクリメント
  // 存在しない場合は、timesを1で初期化
  try {
    const response = await ddbClient.updateItem(updateParams);
    return parseInt(response.Attributes?.times || "1");
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ConditionalCheckFailedException") {
      const putParams: PutItemInput = {
        TableName: "FibonacciResults",
        Item: { number: number, times: 1 },
      };
      await ddbClient.putItem(putParams);
      return 1;
    } else {
      throw error;
    }
  }
};

export async function handler(event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2> {
  // クエリパラメータから数字を取得
  const number = parseInt(event.queryStringParameters?.number || "0");

  // フィボナッチ数列の該当の数を計算
  const fibResult = fibonacci(number);

  // DynamoDBを更新し、計算回数を取得
  const times = await updateDynamoDB(number);

  return {
    body: JSON.stringify({
      number,
      fibonacci: fibResult,
      times,
    }),
    headers: { "Content-Type": "application/json" },
    statusCode: 200,
  };
}
