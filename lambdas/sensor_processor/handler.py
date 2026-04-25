import json, boto3, time

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
s3 = boto3.client('s3', region_name='us-east-1')
table = dynamodb.Table('SensorReadings')
BUCKET = 'sensor-data-archive-godfrey'

def lambda_handler(event, context):
    for record in event['Records']:
        payload = json.loads(record['body'])
        ts = int(time.time() * 1000)
        table.put_item(Item={
            'deviceId': payload['deviceId'],
            'timestamp': ts,
            'temperature': str(payload.get('temperature', 0)),
            'humidity': str(payload.get('humidity', 0))
        })
        s3.put_object(
            Bucket=BUCKET,
            Key=f"raw/{payload['deviceId']}/{ts}.json",
            Body=json.dumps(payload),
            ContentType='application/json'
        )
    return {'statusCode': 200}
