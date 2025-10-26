import React, { useState, useRef } from 'react';
import { attendanceAPI } from '../services/api';

const FaceRecognition = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [recognizedName, setRecognizedName] = useState('');
  const [confidence, setConfidence] = useState('');
  const [status, setStatus] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsRunning(true);
      setStatus('Camera started successfully');
    } catch (error) {
      setStatus('Error accessing camera: ' + error.message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsRunning(false);
    setRecognizedName('');
    setConfidence('');
    setStatus('Camera stopped');
  };


  const simulateRecognition = () => {
    // This is a simulation - in a real implementation, you would send the image to your backend
    // for face recognition processing
    const names = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomConfidence = (Math.random() * 20 + 80).toFixed(1);
    
    setRecognizedName(randomName);
    setConfidence(randomConfidence + '%');
    setStatus(`Recognized: ${randomName} (${randomConfidence}% confidence)`);
  };

  const markAttendance = async () => {
    if (recognizedName) {
      try {
        const response = await attendanceAPI.markAttendance(recognizedName);
        if (response.data.success) {
          setStatus(`Attendance marked for ${recognizedName}`);
        } else {
          setStatus(`Failed to mark attendance: ${response.data.message}`);
        }
      } catch (error) {
        setStatus(`Error marking attendance: ${error.message}`);
      }
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">
            <i className="fas fa-camera me-2"></i>Face Recognition
          </h1>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-video me-2"></i>Camera Feed
              </h5>
            </div>
            <div className="card-body text-center">
              <div className="position-relative d-inline-block">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="img-fluid rounded"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                <canvas
                  ref={canvasRef}
                  style={{ display: 'none' }}
                />
                {recognizedName && (
                  <div className="position-absolute top-0 start-0 p-2">
                    <span className="badge bg-success fs-6">
                      {recognizedName} ({confidence})
                    </span>
                  </div>
                )}
              </div>
              
              <div className="mt-3">
                {!isRunning ? (
                  <button 
                    className="btn btn-success btn-lg me-2"
                    onClick={startCamera}
                  >
                    <i className="fas fa-play me-2"></i>Start Camera
                  </button>
                ) : (
                  <div>
                    <button 
                      className="btn btn-warning btn-lg me-2"
                      onClick={simulateRecognition}
                    >
                      <i className="fas fa-search me-2"></i>Recognize Face
                    </button>
                    <button 
                      className="btn btn-danger btn-lg me-2"
                      onClick={stopCamera}
                    >
                      <i className="fas fa-stop me-2"></i>Stop Camera
                    </button>
                    {recognizedName && (
                      <button 
                        className="btn btn-primary btn-lg"
                        onClick={markAttendance}
                      >
                        <i className="fas fa-check me-2"></i>Mark Attendance
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-info-circle me-2"></i>Status
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <strong>Camera Status:</strong>
                <span className={`badge ms-2 ${isRunning ? 'bg-success' : 'bg-secondary'}`}>
                  {isRunning ? 'Running' : 'Stopped'}
                </span>
              </div>
              
              {recognizedName && (
                <div className="mb-3">
                  <strong>Recognized:</strong>
                  <div className="mt-1">
                    <span className="badge bg-primary fs-6">{recognizedName}</span>
                  </div>
                </div>
              )}
              
              {confidence && (
                <div className="mb-3">
                  <strong>Confidence:</strong>
                  <div className="mt-1">
                    <span className="badge bg-info fs-6">{confidence}</span>
                  </div>
                </div>
              )}
              
              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                {status || 'Ready to start face recognition'}
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-question-circle me-2"></i>Instructions
              </h5>
            </div>
            <div className="card-body">
              <ol className="list-group list-group-numbered">
                <li className="list-group-item border-0 px-0">
                  Click "Start Camera" to begin
                </li>
                <li className="list-group-item border-0 px-0">
                  Position your face in front of the camera
                </li>
                <li className="list-group-item border-0 px-0">
                  Click "Recognize Face" to identify
                </li>
                <li className="list-group-item border-0 px-0">
                  Click "Mark Attendance" to record
                </li>
                <li className="list-group-item border-0 px-0">
                  Click "Stop Camera" when done
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRecognition;
