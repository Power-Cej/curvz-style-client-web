import React, { useEffect, useRef, useState } from 'react';
import './App.css';

const App = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [timer, setTimer] = useState(null);
  const [data, setData] = useState(undefined);

  const [timerActive] = useState(false); // Added timerActive state

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error('Error accessing the camera:', err);
    }
  };

  useEffect(() => {
    startCamera();
  }, []);

  const toggleTimer = () => {
    if (!timer) {
      setTimer(5);
      const timerInterval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);

      setTimeout(async () => {
        clearInterval(timerInterval);
        takePicture();
      }, 5000);
    }
  };

  const takePicture = () => {
    const context = canvasRef.current.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, 640, 480);
    const imageData = canvasRef.current.toDataURL('image/jpeg');

    fetch(import.meta.env.VITE_CALC_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageData }),
    })
      .then(response => response.json())
      .then(data => {
        setData(data);
        console.log(data);
      })
      .catch(error => console.error('Error uploading picture:', error));
  };

  return (
    <div className="content">
      <h1>React Camera</h1>
      <div className="rectangle"></div>
      <video ref={videoRef} width="640" height="480" autoPlay />
      <canvas ref={canvasRef} style={{ display: 'none' }} width="640" height="480" />
      <div style={{ margin: 20 }}>
        {/* Display Timer */}
        {timer !== null && timer !== 0 && <p>{timer} seconds remaining</p>}

        {/* Button to Toggle Timer */}
        <button onClick={toggleTimer} disabled={timerActive}>
          <i className={`fas ${timer ? 'fa-toggle-on' : 'fa-toggle-off'}`} />
          5s Timer
        </button>

        {/* Button to Take Picture */}
        <button onClick={takePicture} disabled={timerActive}>
          <i className="fas fa-camera" /> Take Picture
        </button>

        {/* Display Result */}
        {data === undefined ? (
          <p>Loading...</p>
        ) : (
          <ul>
            <li>Shoulder: {data.shoulder_width_cm}</li>
            <li>Top: {data.top_length_cm}</li>
            <li>Leg: {data.leg_length_cm}</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default App;
