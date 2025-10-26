import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/dashboard">
            <i className="fas fa-user-check me-2"></i>AI Face Recognition
          </Link>
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link 
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} 
                  to="/dashboard"
                >
                  <i className="fas fa-tachometer-alt me-1"></i>Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  className={`nav-link ${isActive('/students') ? 'active' : ''}`} 
                  to="/students"
                >
                  <i className="fas fa-users me-1"></i>Students
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  className={`nav-link ${isActive('/attendance') ? 'active' : ''}`} 
                  to="/attendance"
                >
                  <i className="fas fa-calendar-check me-1"></i>Attendance
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  className={`nav-link ${isActive('/reports') ? 'active' : ''}`} 
                  to="/reports"
                >
                  <i className="fas fa-chart-bar me-1"></i>Reports
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  className={`nav-link ${isActive('/class-attendance') ? 'active' : ''}`} 
                  to="/class-attendance"
                >
                  <i className="fas fa-chalkboard-teacher me-1"></i>Class Attendance
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  className={`nav-link ${isActive('/face-recognition') ? 'active' : ''}`} 
                  to="/face-recognition"
                >
                  <i className="fas fa-camera me-1"></i>Face Recognition
                </Link>
              </li>
            </ul>
            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <button 
                  className="nav-link dropdown-toggle btn btn-link text-white p-0 border-0" 
                  id="navbarDropdown" 
                  data-bs-toggle="dropdown"
                >
                  <i className="fas fa-user me-1"></i>{user?.username}
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button 
                      className="dropdown-item" 
                      onClick={logout}
                    >
                      <i className="fas fa-sign-out-alt me-1"></i>Logout
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main className="container-fluid mt-4">
        <div className="fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
