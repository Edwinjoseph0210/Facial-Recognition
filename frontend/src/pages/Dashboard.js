import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { dashboardAPI, reportsAPI } from '../services/api';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getDashboardData();
      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const response = await reportsAPI.exportCSV();
      if (response.data.success) {
        // Create a temporary link to download the file
        const link = document.createElement('a');
        link.href = response.data.file;
        link.download = 'attendance_report.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showAlert('CSV exported successfully!', 'success');
      } else {
        showAlert('Failed to export CSV: ' + response.data.message, 'danger');
      }
    } catch (error) {
      showAlert('Error exporting CSV: ' + error.message, 'danger');
    }
  };

  const showAlert = (message, type) => {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('main').insertBefore(alertDiv, document.querySelector('main').firstChild);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="fas fa-exclamation-triangle me-2"></i>{error}
      </div>
    );
  }

  const { today_attendance = [], total_students = 0 } = dashboardData || {};
  
  const presentCount = today_attendance.filter(student => student.status === 'Present').length;
  const partialCount = today_attendance.filter(student => student.status === 'Partial').length;
  const absentCount = today_attendance.filter(student => student.status === 'Absent').length;

  const chartData = {
    labels: ['Present', 'Partial', 'Absent'],
    datasets: [{
      data: [presentCount, partialCount, absentCount],
      backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true
    }
  };

  return (
    <div>
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">
            <i className="fas fa-tachometer-alt me-2"></i>Dashboard
          </h1>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">{total_students}</h4>
                  <p className="card-text">Total Students</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-users fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">{presentCount}</h4>
                  <p className="card-text">Present Today</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-check-circle fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card bg-warning text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">{partialCount}</h4>
                  <p className="card-text">Partial Today</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-clock fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h4 className="card-title">{absentCount}</h4>
                  <p className="card-text">Absent Today</p>
                </div>
                <div className="align-self-center">
                  <i className="fas fa-times-circle fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Today's Attendance */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-calendar-day me-2"></i>Today's Attendance
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Roll Number</th>
                      <th>Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {today_attendance.map((student) => (
                      <tr key={student.id}>
                        <td>{student.roll_number}</td>
                        <td>{student.name}</td>
                        <td>
                          {student.status === 'Present' && (
                            <span className="badge bg-success">Present</span>
                          )}
                          {student.status === 'Partial' && (
                            <span className="badge bg-warning">Partial</span>
                          )}
                          {student.status === 'Absent' && (
                            <span className="badge bg-danger">Absent</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions & Chart */}
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-bolt me-2"></i>Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/class-attendance" className="btn btn-primary">
                  <i className="fas fa-chalkboard-teacher me-2"></i>Take Class Attendance
                </Link>
                <Link to="/face-recognition" className="btn btn-outline-primary">
                  <i className="fas fa-camera me-2"></i>Face Recognition
                </Link>
                <Link to="/students" className="btn btn-outline-primary">
                  <i className="fas fa-users me-2"></i>Manage Students
                </Link>
                <Link to="/reports" className="btn btn-outline-success">
                  <i className="fas fa-chart-bar me-2"></i>View Reports
                </Link>
                <button className="btn btn-outline-info" onClick={exportCSV}>
                  <i className="fas fa-download me-2"></i>Export CSV
                </button>
              </div>
            </div>
          </div>
          
          {/* Attendance Summary Chart */}
          <div className="card mt-3">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="fas fa-chart-pie me-2"></i>Attendance Overview
              </h5>
            </div>
            <div className="card-body">
              <div className="chart-container">
                <Doughnut 
                  key={`chart-${presentCount}-${partialCount}-${absentCount}`}
                  data={chartData} 
                  options={chartOptions} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
