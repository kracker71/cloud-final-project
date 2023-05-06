import React, { useEffect, useState } from 'react';
import { ReactMic } from 'react-mic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faStopCircle, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import uuid from 'react-uuid';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);

  const onStop = (recordedBlob) => {
    
    const fileName = uuid();
    const file = recordedBlob.blob;

    console.log(fileName)
    console.log(file)
  
    // Create a new FormData object
    const formData = new FormData();
    
    // Append the audio file to the form data
    formData.append('audio_file', file);
    formData.append('file_name', fileName);
    
    // console.log(formData)

    // Upload the audio file
    const response = await fetch('https://uh2gh97h3h.execute-api.us-east-1.amazonaws.com/default/useless-bot', {
      method: 'POST',
      body: formData,
      mode: 'no-cors',
    })
    console.log(response);
  
    // Play the audio file
    const url = URL.createObjectURL(data);
    const audio = new Audio(url);
    // audio.volume = 1;
    audio.play();

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

    
  };
  
  return (
    <div className={`audio-recorder flex flex-col justify-center items-center h-screen`}>
      <h1>Audio Recorder</h1>
      <ReactMic
        record={isRecording}
        className="react-mic"
        onStop={onStop}
        mimeType="audio/wav"
      />
      <div className="button-container">
        <button className={`record-button ${isRecording ? 'recording' : ''}`} onClick={() => setIsRecording((prev) => !prev)}>
          <FontAwesomeIcon icon={faMicrophone} />
          <span>{isRecording ? 'Recording...' : 'Record'}</span>
        </button>
        {isRecording && (
          <button className="stop-button" onClick={() => setIsRecording(false)}>
            <FontAwesomeIcon icon={faStopCircle} />
            <span>Stop</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
