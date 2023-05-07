import json
import boto3
from botocore.exceptions import ClientError
import base64


def lambda_handler(event, context):
    # TODO implement
    body = json.loads(event["body"])
    filename = body["filename"]
    
    s3 = boto3.client("s3")
    bucket = 'cloud-abfinal-proj'
    try:
        response = s3.get_object(Bucket = bucket,Key =filename + ".json")["Body"].read()
        
        transcript = json.loads(response)
        transcription_text = transcript['results']['transcripts'][0]['transcript']
        print(transcription_text)
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
        'body': transcription_text,
        'headers': {
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
    }
