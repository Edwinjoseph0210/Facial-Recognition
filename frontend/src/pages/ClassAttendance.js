import React, { useState, useEffect, useRef } from 'react';
import { attendanceAPI } from '../services/api';

const ClassAttendance = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isAttendanceActive, setIsAttendanceActive] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState('');
  const [recognizedStudents, setRecognizedStudents] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionIntervalRef = useRef(null);

  // Sample data - in a real app, this would come from your database
  const classes = [
    { id: 'class1', name: 'Class 10A', subjects: ['Mathematics', 'Science', 'English', 'History'] },
    { id: 'class2', name: 'Class 10B', subjects: ['Mathematics', 'Science', 'English', 'Geography'] },
    { id: 'class3', name: 'Class 11A', subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics'] },
    { id: 'class4', name: 'Class 11B', subjects: ['Physics', 'Chemistry', 'Computer Science', 'Mathematics'] },
    { id: 'class5', name: 'Class 12A', subjects: ['Physics', 'Chemistry', 'Mathematics', 'English'] },
    { id: 'class6', name: 'Class 12B', subjects: ['Biology', 'Chemistry', 'Mathematics', 'English'] }
  ];

  const getSelectedClassData = () => {
    return classes.find(cls => cls.id === selectedClass);
  };

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
      setCameraActive(true);
      return true;
    } catch (error) {
      console.error('Camera error:', error);
      setAttendanceStatus('Error: Could not access camera');
      return false;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    if (recognitionIntervalRef.current) {
      clearInterval(recognitionIntervalRef.current);
    }
  };

  const simulateFaceRecognition = () => {
    // Simulate face recognition - in real implementation, this would be actual face recognition
    const students = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'Alex Brown'];
    const randomStudent = students[Math.floor(Math.random() * students.length)];
    const confidence = (Math.random() * 20 + 80).toFixed(1);
    
    return { name: randomStudent, confidence: confidence };
  };

  const startAttendance = async () => {
    if (!selectedClass || !selectedSubject) {
      setAttendanceStatus('Please select both class and subject');
      return;
    }

    const cameraStarted = await startCamera();
    if (!cameraStarted) return;

    setIsAttendanceActive(true);
    setAttendanceStatus(`Attendance started for ${getSelectedClassData()?.name} - ${selectedSubject}`);
    setRecognizedStudents([]);

    // Start face recognition simulation
    recognitionIntervalRef.current = setInterval(() => {
      const recognition = simulateFaceRecognition();
      if (recognition.confidence > 85) {
        setRecognizedStudents(prev => {
          const exists = prev.find(student => student.name === recognition.name);
          if (!exists) {
            return [...prev, { 
              name: recognition.name, 
              confidence: recognition.confidence,
              timestamp: new Date().toLocaleTimeString()
            }];
          }
          return prev;
        });
      }
    }, 2000); // Check every 2 seconds
  };

  const stopAttendance = async () => {
    stopCamera();
    setIsAttendanceActive(false);
    setAttendanceStatus('Attendance session ended');
    
    // Mark attendance for recognized students
    for (const student of recognizedStudents) {
      try {
        await attendanceAPI.markAttendance(student.name);
      } catch (error) {
        console.error('Error marking attendance:', error);
      }
    }
    
    setRecognizedStudents([]);
  };

  const resetSelection = () => {
    setSelectedClass('');
    setSelectedSubject('');
    setAttendanceStatus('');
    setRecognizedStudents([]);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div>
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">
            <i className="fas fa-chalkboard-teacher me-2"></i>Class Attendance
          </h1>
        </div>
      </div>

      {/* Hidden video element for face recognition */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: 'none' }}
      />

      <div className="row">
        {/* Class and Subject Selection */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-graduation-cap me-2"></i>Select Class & Subject
              </h5>
            </div>
            <div className="card-body">
              {/* Class Selection */}
              <div className="mb-4">
                <label className="form-label fw-bold">Select Class:</label>
                <div className="row">
                  {classes.map((cls) => (
                    <div key={cls.id} className="col-md-6 mb-2">
                      <button
                        className={`btn w-100 ${selectedClass === cls.id ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => {
                          setSelectedClass(cls.id);
                          setSelectedSubject('');
                        }}
                        disabled={isAttendanceActive}
                      >
                        <i className="fas fa-users me-2"></i>{cls.name}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subject Selection */}
              {selectedClass && (
                <div className="mb-4">
                  <label className="form-label fw-bold">Select Subject:</label>
                  <div className="row">
                    {getSelectedClassData()?.subjects.map((subject, index) => (
                      <div key={index} className="col-md-6 mb-2">
                        <button
                          className={`btn w-100 ${selectedSubject === subject ? 'btn-success' : 'btn-outline-success'}`}
                          onClick={() => setSelectedSubject(subject)}
                          disabled={isAttendanceActive}
                        >
                          <i className="fas fa-book me-2"></i>{subject}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Start/Stop Attendance */}
              <div className="d-grid gap-2">
                {!isAttendanceActive ? (
                  <button
                    className="btn btn-success btn-lg"
                    onClick={startAttendance}
                    disabled={!selectedClass || !selectedSubject}
                  >
                    <i className="fas fa-play me-2"></i>Start Attendance
                  </button>
                ) : (
                  <button
                    className="btn btn-danger btn-lg"
                    onClick={stopAttendance}
                  >
                    <i className="fas fa-stop me-2"></i>End Attendance
                  </button>
                )}
                
                <button
                  className="btn btn-outline-secondary"
                  onClick={resetSelection}
                  disabled={isAttendanceActive}
                >
                  <i className="fas fa-refresh me-2"></i>Reset Selection
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Status and Results */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-clipboard-check me-2"></i>Attendance Status
              </h5>
            </div>
            <div className="card-body">
              {/* Status Display */}
              <div className="mb-3">
                <div className="d-flex align-items-center">
                  <div className={`badge fs-6 me-2 ${isAttendanceActive ? 'bg-success' : 'bg-secondary'}`}>
                    {isAttendanceActive ? 'Active' : 'Inactive'}
                  </div>
                  {cameraActive && (
                    <div className="badge bg-info fs-6">
                      <i className="fas fa-camera me-1"></i>Camera On
                    </div>
                  )}
                </div>
              </div>

              {/* Current Session Info */}
              {selectedClass && selectedSubject && (
                <div className="alert alert-info">
                  <strong>Current Session:</strong><br/>
                  <i className="fas fa-users me-1"></i>{getSelectedClassData()?.name}<br/>
                  <i className="fas fa-book me-1"></i>{selectedSubject}
                </div>
              )}

              {/* Status Message */}
              {attendanceStatus && (
                <div className={`alert ${isAttendanceActive ? 'alert-success' : 'alert-info'}`}>
                  <i className="fas fa-info-circle me-2"></i>{attendanceStatus}
                </div>
              )}

              {/* Recognized Students */}
              {recognizedStudents.length > 0 && (
                <div className="mt-3">
                  <h6 className="fw-bold">Recognized Students ({recognizedStudents.length}):</h6>
                  <div className="list-group">
                    {recognizedStudents.map((student, index) => (
                      <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <i className="fas fa-user-check me-2 text-success"></i>
                          <strong>{student.name}</strong>
                          <br/>
                          <small className="text-muted">Detected at {student.timestamp}</small>
                        </div>
                        <span className="badge bg-success">{student.confidence}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-question-circle me-2"></i>How to Use
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 text-center">
                  <div className="mb-2">
                    <i className="fas fa-mouse-pointer fa-2x text-primary"></i>
                  </div>
                  <h6>1. Select Class</h6>
                  <p className="text-muted small">Choose the class you want to take attendance for</p>
                </div>
                <div className="col-md-3 text-center">
                  <div className="mb-2">
                    <i className="fas fa-book fa-2x text-success"></i>
                  </div>
                  <h6>2. Select Subject</h6>
                  <p className="text-muted small">Choose the subject for the attendance session</p>
                </div>
                <div className="col-md-3 text-center">
                  <div className="mb-2">
                    <i className="fas fa-play fa-2x text-warning"></i>
                  </div>
                  <h6>3. Start Attendance</h6>
                  <p className="text-muted small">Click start to begin face recognition</p>
                </div>
                <div className="col-md-3 text-center">
                  <div className="mb-2">
                    <i className="fas fa-stop fa-2x text-danger"></i>
                  </div>
                  <h6>4. End Session</h6>
                  <p className="text-muted small">Click stop when attendance is complete</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassAttendance;
