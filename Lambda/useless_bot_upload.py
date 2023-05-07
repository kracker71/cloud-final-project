import json
import boto3
from botocore.exceptions import ClientError
from cgi import parse_header, parse_multipart
from io import BytesIO
import base64

S3_BUCKET_NAME = 'cloud-abfinal-proj'
S3_REGION = 'us-east-1'

def lambda_handler(event, context):
    
    print(event)
    print(event['body'])

    fp = BytesIO(base64.b64decode(event['body']))
    content_type = event['headers'].get('Content-Type', '') or event['headers'].get('content-type', '')
    pdict = parse_header(content_type)[1]
    if 'boundary' in pdict:
        pdict['boundary'] = pdict['boundary'].encode('utf-8')
    pdict['CONTENT-LENGTH'] = len(event['body'])
    form_data = parse_multipart(fp, pdict)
    print('form_data=', form_data)
    

    # Access the form data
    audio_file = form_data['audio_file'][0]
    print(audio_file)
    file_name = form_data['file_name'][0]

    #connect with s3 and get object by key
    s3_client = boto3.client("s3")
    response = 'Internal Error'
    try:
        response = s3_client.put_object(Bucket=S3_BUCKET_NAME, Key=f'{file_name}.wav', Body=audio_file,ContentType='audio/wav')
        print(response)
    except:
        return {
            "statusCode": 400,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            "body":response
        }
    
    return {
        "statusCode": 200,
        'headers': {
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST'
            },
        "body": "s3://{}/{}.wav".format(S3_BUCKET_NAME, file_name)
    }
