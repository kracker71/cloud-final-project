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

    setIsLoading(true);
    setErrorMessage(''); // Clear any existing error messages

    // const url = URL.createObjectURL(recordedBlob.blob);
    // console.log(url);
    // const link = document.createElement('a');
    // link.href = url;
    // link.download = fileName;
    // link.click();

    try{
      const fileName = uuid();
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

      const uploadAudio = async (wavBlob) => {

        console.log(fileName)
        console.log(wavBlob)
      
        // Create a new FormData object
        const formData = new FormData();
        
        // Append the audio file to the form data
        formData.append('audio_file', wavBlob);
        formData.append('file_name', fileName);
        
        // console.log(formData)

        // Upload the audio file
        const url = await fetch('https://uh2gh97h3h.execute-api.us-east-1.amazonaws.com/default/useless-bot', {
          method: 'POST',
          body: formData,
        })
        return url;
      }
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
            readStream(reader, value).then(resolve).catch(reject);
          }).catch(error => {
            // Handle any errors that occur during reading
            console.error("Error reading stream:", error);
            reject(error);
          });
        });
      }

      const wavBlob = await convertToWav(recordedBlob.blob);
      const resUrl = await uploadAudio(wavBlob);
      const reader = resUrl.body.getReader();
      const url = await readStream(reader);
      console.log(url);
      
      try{
        const text = await speech2text(url);
        console.log(text);
      }
      catch (err) {
        console.log(err);
        setErrorMessage('An error occurred. Please try again.'); // Set the error message
        setIsLoading(false);
        return;
      }

      // const audio = await text2speech(text.body);
      // console.log(audio);
    
      // // Play the audio file
      // const tmp_url = URL.createObjectURL(audio);
      // const result = new Audio(tmp_url);
      // // audio.volume = 1;
      // result.play();

      function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }

      function randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
      }
      
      const rndInt = randomIntFromInterval(1, 3)

      for (let i = 0; i < 2; i++) {
        console.log(`Waiting ${i} seconds...`);
        await sleep(i * 1000);
    }
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
