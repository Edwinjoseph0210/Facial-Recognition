import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(credentials);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <i className="fas fa-user-check"></i>
          </div>
          <h2>AI Face Recognition</h2>
          <p className="text-muted">Attendance Management System</p>
        </div>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>{error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="mb-3">
            <label for="username" className="form-label">
              <i className="fas fa-user me-2"></i>Username
            </label>
            <input 
              type="text" 
              className="form-control" 
              id="username" 
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="mb-3">
            <label for="password" className="form-label">
              <i className="fas fa-lock me-2"></i>Password
            </label>
            <input 
              type="password" 
              className="form-control" 
              id="password" 
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-login"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Logging in...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt me-2"></i>Login
              </>
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <small className="text-muted">
            Default credentials: admin / admin123
          </small>
        </div>
      </div>
    </div>
  );
};

export default Login;
