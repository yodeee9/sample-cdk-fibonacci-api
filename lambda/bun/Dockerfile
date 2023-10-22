# Bunランタイムを持つイメージをビルドステージとして使用
FROM oven/bun:1.0.6 AS builder

WORKDIR /app 
COPY . /app 

RUN apt-get update && apt-get install -y wget \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Bun公式リポジトリからbun-lambdaパッケージのruntime.tsをダウンロード
RUN wget "https://raw.githubusercontent.com/oven-sh/bun/main/packages/bun-lambda/runtime.ts" 

# runtime.ts内で使用しているaws4fetchパッケージをBunを使用してインストール
RUN bun install aws4fetch

# Bunを使用してruntime.tsをコンパイルし、bootstrapという出力ファイルを生成
RUN bun build --compile runtime.ts --outfile bootstrap

# Lambdaのカスタムランタイム用のイメージを指定
FROM public.ecr.aws/lambda/provided:al2

COPY --from=builder /app/index.ts ${LAMBDA_TASK_ROOT}
COPY --from=builder /app/bootstrap ${LAMBDA_RUNTIME_DIR}

CMD ["index.fetch"]