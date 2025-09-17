// Login.js (Common Login Component for both users and admins)
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../../styles/Login.css';


const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isAuthenticated, currentUser, error, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine if this is an admin login page
  const isAdminLogin = location.pathname.includes('/admin/login');

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Route based on user role
      if (currentUser.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate(`/profile/${currentUser.id || ''}`);
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(username, password, rememberMe);
    
    if (result && result.success) {
      // No need to check result.isAdmin here as the useEffect will handle redirection
      // based on currentUser.isAdmin that gets set during login
    } 
  };
  return (
    <div className="contentCart">
      <div className="admin-login-page">
        {/* Left sidebar */}
        <div className="login-sidebar">
          <div className="sidebar-pattern"></div>
          
          <div className="sidebar-content">
            <span className="admin-badge">User Portal</span>
            <h1>Welcome to your User Dashboard</h1>
            <p>
              Access your personal profile, saved content, and account settings.
              Please log in with your user credentials to continue.
            </p>
          </div>
          
          <div className="sidebar-footer">
            <p>© 2025 Your Company. All rights reserved.</p>
          </div>
        </div>
        
        {/* Right form container */}
        <div className="login-form-container">
          <div className="login-header">
            <div className="company-logo">U</div>
            <h2>Sign in to Account</h2>
            <p>Enter your credentials to access your profile</p>
          </div>
          
          {error && (
            <div className="alert alert-error">
              <svg className="alert-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
              {error}
            </div>
          )}
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  id="username"
                  className="form-control"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  />
                <label htmlFor="remember" className="remember-label">Remember me</label>
              </div>
              
              <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
            </div>
            
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Authenticating...
                </>
              ) : 'Sign in'}
            </button>
          </form>
          
          <div className="register-option">
            <p>Don't have an account? <a href="/register" className="register-link">Register now</a></p>
          </div>

          <div className="alt-login-methods">
            <div className="login-divider">
              <div className="divider-line"></div>
              <span className="divider-text">OR</span>
              <div className="divider-line"></div>
            </div>
            

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
