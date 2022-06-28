// Create clients and set shared const values outside of the handler.
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

// Create a DocumentClient that represents the query to add an item
const client = new DynamoDBClient();
const docClient = DynamoDBDocument.from(client);
const tableName = process.env.ITEMS_TABLE;

console.log('Loading function');

export const handler = async (event) => {
    console.log(`Will write to ${tableName}`);
    let successes = 0;
    let failures = 0;
    await Promise.all(event.Records.map(async (record) => {
        // Kinesis data is base64 encoded so decode here
        try {
            var payload = JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString('ascii'));
            payload.bodyLength = payload.body.length;
            console.log('Decoded payload:', payload);
            await docClient.put({
                TableName: tableName,
                Item: payload,
            });
            successes++;
        } catch (err) {
            failures++;
            console.log('ERROR', err);
        }
    }));
    return {
        message: "success",
        statusCode: 200,
        successes,
        failures,
    };
};
