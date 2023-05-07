import json
import boto3
from botocore.exceptions import ClientError
import base64


def lambda_handler(event, context):
    # TODO implement
    
    s3 = boto3.client("s3")
    bucket = 'cloud-abfinal-proj'
    try:
        response = s3.get_object(Bucket = bucket,Key ="mook.json")["Body"].read()
        jsons = json.loads(response)
        print(response)
        print(jsons)
        print(type(jsons))
        print(json.dumps(jsons))
    except ClientError as e:
        return {
            "statusCode" : 404,
            "body": json.dumps("Not found file with name {} with error message{}".format(filename,e)),
            'headers': {
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
        }
     
    return {
        'statusCode': 200,
        'body': response,
        'headers': {
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
    }
