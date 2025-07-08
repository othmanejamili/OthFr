// Login.js (Common Login Component for both users and admins)
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../styles/Login.css';


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
            
            <div className="alt-auth-options">
              <div className="auth-option">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.0001 0C5.3726 0 0 5.3726 0 12.0001C0 17.3062 3.43807 21.7502 8.20676 23.321C8.8069 23.4354 9.0253 23.0499 9.0253 22.7226C9.0253 22.4271 9.0155 21.6811 9.0105 20.6729C5.6715 21.3932 4.9675 19.0924 4.9675 19.0924C4.4204 17.7126 3.6346 17.3285 3.6346 17.3285C2.5454 16.5945 3.7174 16.6095 3.7174 16.6095C4.9214 16.6964 5.5554 17.8545 5.5554 17.8545C6.6254 19.6793 8.3647 19.15 9.0482 18.8355C9.1576 18.0679 9.4665 17.5386 9.81 17.2364C7.145 16.9301 4.3435 15.9044 4.3435 11.3223C4.3435 10.0161 4.8111 8.9432 5.5791 8.0984C5.4551 7.7882 5.0441 6.5713 5.6959 4.932C5.6959 4.932 6.7037 4.6008 8.9961 6.1352C9.9536 5.8724 10.98 5.7418 12.0001 5.7369C13.02 5.7418 14.0474 5.8734 15.0069 6.1362C17.2964 4.6028 18.3024 4.933 18.3024 4.933C18.9559 6.5742 18.5449 7.7892 18.421 8.0994C19.1909 8.9442 19.6547 10.0171 19.6547 11.3233C19.6547 15.9162 16.8483 16.9281 14.1755 17.2285C14.6065 17.5999 14.9906 18.3342 14.9906 19.4487C14.9906 21.0125 14.9757 22.3177 14.9757 22.7226C14.9757 23.0528 15.1911 23.4413 15.8001 23.32C20.565 21.7472 24 17.3032 24 12.0001C24 5.3726 18.6274 0 12.0001 0Z" fill="#4f46e5"/>
                </svg>
              </div>
              <div className="auth-option">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                  <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.63 12 18.63C9.11995 18.63 6.70995 16.73 5.80995 14.1H2.12995V16.94C3.92995 20.45 7.69995 23 12 23Z" fill="#34A853"/>
                  <path d="M5.81 14.09C5.58 13.43 5.45 12.73 5.45 12C5.45 11.27 5.58 10.57 5.81 9.91V7.07H2.13C1.41 8.55 1 10.22 1 12C1 13.78 1.41 15.45 2.13 16.93L5.81 14.09Z" fill="#FBBC05"/>
                  <path d="M12 5.38C13.62 5.38 15.06 5.94 16.21 7.02L19.36 3.87C17.45 2.09 14.97 1 12 1C7.70002 1 3.93002 3.55 2.13002 7.07L5.81002 9.91C6.71002 7.28 9.12002 5.38 12 5.38Z" fill="#EA4335"/>
                </svg>
              </div>
              <div className="auth-option">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.2666 12.2764C22.2666 11.4607 22.2666 10.6406 22.2666 9.82059C22.0263 9.82059 21.7865 9.82059 21.546 9.82059C18.0855 9.82059 14.6248 9.82059 11.1642 9.82059C10.5636 9.82059 10.4553 9.92864 10.4553 10.5332C10.4553 13.2803 10.4553 16.0272 10.4553 18.7743C10.4553 19.357 10.5588 19.459 11.1428 19.459C14.6385 19.459 18.1341 19.459 21.6298 19.459C21.841 19.459 22.0525 19.459 22.2666 19.459C22.2666 18.6364 22.2666 17.8249 22.2666 17.0017C22.2136 17.0017 22.1729 17.0017 22.1323 17.0017C19.0326 17.0017 15.9328 17.0017 12.8331 17.0017C12.7369 17.0017 12.6406 17.0066 12.5462 16.998C12.2907 16.9739 12.115 16.8071 12.1029 16.5508C12.0926 16.326 12.2462 16.1256 12.4919 16.0842C12.5929 16.0677 12.6992 16.0736 12.8039 16.0736C14.2887 16.0723 15.7737 16.0736 17.2585 16.0736C18.2764 16.0736 19.2941 16.0736 20.3119 16.0736C20.9518 16.0736 21.3378 15.8066 21.3866 15.1828C21.4354 14.5608 21.3866 13.9225 21.3866 13.2976C19.5546 13.2976 17.7484 13.2976 15.9164 13.2976C15.9164 13.0358 15.9164 12.7791 15.9164 12.5225C15.9199 12.1352 16.0508 11.9737 16.4472 11.952C16.5453 11.9466 16.6434 11.9493 16.7416 11.9493C18.3118 11.9493 19.8821 11.9493 21.4523 11.9493C21.7283 11.9493 22.0041 11.9493 22.2666 11.9493C22.2666 12.0489 22.2666 12.1626 22.2666 12.2764Z" fill="#4f46e5"/>
                  <path d="M12.6353 21.8999C14.8883 21.9532 16.5927 21.3161 17.9559 19.7983C19.3191 18.2804 19.9019 16.4496 19.8307 14.3878C18.9651 14.3878 18.116 14.3878 17.2505 14.3878C17.2402 14.4799 17.2229 14.5719 17.2194 14.664C17.1845 15.3708 17.0364 16.0467 16.7121 16.668C16.0366 17.9566 14.9846 18.6949 13.5952 18.9363C11.3423 19.3304 9.20504 17.7954 8.73209 15.5487C8.44937 14.2918 8.66203 13.1226 9.36137 12.0592C10.0642 10.9879 11.0702 10.3582 12.3066 10.1596C13.3967 9.98666 14.4233 10.1693 15.36 10.7588C15.5762 10.8947 15.7924 11.0268 16.0137 11.1636C16.0544 11.1877 16.11 11.1948 16.1834 11.2241C16.2062 11.0729 16.2272 10.9375 16.2501 10.8022C16.2926 10.5387 16.3326 10.2751 16.3788 10.0135C16.4058 9.86695 16.3737 9.75759 16.2483 9.66625C15.6265 9.19331 14.9472 8.84428 14.1856 8.66993C12.8796 8.35884 11.596 8.45307 10.3513 9.02542C9.10672 9.59776 8.19026 10.5161 7.6345 11.782C6.94587 13.3674 6.94933 14.9719 7.6466 16.5546C8.34387 18.1374 9.55932 19.1759 11.1472 19.7053C11.5902 19.8483 12.0471 19.9337 12.5057 20.0104C12.5456 20.0176 12.5824 20.0437 12.6353 20.0771C12.6353 20.3511 12.6353 20.6251 12.6353 20.8992C12.6353 21.2347 12.6353 21.5673 12.6353 21.8999Z" fill="#4f46e5"/>
                  <path d="M4.2251 11.9512C5.74551 11.9512 7.24322 11.9512 8.7654 11.9512C8.7654 12.2252 8.7654 12.484 8.7654 12.7455C6.95685 12.7455 5.15903 12.7455 4.2251 12.7455C4.2251 15.9 4.2251 19.0408 4.2251 22.189C3.95972 22.189 3.70075 22.189 3.43816 22.189C2.57119 22.189 1.70422 22.1931 0.837247 22.1878C0.328048 22.1851 0.145819 22.0033 0.144736 21.4938C0.137842 16.3519 0.137842 11.21 0.144736 6.06804C0.144736 5.57664 0.328048 5.39143 0.822379 5.38874C3.07913 5.37521 5.33587 5.37924 7.59262 5.38605C8.07638 5.38605 8.2414 5.55406 8.24869 6.0332C8.25732 6.66339 8.25078 7.29359 8.24869 7.92378C8.24869 8.02072 8.22427 8.11744 8.21064 8.23219C8.01487 8.23219 7.82956 8.23219 7.64463 8.23219C5.85871 8.23219 4.07278 8.23487 2.28686 8.22671C1.83833 8.22401 1.67546 8.39202 1.68275 8.84159C1.69463 9.55306 1.68275 10.2659 1.68275 10.9787C1.68275 11.3091 1.68275 11.6393 1.68275 11.969C2.53275 11.969 3.36786 11.969 4.2251 11.969C4.2251 11.9636 4.2251 11.9574 4.2251 11.9512Z" fill="#4f46e5"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;