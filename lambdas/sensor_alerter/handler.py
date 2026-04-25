import json, boto3

sns = boto3.client('sns', region_name='us-east-1')
TOPIC_ARN = 'arn:aws:sns:us-east-1:619071349552:sensor-alerts'
THRESHOLD = 35.0

def lambda_handler(event, context):
    for record in event['Records']:
        payload = json.loads(record['body'])
        temp = float(payload.get('temperature', 0))
        if temp > THRESHOLD:
            sns.publish(
                TopicArn=TOPIC_ARN,
                Subject=f"ALERT: {payload['deviceId']} temp critical",
                Message=(
                    f"Device: {payload['deviceId']}\n"
                    f"Temperature: {temp}C\n"
                    f"Threshold: {THRESHOLD}C\n"
                    f"Humidity: {payload.get('humidity')}%"
                )
            )
    return {'statusCode': 200}
