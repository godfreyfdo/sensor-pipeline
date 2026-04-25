import json, boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('SensorReadings')

def lambda_handler(event, context):
    device_id = event['pathParameters']['deviceId']
    limit = int((event.get('queryStringParameters') or {}).get('limit', 50))
    resp = table.query(
        KeyConditionExpression=Key('deviceId').eq(device_id),
        ScanIndexForward=False,
        Limit=limit
    )
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps(resp['Items'], default=str)
    }
