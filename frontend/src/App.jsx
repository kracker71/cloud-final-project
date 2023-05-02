import React, { useState } from 'react';
import { ReactMic } from 'react-mic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faStopCircle, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import './App.css';
// import uploadAudio from '../../api/uploadAudio';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const onStop = async (recordedBlob) => {
    const fileName = 'recording.wav';
    const file = recordedBlob.blob;

    // const url = URL.createObjectURL(file);
    // console.log(url);
    // const link = document.createElement('a');
    // link.href = url;
    // link.download = fileName;
    // link.click();

    const res = await uploadAudio(file,fileName);
    const url = URL.createObjectURL(res);
    const audio = new Audio(url);

    // Play the audio file
    audio.play();
  };

  const handleModeToggle = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className={`audio-recorder ${isDarkMode ? 'dark-mode' : ''} flex flex-col justify-center items-center h-screen`}>
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
