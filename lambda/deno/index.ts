import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from "https://deno.land/x/lambda/mod.ts";

const fibonacci = (n: number): number => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

export async function handler(event: APIGatewayProxyEventV2, context: Context): Promise<APIGatewayProxyResultV2> {
  // クエリパラメータから数字を取得
  const number = parseInt(event.queryStringParameters?.number || "0");

  // フィボナッチ数列の計算
  const fibResult = fibonacci(number);

  return {
    body: JSON.stringify({
      number,
      fibonacci: fibResult,
    }),
    headers: { "Content-Type": "application/json" },
    statusCode: 200,
  };
}
