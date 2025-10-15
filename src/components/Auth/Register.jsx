import { useState } from 'react';
import '../../styles/Register.css';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
    
    // Password strength calculation
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    let label = '';
    
    if (!password) {
      setPasswordStrength({ score: 0, label: '' });
      return;
    }
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Determine label based on score
    if (score <= 2) {
      label = 'Weak';
    } else if (score <= 3) {
      label = 'Medium';
    } else if (score <= 4) {
      label = 'Good';
    } else {
      label = 'Strong';
    }
    
    setPasswordStrength({ score, label });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }
    
    // Phone number validation
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\+?[0-9\s\-]{10,15}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Enter a valid phone number (e.g. +212 721221670)';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Fixing the axios request format
    const response = await axios.post('https://othy.pythonanywhere.com/api/users/', {
      username: formData.username,
      first_name: formData.first_name,
      last_name: formData.last_name,
      phone_number: formData.phone_number,
      email: formData.email,
      password: formData.password,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
      
      // Axios automatically parses JSON, so no need to call response.json()
      const data = response.data;
      
      // Registration successful
      setSuccess(true);
      
      // Reset the form
      setFormData({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        password: '',
        confirmPassword: '',
      });
      
    } catch (error) {
      // Handle error response from the server
      if (error.response && error.response.data) {
        // If server returns field-specific errors
        if (typeof error.response.data === 'object' && !Array.isArray(error.response.data)) {
          const serverErrors = {};
          
          Object.keys(error.response.data).forEach(key => {
            serverErrors[key] = Array.isArray(error.response.data[key]) 
              ? error.response.data[key].join(' ') 
              : error.response.data[key];
          });
          
          setErrors({
            ...errors,
            ...serverErrors,
            form: 'Please correct the errors below.',
          });
        } else {
          // Generic error message
          setErrors({
            ...errors,
            form: error.response.data.detail || 'Registration failed. Please try again.',
          });
        }
      } else {
        // Network or other error
        setErrors({
          ...errors,
          form: error.message || 'Registration failed. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="contentCartRegister">
      <div className="registration-container">
        {/* Left sidebar */}
        <div className="registration-sidebar">
          <div className="sidebar-content">
            <span className="registration-badge">Premium Access</span>
            <h1>Join our exclusive community today</h1>
            <p>
              Create your premium account and get instant access to our full suite of tools, 
              resources, and community features. Start your journey with us today.
            </p>
          </div>
          
          <div className="sidebar-pattern"></div>
          
          <div className="sidebar-footer">
            <p>By registering, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
        
        {/* Registration form */}
        <div className="registration-form-container">
          <div className="registration-header">
            <div className="company-logo">OJ</div>
            <h2>Create your account</h2>
            <p>Fill in the details below to get started</p>
          </div>
          
          {success && (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              Registration successful! You can now log in.
            </div>
          )}
          
          {errors.form && (
            <div className="alert alert-error">
              <span className="alert-icon">!</span>
              {errors.form}
            </div>
          )}
          
          <form className="registration-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`form-control input-with-icon ${errors.first_name ? 'error' : ''}`}
                    placeholder="Enter your first name"
                  />
                </div>
                {errors.first_name && (
                  <div className="error-message">{errors.first_name}</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="last_name">Last Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`form-control ${errors.last_name ? 'error' : ''}`}
                    placeholder="Enter your last name"
                  />
                </div>
                {errors.last_name && (
                  <div className="error-message">{errors.last_name}</div>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`form-control ${errors.username ? 'error' : ''}`}
                  placeholder="Choose a username"
                />
              </div>
              {errors.username && (
                <div className="error-message">{errors.username}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="phone_number">Phone Number</label>
              <div className="input-wrapper">
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={`form-control ${errors.phone_number ? 'error' : ''}`}
                  placeholder="e.g. +212 721221670"
                />
              </div>
              {errors.phone_number && (
                <div className="error-message">{errors.phone_number}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-control ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <div className="error-message">{errors.email}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-control ${errors.password ? 'error' : ''}`}
                  placeholder="Create a strong password"
                />
              </div>
              {errors.password && (
                <div className="error-message">{errors.password}</div>
              )}
              
              {formData.password && (
                <>
                  <div className="password-strength">
                    <div className={`password-strength-bar ${
                      passwordStrength.label === 'Weak' ? 'strength-weak' :
                      passwordStrength.label === 'Medium' ? 'strength-medium' :
                      passwordStrength.label === 'Good' ? 'strength-good' :
                      passwordStrength.label === 'Strong' ? 'strength-strong' : ''
                    }`}></div>
                  </div>
                  <div className={`strength-text ${
                    passwordStrength.label === 'Weak' ? 'text-red-500' :
                    passwordStrength.label === 'Medium' ? 'text-amber-500' :
                    passwordStrength.label === 'Good' ? 'text-blue-500' :
                    passwordStrength.label === 'Strong' ? 'text-emerald-500' : ''
                  }`}>
                    {passwordStrength.label && `Password strength: ${passwordStrength.label}`}
                  </div>
                  
                  <div className="password-requirements">
                    <div className="requirement-item">
                      <span className={`requirement-icon ${formData.password.length >= 8 ? 'requirement-success' : 'requirement-pending'}`}>
                        {formData.password.length >= 8 ? '✓' : ''}
                      </span>
                      At least 8 characters long
                    </div>
                    <div className="requirement-item">
                      <span className={`requirement-icon ${/[A-Z]/.test(formData.password) ? 'requirement-success' : 'requirement-pending'}`}>
                        {/[A-Z]/.test(formData.password) ? '✓' : ''}
                      </span>
                      Contains uppercase letter
                    </div>
                    <div className="requirement-item">
                      <span className={`requirement-icon ${/[0-9]/.test(formData.password) ? 'requirement-success' : 'requirement-pending'}`}>
                        {/[0-9]/.test(formData.password) ? '✓' : ''}
                      </span>
                      Contains number
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirmPassword && (
                <div className="error-message">{errors.confirmPassword}</div>
              )}
            </div>
            
            <button
              type="submit"
              className="register-button"
              disabled={isLoading}
            >
              {isLoading && (
                <span className="spinner"></span>
              )}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="login-link-container">
            Already have an account? <a href="/login" className="login-link">Log in</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
