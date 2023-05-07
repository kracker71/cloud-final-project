import json
import time
import boto3
import logging
from botocore.exceptions import ClientError
from botocore.vendored import requests
import urllib3
import base64

bucket = "cloud-abfinal-proj"
s3_client = boto3.client("s3")

def lambda_handler(event, context):
    # TODO implement
    transcribe_client = boto3.client('transcribe', region_name = 'us-east-1')
    body = json.loads(event['body'])
    name = body["name"]
    uri = body["file_uri"]
    
    transcribe_client.start_transcription_job(
        TranscriptionJobName = name,
        Media = {
            'MediaFileUri': uri
        },
        MediaFormat = 'wav',
        LanguageCode = 'th-TH',
        OutputBucketName = bucket,
    )
    
    

    max_tries = 60
    while max_tries > 0:
        max_tries -= 1
        job = transcribe_client.get_transcription_job(TranscriptionJobName = name)
        job_status = job['TranscriptionJob']['TranscriptionJobStatus']
        if job_status in ['COMPLETED', 'FAILED']:
            print(job["TranscriptionJob"])
            print(f"Job {name} is {job_status}.")
            if job_status == 'COMPLETED':
                transcript_uri = job['TranscriptionJob']['Transcript']['TranscriptFileUri']
                part = transcript_uri.split("/")
                filename = part[-1]
                content = s3_client.get_object( Bucket = bucket, Key = filename)["Body"].read()
                print(content)
                transcribe_client.delete_transcription_job(TranscriptionJobName=name)
                transcript = json.loads(content)
                transcription_text = transcript['results']['transcripts'][0]['transcript']
                print(transcription_text)
                return {
                    "statusCode" : 200,
                    "body": transcription_text,
                    'headers': {
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                    },
                }
            else:
                transcribe_client.delete_transcription_job(TranscriptionJobName=name)
            return {
                "statusCode": 400,
                "body": "Error",
                'headers': {
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
                },
            }
            # print(f"Waiting for {job_name}. Current status is {job_status}.")
        time.sleep(5)
    return {
        "statusCode" : 404,
        "body" : "Error",
        'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
    }
