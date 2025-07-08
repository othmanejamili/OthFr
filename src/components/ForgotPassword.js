// ForgotPassword.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Login.css'; // Reusing the login styles

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('request'); // 'request', 'verify', 'resetPassword'
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { loading, resetPassword, verifyResetCode, requestPasswordReset } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    const result = await requestPasswordReset(email);
    
    if (result.success) {
      setMessage('A verification code has been sent to your email');
      setStep('verify');
    } else {
      setError(result.message || 'Failed to send reset email');
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!verificationCode) {
      setError('Verification code is required');
      return;
    }
    
    const result = await verifyResetCode(email, verificationCode);
    
    if (result.success) {
      setMessage('Code verified. Please set your new password');
      setStep('resetPassword');
    } else {
      setError(result.message || 'Invalid verification code');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!newPassword) {
      setError('New password is required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    const result = await resetPassword(email, verificationCode, newPassword);
    
    if (result.success) {
      setMessage('Your password has been reset successfully');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      setError(result.message || 'Failed to reset password');
    }
  };

  const renderRequestForm = () => (
    <form className="login-form" onSubmit={handleRequestReset}>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <div className="input-wrapper">
          <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="email"
            id="email"
            className="form-control"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>
      
      <button type="submit" className="login-button" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner"></span>
            Sending...
          </>
        ) : 'Send Reset Code'}
      </button>
      
      <div className="login-footer-links">
        <a href="/login" className="back-link">Back to Login</a>
      </div>
    </form>
  );

  const renderVerifyForm = () => (
    <form className="login-form" onSubmit={handleVerifyCode}>
      <div className="form-group">
        <label htmlFor="verificationCode">Verification Code</label>
        <div className="input-wrapper">
          <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 15C12.5523 15 13 14.5523 13 14C13 13.4477 12.5523 13 12 13C11.4477 13 11 13.4477 11 14C11 14.5523 11.4477 15 12 15Z" fill="currentColor"/>
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            id="verificationCode"
            className="form-control"
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
        </div>
      </div>
      
      <button type="submit" className="login-button" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner"></span>
            Verifying...
          </>
        ) : 'Verify Code'}
      </button>
      
      <div className="login-footer-links">
        <button 
          type="button" 
          onClick={() => setStep('request')} 
          className="back-link"
        >
          Back
        </button>
        <button 
          type="button" 
          onClick={handleRequestReset} 
          className="resend-link"
          disabled={loading}
        >
          Resend Code
        </button>
      </div>
    </form>
  );

  const renderResetPasswordForm = () => (
    <form className="login-form" onSubmit={handlePasswordReset}>
      <div className="form-group">
        <label htmlFor="newPassword">New Password</label>
        <div className="input-wrapper">
          <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="password"
            id="newPassword"
            className="form-control"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="input-wrapper">
          <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="password"
            id="confirmPassword"
            className="form-control"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      </div>
      
      <button type="submit" className="login-button" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner"></span>
            Resetting...
          </>
        ) : 'Reset Password'}
      </button>
      
      <div className="login-footer-links">
        <button 
          type="button" 
          onClick={() => setStep('verify')} 
          className="back-link"
        >
          Back
        </button>
      </div>
    </form>
  );

  return (
    <div className="contentCart">
      <div className="admin-login-page">
        {/* Left sidebar */}
        <div className="login-sidebar">
          <div className="sidebar-pattern"></div>
          
          <div className="sidebar-content">
            <span className="admin-badge">Password Reset</span>
            <h1>Recover Your Account</h1>
            <p>
              Lost access to your account? No worries.
              Follow the steps to securely reset your password and regain access.
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
            <h2>
              {step === 'request' && 'Forgot Your Password?'}
              {step === 'verify' && 'Verify Your Identity'}
              {step === 'resetPassword' && 'Create New Password'}
            </h2>
            <p>
              {step === 'request' && 'Enter your email to receive a reset code'}
              {step === 'verify' && 'Enter the verification code sent to your email'}
              {step === 'resetPassword' && 'Create a strong, secure password'}
            </p>
          </div>
          
          {message && (
            <div className="alert alert-success">
              <svg className="alert-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {message}
            </div>
          )}
          
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
          
          {step === 'request' && renderRequestForm()}
          {step === 'verify' && renderVerifyForm()}
          {step === 'resetPassword' && renderResetPasswordForm()}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;