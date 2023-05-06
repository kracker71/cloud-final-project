import time
import boto3
import json
import logging
from botocore.exceptions import ClientError
import requests

logger = logging.getLogger(__name__)

def transcribe_file(job_name, file_uri, transcribe_client):
    transcribe_client.start_transcription_job(
        TranscriptionJobName = job_name,
        Media = {
            'MediaFileUri': file_uri
        },
        MediaFormat = 'mp3',
        LanguageCode = 'th-TH',
        OutputBucketName = 'cloud-abfinal-proj'
    )

    max_tries = 60
    while max_tries > 0:
        max_tries -= 1
        job = transcribe_client.get_transcription_job(TranscriptionJobName = job_name)
        job_status = job['TranscriptionJob']['TranscriptionJobStatus']
        if job_status in ['COMPLETED', 'FAILED']:
            print(f"Job {job_name} is {job_status}.")
            if job_status == 'COMPLETED':
                transcript_uri = job['TranscriptionJob']['Transcript']['TranscriptFileUri']
                file = requests.get(transcript_uri)
                try:
                    transcribe_client.delete_transcription_job(
                        TranscriptionJobName=job_name)
                    logger.info("Deleted job %s.", job_name)
                except ClientError:
                    logger.exception("Couldn't delete job %s.", job_name)
                    raise
                transcript = json.loads(file.content)
                transcription_text = transcript['results']['transcripts'][0]['transcript']
                return {"text": transcription_text}
                # break
            return {"text": "Error"}
        else:
            print(f"Waiting for {job_name}. Current status is {job_status}.")
        time.sleep(5)


def speechToText(file_uri):
    transcribe_client = boto3.client('transcribe', region_name = 'us-east-1')
    # file_uri ="s3://cloud-abfinal-proj/thai_test3.wav"
    transcribe_file('test', file_uri, transcribe_client)

# speechToText("s3://cloud-abfinal-proj/thai_test3.wav")
