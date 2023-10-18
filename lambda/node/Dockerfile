FROM public.ecr.aws/lambda/nodejs:18 as builder
WORKDIR /app
COPY package.json index.ts  ./
RUN npm install
RUN npm run build
    
FROM public.ecr.aws/lambda/nodejs:18
WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=builder /app/dist/* ./
CMD ["index.handler"]