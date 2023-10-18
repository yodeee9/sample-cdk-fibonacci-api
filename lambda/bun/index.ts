const fibonacci = (n: number): number => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

export default {
  async fetch(request: Request) {
    // クエリパラメータから数字を取得
    const number = parseInt(new URL(request.url).searchParams.get("number") || "0");

    // フィボナッチ数列の該当の数を計算
    const fibResult = fibonacci(number);

    const responseBody = JSON.stringify({
      number,
      fibonacci: fibResult,
    });

    return new Response(responseBody, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};
