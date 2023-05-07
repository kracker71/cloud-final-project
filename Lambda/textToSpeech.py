import json
import codecs
import boto3
import base64
from boto3 import Session
from boto3 import resource
from botocore.exceptions import BotoCoreError, ClientError


def lambda_handler(event, context):

    polly = boto3.client("polly")
    body = json.loads(event['body'])
    text = body["text"]
    
    response = polly.synthesize_speech(
            Text=text,
            OutputFormat="mp3",
            VoiceId="Matthew")
    if "AudioStream" in response:
        audio_data = base64.b64encode(response["AudioStream"].read()).decode("utf-8")
        return {
            "statusCode" : 200,
            "body": audio_data,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
        }
    
    return {
        "statusCode" : 404,
        "body" : "success",
        'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
    }

