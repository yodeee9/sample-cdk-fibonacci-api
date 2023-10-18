import { Stack, StackProps, Duration, aws_apigateway, aws_lambda } from "aws-cdk-lib";
import { Runtime, Tracing, DockerImageFunction, DockerImageCode } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

// Lambdaハンドラのパラメータの型定義
type LambdaFunctionParams = {
  id: string;
  entry: string;
  runtime?: aws_lambda.Runtime;
};

// LambdaハンドラのとAPI Gatewayのパラメータの型定義
type RestApiParams = LambdaFunctionParams & {
  resource: string;
  method: string;
  resourcePath?: string;
};

// Bun Lambda with Dockerのパラメータ
const calculateFibonacciBunParams: RestApiParams = {
  resource: "fibonacci-bun",
  id: "Fibonacci-Bun",
  entry: "lambda/bun",
  method: "GET",
};

// Node Lambdaのパラメータ
const calculateFibonacciNodeParams: RestApiParams = {
  resource: "fibonacci-node",
  id: "Fibonacci-Node",
  entry: "lambda/node",
  runtime: Runtime.NODEJS_18_X,
  method: "GET",
};

// Deno Lambda with Dockerのパラメータ
const calculateFibonacciDenoParams: RestApiParams = {
  resource: "fibonacci-deno",
  id: "Fibonacci-Deno",
  entry: "lambda/deno",
  method: "GET",
};

// API GatewayのRestApiを作成
const createRestApi = (stack: CdkFibonacciApiStack): aws_apigateway.RestApi => {
  return new aws_apigateway.RestApi(stack, "LambdaRuntimePerformanceApi", {
    restApiName: "LambdaRuntimePerformanceApi",
    deployOptions: {
      stageName: "v1",
      tracingEnabled: true,
    },
  });
};

// Lambda関数と、そのAPI Gatewayとの統合を設定
const setupDockerLambdaWithIntegration = (
  stack: CdkFibonacciApiStack,
  restApi: aws_apigateway.RestApi,
  params: RestApiParams
): void => {
  const lambdaFunction = new DockerImageFunction(stack, `${params.id}-function`, {
    code: DockerImageCode.fromImageAsset(params.entry),
    timeout: Duration.seconds(30),
    memorySize: 128,
    tracing: Tracing.ACTIVE,
  });
  attachResourceWithMethod(restApi, lambdaFunction, params);
};

// API Gatewayのリソースにメソッドを追加し、Lambda関数と統合
const attachResourceWithMethod = (
  restApi: aws_apigateway.RestApi,
  lambdaFunction: aws_lambda.IFunction,
  params: RestApiParams
): void => {
  const restApiResource = restApi.root.addResource(params.resource);
  const lambdaIntegration = new aws_apigateway.LambdaIntegration(lambdaFunction);
  restApiResource.addMethod(params.method, lambdaIntegration);
};

export class CdkFibonacciApiStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // API Gateway RestAPIの作成
    const restApi = createRestApi(this);

    // Bun Lambda with Dockerの作成
    setupDockerLambdaWithIntegration(this, restApi, calculateFibonacciBunParams);

    // Node Lambdaの作成
    setupDockerLambdaWithIntegration(this, restApi, calculateFibonacciNodeParams);

    // Deno Lambda with Dockerの作成
    setupDockerLambdaWithIntegration(this, restApi, calculateFibonacciDenoParams);
  }
}
