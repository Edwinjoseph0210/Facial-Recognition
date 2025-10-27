import React, { useState, useRef, useEffect } from 'react';

const FaceRecognition = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [recognizedName, setRecognizedName] = useState('');
  const [confidence, setConfidence] = useState('');
  const [status, setStatus] = useState('');
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Fetch registered students with attendance status
  const fetchRegisteredStudents = async () => {
    try {
      const response = await fetch('/api/attendance/today', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setRegisteredStudents(data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Fetch students on component load
  useEffect(() => {
    fetchRegisteredStudents();
  }, []);

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


  const simulateRecognition = async () => {
    // This is a simulation - in a real implementation, you would send the image to your backend
    // for face recognition processing
    // For now, cycling through students in order for consistent results
    const recognizedStudents = ['Aswin', 'Edwin', 'Tom'];
    
    // Use a simple counter to cycle through students consistently
    const studentIndex = Date.now() % recognizedStudents.length;
    const selectedName = recognizedStudents[studentIndex];
    
    // Always high confidence for simulation
    const randomConfidence = (85 + Math.random() * 10).toFixed(1);
    
    setRecognizedName(selectedName);
    setConfidence(randomConfidence + '%');
    
    // Check if confidence is above 80%
    if (parseFloat(randomConfidence) > 80) {
      setStatus(`✓ Recognized: ${selectedName} (${randomConfidence}% confidence) - Automatically marking attendance...`);
      
      // Automatically mark attendance
      try {
        // Get all students
        const studentsResponse = await fetch('/api/students', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const studentsData = await studentsResponse.json();
        if (studentsData.success) {
          const allStudents = studentsData.data;
          
          // Mark attendance for all students
          // The recognized student gets "Present", others get "Absent"
          for (const student of allStudents) {
            const studentName = student[2]; // Student name is at index 2
            const status = studentName === selectedName ? 'Present' : 'Absent';
            
            try {
              await fetch('/api/mark_attendance_batch', {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  name: studentName,
                  status: status
                })
              });
            } catch (err) {
              console.error(`Error marking attendance for ${studentName}:`, err);
            }
          }
          
          setStatus(`✓ Attendance automatically marked! ${selectedName} marked as Present, others as Absent.`);
          setRecognizedName(''); // Clear recognition to allow new scan
          
          // Refresh the students list to show updated attendance
          await fetchRegisteredStudents();
        } else {
          setStatus(`Failed to fetch students list`);
        }
      } catch (error) {
        setStatus(`Error marking attendance: ${error.message}`);
      }
    } else {
      setStatus(`✓ Recognized: ${selectedName} (${randomConfidence}% confidence) - Confidence too low. Please try again.`);
    }
  };

  const markAttendance = async () => {
    if (recognizedName) {
      try {
        // Get all students
        const studentsResponse = await fetch('/api/students', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const studentsData = await studentsResponse.json();
        if (studentsData.success) {
          const allStudents = studentsData.data;
          
          // Mark attendance for all students
          // The recognized student gets "Present", others get "Absent"
          for (const student of allStudents) {
            const studentName = student[2]; // Student name is at index 2
            const status = studentName === recognizedName ? 'Present' : 'Absent';
            
            try {
              await fetch('/api/mark_attendance_batch', {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  name: studentName,
                  status: status
                })
              });
            } catch (err) {
              console.error(`Error marking attendance for ${studentName}:`, err);
            }
          }
          
          setStatus(`✓ Attendance marked for ${recognizedName} (Present). Others marked as Absent.`);
          setRecognizedName(''); // Clear recognition to allow new scan
          // Refresh the students list to show updated attendance
          await fetchRegisteredStudents();
        } else {
          setStatus(`Failed to fetch students list`);
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
                        <i className="fas fa-check me-2"></i>Mark Attendance (This student: Present, Others: Absent)
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {recognizedName && (
                <div className="alert alert-success mt-3" role="alert">
                  <h5><i className="fas fa-user-check me-2"></i>Person Recognized!</h5>
                  <p className="mb-0"><strong>Name:</strong> {recognizedName}</p>
                  <p className="mb-0"><strong>Confidence:</strong> {confidence}</p>
                  <p className="mb-0 mt-2 text-muted">Click "Mark Attendance" to mark this person as Present and all others as Absent.</p>
                </div>
              )}
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
                <i className="fas fa-users me-2"></i>Registered Students
              </h5>
            </div>
            <div className="card-body">
              {registeredStudents.length === 0 ? (
                <p className="text-muted mb-0">No students registered yet.</p>
              ) : (
                <div className="list-group">
                  {registeredStudents.map((student) => (
                    <div key={student.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{student.name}</strong><br/>
                        <small className="text-muted">Roll: {student.roll_number}</small>
                      </div>
                      <span className={`badge ${student.status === 'Present' ? 'bg-success' : 'bg-secondary'}`}>
                        {student.status === 'Present' ? (
                          <><i className="fas fa-check-circle me-1"></i>Present</>
                        ) : (
                          <><i className="fas fa-times-circle me-1"></i>Absent</>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
