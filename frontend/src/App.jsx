import React, { useEffect, useState } from 'react';
import { ReactMic } from 'react-mic';
import toWav from 'audiobuffer-to-wav';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faStopCircle, faSun, faMoon, faListAlt } from '@fortawesome/free-solid-svg-icons';
import uuid from 'react-uuid';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onStop = async (recordedBlob) => {

    setIsLoading(true); // Set loading to true while processing
    setErrorMessage(''); // Clear any existing error messages
    const fileName = uuid();
    //
    //// Download the audio file
    // const url = URL.createObjectURL(recordedBlob.blob);
    // console.log(url);
    // const link = document.createElement('a');
    // link.href = url;
    // link.download = fileName;
    // link.click();

    try{
      //
      //// Convert the audio file to WAV
      const convertToWav = (blob) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContext.decodeAudioData(reader.result, (buffer) => {
              const wavData = toWav(buffer);
              const wavBlob = new Blob([new DataView(wavData)], { type: 'audio/wav' });
              resolve(wavBlob);
            });
          };
          reader.onerror = reject;
          reader.readAsArrayBuffer(blob);
        });
      };
      //
      //// Upload the audio file to S3
      const uploadAudio = async (wavBlob) => {

        // console.log(fileName)
        // console.log(wavBlob)
      
        // Create a new FormData object
        const formData = new FormData();
        
        // Append the audio file to the form data
        formData.append('audio_file', wavBlob);
        formData.append('file_name', fileName);

        // Upload the audio file
        const url = await fetch('https://uh2gh97h3h.execute-api.us-east-1.amazonaws.com/default/useless-bot', {
          method: 'POST',
          body: formData,
        })
        return url;
      }
      //
      //// Convert the audio file to text using AWS Transcribe
      const speech2text = async (url) => {
        const data = {
          "name": fileName,
          "file_uri":url
        }
        const text = await fetch('https://11gu1ufu1k.execute-api.us-east-1.amazonaws.com/default/speechToText', {
          method: 'POST',
          body: JSON.stringify(data),
        })
        return text
      }
      //
      //// Convert the text to audio using AWS Polly
      const text2speech = async (text) => {
        const data = {
          "text" : text
        }
        const audio = await fetch('https://7g9v1erid8.execute-api.us-east-1.amazonaws.com/default/textToSpeech', {
          method: 'POST',
          body: JSON.stringify(data),
        })
        return audio
      }
      //
      //// Read the stream from the response
      function readStream(reader, arrayBuffer = NaN) {
        return new Promise((resolve, reject) => {
          reader.read().then(({ done, value }) => {
            if (done) {
              // Stream has ended, do any necessary cleanup or handling here
              console.log("Stream ended");
              const decoder = new TextDecoder();
              const text = decoder.decode(arrayBuffer);
              resolve(text); // Resolve the text value
              return;
            }
      
            // Process the chunk of data
            console.log("Received data:", value);
            // Continue reading the stream
            arrayBuffer = arrayBuffer ? new Uint8Array([...arrayBuffer, ...value]) : value;
            readStream(reader, arrayBuffer).then(resolve).catch(reject);
          }).catch(error => {
            // Handle any errors that occur during reading
            console.error("Error reading stream:", error);
            reject(error);
          });
        });
      }
      // Sleep system
      function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
      // Random int
      function randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
      }

      // Start processing the audio file
      const wavBlob = await convertToWav(recordedBlob.blob);

      // Upload the audio file to S3
      const resUrl = await uploadAudio(wavBlob);
      const reader = resUrl.body.getReader(); // Get the reader from the response
      const url = await readStream(reader);

      // Convert the audio file to text using AWS Transcribe
      const resText = await speech2text(url);
      var text = ''
      //Handle error for long processing time
      if (resText.status == 503){

        for (let i = 0; i < 2; i++) {
          console.log(`Waiting ${i} seconds...`);
          await sleep(i * 1000);
        }
        // Get the text from s3 bucket instead
        text = await fetch('https://nls5awfygi.execute-api.us-east-1.amazonaws.com/default/finalget',{
          method: 'POST',
          body : JSON.stringify({filename : fileName})
        }) // Get the text from the response
        if (text.status != 200) {
          console.log("Error")
          // Handle error for long uploading time
          for (let i = 0; i < 5; i++) {
            console.log(`Waiting ${i} seconds...`);
            await sleep(i * 1000);
          }
          text = await fetch('https://nls5awfygi.execute-api.us-east-1.amazonaws.com/default/finalget',{
            method: 'POST',
            body : JSON.stringify({filename : fileName})
          })
        }
      }
      else if (resText.status == 200){
        const reader = resText.body.getReader(); // Get the reader from the response
        text = await readStream(reader);
      }
      else {
        console.log("Error")
        setIsLoading(false);
        setErrorMessage('An error occurred. Please try again.'); // Set the error message
        return;
      }

      const reader2 = text.body.getReader(); // Get the reader from the response
      text = await readStream(reader2); // Get the text string from the reader

      console.log(text);

      // Mapping text to text using mook.json

      //

      // Convert the text to audio using AWS Polly
      const resAudio = await text2speech(text); 
      console.log(resAudio)
      const reader3 = resAudio.body.getReader(); // Get the reader from the response
      const audio = await readStream(reader3);// Get the text string from the reader

      // Decode the base64 audio
      const decodedData = atob(audio);

      // Convert the decoded data into an ArrayBuffer
      const buffer = new ArrayBuffer(decodedData.length);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < decodedData.length; i++) {
        view[i] = decodedData.charCodeAt(i);
      }

      // Create a Blob from the ArrayBuffer with the appropriate MIME type
      const blob = new Blob([buffer], { type: 'audio/mpeg' });
      
      // Play the audio
      const tmp_url = URL.createObjectURL(blob);
      const result = new Audio(tmp_url);
      result.volume = 1;
      result.play();
      
      const rndInt = randomIntFromInterval(1, 3) // random int from 1 to 3

      // Play the effect after 2 seconds
      for (let i = 0; i < 3; i++) {
        console.log(`Waiting ${i} seconds...`);
        await sleep(i * 1000);
      }
      // Play the effect randomly
      if (rndInt == 1) {
        const audio2 = new Audio("effect.mp3");
        audio2.volume = 0.5;
        audio2.play();
      }
      else if (rndInt == 2) {
        const audio3 = new Audio("effect2.mp3");
        audio3.volume = 0.5;
        audio3.play();
      }
      else if (rndInt == 3) {
        const audio4 = new Audio("effect3.mp3");
        audio4.volume = 0.5;
        audio4.play();
      }
      setIsLoading(false);
    }
    catch (err) {
      console.log(err);
      setIsLoading(false);
      setErrorMessage('An error occurred. Please try again.'); // Set the error message
      return;
    }
  };
  
  return (
    <div className={`audio-recorder flex flex-col justify-center items-center h-screen`}>
      <h1 className='p-20'>Audio Recorder</h1>
      <ReactMic
        record={isRecording}
        className="react-mic"
        onStop={onStop}
        mimeType="audio/wav"
      />
      <div className="button-container">
        <button
          className={`record-button ${isRecording ? 'recording' : ''}`}
          onClick={() => setIsRecording((prev) => !prev)}
          disabled={isLoading} // Disable the button when loading
        >
          <FontAwesomeIcon icon={faMicrophone} />
          <span>{isLoading ? 'Loading...' : (isRecording ? 'Recording...' : 'Record')}</span>
        </button>
        {isRecording && (
          <button className="stop-button" onClick={() => setIsRecording(false)} disabled={isLoading}>
            <FontAwesomeIcon icon={faStopCircle} />
            <span>Stop</span>
          </button>
        )}
      </div>
      {errorMessage && (
        <div className="error-popup p-5 bg-red-500 rounded-md m-10">
          <p className='text-[#ffffff]'>{errorMessage}</p>
        </div>
      )}
    </div>
  );
}

export default App;
