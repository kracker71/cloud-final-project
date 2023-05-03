"""Getting Started Example for Python 2.7+/3.3+"""
from boto3 import Session
from botocore.exceptions import BotoCoreError, ClientError
from contextlib import closing
import os
import sys
import subprocess
from tempfile import gettempdir
import base64

# Create a client using the credentials and region defined in the [adminuser]
# section of the AWS credentials file (~/.aws/credentials).
def text_to_speech(text):
    session = Session(profile_name="adminuser") 
    polly = session.client("polly")

    # text = input("Enter the text you want to convert to speech: ")

    try:
        # Request speech synthesis
        response = polly.synthesize_speech(Text=text, OutputFormat="mp3",
                                            VoiceId="Raveena")
    except (BotoCoreError, ClientError) as error:
        # The service returned an error, exit gracefully
        print(error)
        sys.exit(-1)

    # Access the audio stream from the response
    if "AudioStream" in response:
        audio_data = base64.b64encode(response["AudioStream"].read()).decode("utf-8")
        return {"audio": audio_data}
        # with closing(response["AudioStream"]) as stream:
        #     output = os.path.join(gettempdir(), "speech.mp3")

        #     try:
        #         # Open a file for writing the output as a binary stream
        #         with open(output, "wb") as file:
        #             file.write(stream.read())
        #     except IOError as error:
        #         # Could not write to file, exit gracefully
        #         print(error)
        #         sys.exit(-1)

    else:
        # The response didn't contain audio data, exit gracefully
        print("Could not stream audio")
        sys.exit(-1)

    # Play the audio using the platform's default player
    # if sys.platform == "win32":
    #     os.startfile(output)
    # else:
    #     # The following works on macOS and Linux. (Darwin = mac, xdg-open = linux).
    #     opener = "open" if sys.platform == "darwin" else "xdg-open"
    #     subprocess.call([opener, output])