import json, boto3

sqs = boto3.client('sqs', region_name='us-east-1')
QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/619071349552/sensor-data-queue'

def lambda_handler(event, context):
    body = json.loads(event.get('body', '{}'))
    sqs.send_message(QueueUrl=QUEUE_URL, MessageBody=json.dumps(body))
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'status': 'ingested'})
    }
