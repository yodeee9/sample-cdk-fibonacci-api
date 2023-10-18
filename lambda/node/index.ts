import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda";

const fibonacci = (n: number): number => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

export const handler: Handler<APIGatewayProxyEvent, APIGatewayProxyResult> = async (event: {
  queryStringParameters: { number: string };
}) => {
  // クエリパラメータから数字を取得
  const number = parseInt(event.queryStringParameters?.number || "0");

  // フィボナッチ数列の該当の数を計算
  const fibResult = fibonacci(number);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      number,
      fibonacci: fibResult,
    }),
  };
};
