import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { v4 } from "uuid";
import * as yup from "yup";

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "Prayers";
const headers = {
  "content-type": "application/json",
};

const schema = yup.object().shape({
  name: yup.string().required(),
  verse: yup.string().required(),
  passage: yup.string().required(),
  percentageComplete: yup.number().required(),
  read: yup.bool().required(),
});

export const createPrayer = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const reqBody = JSON.parse(event.body as string);

    await schema.validate(reqBody, { abortEarly: false });

    const prayer = {
      ...reqBody,
      prayerID: v4(),
    };

    await docClient
      .put({
        TableName: tableName,
        Item: prayer,
      })
      .promise();

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(prayer),
    };
  } catch (e) {
    return handleError(e);
  }
};

class HttpError extends Error {
  constructor(public statusCode: number, body: Record<string, unknown> = {}) {
    super(JSON.stringify(body));
  }
}

const fetchPrayerById = async (id: string) => {
  const output = await docClient
    .get({
      TableName: tableName,
      Key: {
        prayerID: id,
      },
    })
    .promise();

  if (!output.Item) {
    throw new HttpError(404, { error: "Prayer not found" });
  }

  return output.Item;
};

const handleError = (e: unknown) => {
  if (e instanceof yup.ValidationError) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        errors: e.errors,
      }),
    };
  }

  if (e instanceof SyntaxError) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: `invalid request body format : "${e.message}"` }),
    };
  }

  if (e instanceof HttpError) {
    return {
      statusCode: e.statusCode,
      headers,
      body: e.message,
    };
  }

  throw e;
};

export const getPrayer = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const prayer = await fetchPrayerById(event.pathParameters?.id as string);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(prayer),
    };
  } catch (e) {
    return handleError(e);
  }
};

export const updatePrayer = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id as string;

    await fetchPrayerById(id);

    const reqBody = JSON.parse(event.body as string);

    await schema.validate(reqBody, { abortEarly: false });

    const prayer = {
      ...reqBody,
      prayerID: id,
    };

    await docClient
      .put({
        TableName: tableName,
        Item: prayer,
      })
      .promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(prayer),
    };
  } catch (e) {
    return handleError(e);
  }
};

export const deletePrayer = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id as string;

    await fetchPrayerById(id);

    await docClient
      .delete({
        TableName: tableName,
        Key: {
          prayerID: id,
        },
      })
      .promise();

    return {
      statusCode: 204,
      body: "",
    };
  } catch (e) {
    return handleError(e);
  }
};

export const listPrayers = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const output = await docClient
    .scan({
      TableName: tableName,
    })
    .promise();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(output.Items),
  };
};
