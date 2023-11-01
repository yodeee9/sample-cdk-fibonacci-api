import { Stack, StackProps, Duration, aws_apigateway, aws_lambda, RemovalPolicy } from "aws-cdk-lib";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

// Rest API パラメータの型定義
type RestApiParams = {
  id: string;
  entry: string;
  runtime?: aws_lambda.Runtime;
  resource: string;
  method: string;
  resourcePath?: string;
};

// Bun LambdaのRestAPIパラメータ
const calculateFibonacciBunParams: RestApiParams = {
  resource: "fibonacci-bun",
  id: "Fibonacci-Bun",
  entry: "lambda/bun",
  method: "GET",
};

// 速度検証のための他ランタイムのLambda関数のパラメータ
// 使用する場合は、以下のコメントアウトを外してください。
/*
// Node.js LambdaのRestAPIパラメータ
const calculateFibonacciNodeParams: RestApiParams = {
  resource: "fibonacci-node",
  id: "Fibonacci-Node",
  entry: "lambda/node",
  runtime: aws_lambda.Runtime.NODEJS_18_X,
  method: "GET",
};

// Deno LambdaのRestAPIパラメータ
const calculateFibonacciDenoParams: RestApiParams = {
  resource: "fibonacci-deno",
  id: "Fibonacci-Deno",
  entry: "lambda/deno",
  method: "GET",
};
*/

// API Gateway RestApiを作成
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
  params: RestApiParams,
  table: Table
): void => {
  const lambdaFunction = new aws_lambda.DockerImageFunction(stack, `${params.id}-function`, {
    code: aws_lambda.DockerImageCode.fromImageAsset(params.entry),
    timeout: Duration.seconds(30),
    memorySize: 128,
    tracing: aws_lambda.Tracing.ACTIVE,
    environment: {
      TABLE_NAME: table.tableName,
    },
  });

  table.grantReadWriteData(lambdaFunction);

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

    const table = new Table(this, "FibonacciResults", {
      partitionKey: { name: "number", type: AttributeType.NUMBER },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // API Gateway RestAPIの作成
    const restApi = createRestApi(this);

    // Bun Lambdaの作成
    setupDockerLambdaWithIntegration(this, restApi, calculateFibonacciBunParams, table);

    // 速度検証のための他ランタイムLambda関数
    // 使用する場合は、以下のコメントを外してください。
    /*
    // Node.js Lambdaの作成
    setupDockerLambdaWithIntegration(this, restApi, calculateFibonacciNodeParams, table);

    // Deno Lambdaの作成
    setupDockerLambdaWithIntegration(this, restApi, calculateFibonacciDenoParams, table);
    */
  }
}
