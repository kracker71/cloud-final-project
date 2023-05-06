from fastapi import FastAPI, File, UploadFile
import uuid
import base64
import boto3
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import json
from dotenv import load_dotenv
load_dotenv()
import os

ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
S3_BUCKET_NAME = os.getenv('S3_BUCKET_NAME')

app = FastAPI()

class AudioData(BaseModel):
    name: str
    data: str

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/hello-world")
async def hello_world():
    return {"message": "Hello World"}

@app.post("/upload_audio")
async def upload_audio(audio_file: UploadFile = File(...)):
    # Save the audio file to disk
    filename = audio_file.filename
    with open(filename, "wb") as f:
        contents = await audio_file.read()
        f.write(contents)

    # Upload the audio file to S3
    s3 = boto3.resource('s3', aws_access_key_id=ACCESS_KEY_ID, aws_secret_access_key=SECRET_ACCESS_KEY)
    res = s3.Object(S3_BUCKET_NAME, filename).put(Body=contents)

    # Process the audio file
    # ...

    return {'message': 'Audio file uploaded and processed successfully',
            'data':res}


@app.post("/audio")
async def upload_audio(audio_data: UploadFile = File(...)):
    print(audio_data)
    # Create a unique filename for the audio file
    filename = audio_data.filename
    with open(filename, "wb") as f:
        contents = await audio_data.read()
        f.write(contents)
    

    # Upload the audio file to S3 bucket
    s3 = boto3.resource('s3', aws_access_key_id=ACCESS_KEY_ID, aws_secret_access_key=SECRET_ACCESS_KEY)
    bucket_name = S3_BUCKET_NAME
    url = s3.Bucket(bucket_name).put_object(Key=f'{filename}.wav', Body=contents)

    return {'message': 'Audio file uploaded and processed successfully',
            'data':url}
