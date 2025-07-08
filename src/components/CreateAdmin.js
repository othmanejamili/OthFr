import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const CreateAdmin = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const { createAdmin, isAdmin } = useContext(AuthContext);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    
    const result = await createAdmin(
      formData.username, 
      formData.email, 
      formData.password
    );
    
    if (result.success) {
      setMessage({ text: result.message, type: 'success' });
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } else {
      setMessage({ text: result.message, type: 'error' });
    }
  };
  
  if (!isAdmin) {
    return <div>You do not have permission to access this page.</div>;
  }
  
  return (
    <div className="container">
      <h2>Create Admin User</h2>
      {message.text && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="8"
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength="8"
          />
        </div>
        <button type="submit" className="button-primary">
          Create Admin User
        </button>
      </form>
    </div>
  );
};

export default CreateAdmin;