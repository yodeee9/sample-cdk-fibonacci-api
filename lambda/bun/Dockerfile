# Bunランタイムを持つイメージをビルドステージとして使用
FROM oven/bun:1.0.6 AS builder

WORKDIR /app 
COPY . /app 

# Bunを使用してaws4fetchパッケージをインストール
RUN bun install aws4fetch

# Bunを使用してruntime.tsをコンパイルし、bootstrapという出力ファイルを生成
RUN bun build --compile runtime.ts --outfile bootstrap

# Lambdaのカスタムランタイム用のイメージを指定
FROM public.ecr.aws/lambda/provided:al2

COPY --from=builder /app/index.ts ${LAMBDA_TASK_ROOT}
COPY --from=builder /app/bootstrap ${LAMBDA_RUNTIME_DIR}

CMD ["index.fetch"]