import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Star, MessageCircle, User } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const ProductComments = ({ productId }) => {
  const { currentUser, isAuthenticated, getToken } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: isAuthenticated && currentUser ? currentUser.name || currentUser.username || '' : '',
    content: '',
    rating: 5
  });

  // Update username when authentication state changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      username: isAuthenticated && currentUser ? currentUser.name || currentUser.username || '' : ''
    }));
  }, [isAuthenticated, currentUser]);

  // Fetch existing comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const response = await axios.get(
          `https://othy.pythonanywhere.com/api/comments/?product_id=${productId}`
        );
        
        const commentsData = response.data;
        if (Array.isArray(commentsData)) {
          setComments(commentsData);
        } else if (commentsData && Array.isArray(commentsData.results)) {
          setComments(commentsData.results);
        } else {
          console.warn("API returned unexpected data format:", commentsData);
          setComments([]);
        }
      } catch (err) {
        console.error("Error fetching comments:", err);
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    };

    if (productId) {
      fetchComments();
    }
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (error) setError(null);
    if (success) setSuccess(false);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError("You must be logged in to comment.");
      return;
    }

    if (!formData.content || !formData.content.trim()) {
      setError("Please write a comment.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get token with multiple fallback methods
      let token = null;
      
      if (getToken) {
        token = getToken();
      } else {
        token = currentUser?.token || 
                localStorage.getItem('token') || 
                sessionStorage.getItem('token');
      }
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        return;
      }

      const commentData = {
        content: formData.content.trim(),
        rating: parseInt(formData.rating),
        product: parseInt(productId)
      };

      console.log('=== COMMENT SUBMISSION DEBUG ===');
      console.log('Token found:', token ? 'Yes' : 'No');
      console.log('Token preview:', token ? `${token.substring(0, 10)}...` : 'None');
      console.log('Base comment data:', baseCommentData);
      console.log('Comment data with user:', commentDataWithUser);
      console.log('Current user:', currentUser);
      console.log('Is authenticated:', isAuthenticated);

      // *** TRY MULTIPLE DATA FORMATS WITH TOKEN FORMAT ONLY ***
      let response = null;
      let lastError = null;

      // Method 1: Try with Token format + user ID (most likely to work)
      try {
        console.log('Trying Token format with user ID...');
        response = await axios.post(
          'https://othy.pythonanywhere.com/api/comments/',
          commentDataWithUser,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Token ${token}`
            }
          }
        );
        console.log('SUCCESS with Token format + user ID');
      } catch (err) {
        console.log('Token + user ID failed with status:', err.response?.status);
        console.log('Token + user ID error:', err.response?.data);
        lastError = err;

        // Method 2: Try with Token format + base data (let server set user from token)
        try {
          console.log('Trying Token format with base data...');
          response = await axios.post(
            'https://othy.pythonanywhere.com/api/comments/',
            baseCommentData,
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Token ${token}`
              }
            }
          );
          console.log('SUCCESS with Token format + base data');
        } catch (err2) {
          console.log('Token + base data failed with status:', err2.response?.status);
          console.log('Token + base data error:', err2.response?.data);
          lastError = err2;

          // Method 3: Try with Token format + alternative field names
          try {
            console.log('Trying Token format with alternative fields...');
            response = await axios.post(
              'https://othy.pythonanywhere.com/api/comments/',
              commentDataAlt,
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Token ${token}`
                }
              }
            );
            console.log('SUCCESS with Token format + alternative fields');
          } catch (err3) {
            console.log('Token + alt fields failed with status:', err3.response?.status);
            console.log('Token + alt fields error:', err3.response?.data);
            lastError = err3;
            throw err3; // All Token format attempts failed
          }
        }
      }

      if (response && response.data) {
        console.log('Comment submitted successfully:', response.data);
        
        // Add the new comment to the top of the list
        setComments(prev => [response.data, ...prev]);
        
        // Reset form
        setFormData(prev => ({
          ...prev,
          content: '',
          rating: 5
        }));
        
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }

    } catch (err) {
      console.error('=== COMMENT SUBMISSION ERROR ===');
      console.error('Final error:', err);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      
      // Enhanced error handling
      if (err.response?.status === 401) {
        const errorDetail = err.response?.data?.detail || err.response?.data?.error || '';
        if (errorDetail.includes('token not valid') || errorDetail.includes('token_not_valid')) {
          setError("Your session has expired. Please log in again.");
          // Optionally trigger logout to clear invalid token
          // logout();
        } else {
          setError("Authentication failed. Please log in again.");
        }
      } else if (err.response?.status === 400) {
        const errorData = err.response.data;
        console.log('400 error details:', errorData);
        
        if (typeof errorData === 'object') {
          // Handle field-specific errors
          const errorMessages = [];
          
          Object.entries(errorData).forEach(([field, messages]) => {
            const messageArray = Array.isArray(messages) ? messages : [messages];
            messageArray.forEach(msg => {
              if (field === 'non_field_errors' || field === 'detail') {
                errorMessages.push(msg);
              } else {
                errorMessages.push(`${field}: ${msg}`);
              }
            });
          });
          
          setError(errorMessages.join('. ') || "Please check your input and try again.");
        } else {
          setError("Invalid data. Please check your input.");
        }
      } else if (err.response?.status === 403) {
        setError("You don't have permission to perform this action.");
      } else if (err.response?.status === 404) {
        setError("API endpoint not found. Please contact support.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to submit comment. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={`star ${index < rating ? 'filled' : 'empty'}`}
        fill={index < rating ? '#ffd700' : 'none'}
        color={index < rating ? '#ffd700' : '#ddd'}
      />
    ));
  };

  const renderInteractiveStars = (currentRating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={20}
        className={`interactive-star ${index < currentRating ? 'filled' : 'empty'}`}
        fill={index < currentRating ? '#ffd700' : 'none'}
        color={index < currentRating ? '#ffd700' : '#ddd'}
        onClick={() => setFormData(prev => ({ ...prev, rating: index + 1 }))}
        style={{ cursor: 'pointer' }}
      />
    ));
  };

  const safeComments = Array.isArray(comments) ? comments : [];

  return (
    <div className="product-comments-section">
      {/* Comments Header */}
      <div className="comments-header">
        <div className="comments-title">
          <MessageCircle size={24} />
          <h3>Customer Reviews ({safeComments.length})</h3>
        </div>
      </div>

      {/* Enhanced Debug info - Remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0', fontSize: '12px', borderRadius: '4px' }}>
          <strong>Debug Info:</strong><br />
          Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}<br />
          Current User: {currentUser ? JSON.stringify(currentUser, null, 2) : 'None'}<br />
          Token Available: {(getToken && getToken()) || currentUser?.token || localStorage.getItem('token') ? 'Yes' : 'No'}<br />
          {(getToken && getToken()) && (
            <>Token Preview: {getToken().substring(0, 20)}...<br /></>
          )}
          Product ID: {productId}
        </div>
      )}

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <div className="add-comment-form">
          <h4>Write a Review</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="rating">Rating</label>
              <div className="rating-input">
                {renderInteractiveStars(formData.rating)}
                <span className="rating-text">({formData.rating}/5)</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="content">Your Review</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Share your thoughts about this product..."
                rows="4"
                required
                maxLength="1000"
              />
              <small style={{ color: '#666', fontSize: '12px' }}>
                {formData.content.length}/1000 characters
              </small>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="submit-comment-btn"
                disabled={isLoading || !formData.content || !formData.content.trim()}
              >
                {isLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>

            {/* Messages */}
            {success && (
              <div className="message success" style={{ 
                background: '#d4edda', 
                color: '#155724', 
                padding: '10px', 
                borderRadius: '4px',
                border: '1px solid #c3e6cb',
                margin: '10px 0'
              }}>
                Review submitted successfully!
              </div>
            )}
            {error && (
              <div className="message error" style={{ 
                background: '#f8d7da', 
                color: '#721c24', 
                padding: '10px', 
                borderRadius: '4px',
                border: '1px solid #f5c6cb',
                margin: '10px 0'
              }}>
                {error}
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className="login-prompt">
          <p>Please log in to write a review.</p>
        </div>
      )}

      {/* Comments List */}
      <div className="comments-list">
        {loadingComments ? (
          <div className="loading-comments">
            <div className="loading-spinner">Loading reviews...</div>
          </div>
        ) : safeComments.length === 0 ? (
          <div className="no-comments">
            <MessageCircle size={48} className="no-comments-icon" />
            <h4>No reviews yet</h4>
            <p>Be the first to review this product!</p>
          </div>
        ) : (
          <div className="comments-grid">
            {safeComments.map((comment, index) => (
              <div key={comment.id || index} className="comment-card">
                <div className="comment-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      <User size={16} />
                    </div>
                    <div className="user-details">
                      <h5 className="username">
                        {comment.user_details?.username || comment.username || 'Anonymous'}
                      </h5>
                      <div className="comment-rating">
                        {renderStars(comment.rating)}
                      </div>
                    </div>
                  </div>
                  {comment.created_at && (
                    <div className="comment-date">
                      {new Date(comment.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                </div>
                <div className="comment-content">
                  <p>{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductComments;