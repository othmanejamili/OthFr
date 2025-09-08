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
        // *** FIX 1: Correct API endpoint ***
        const response = await axios.get(
          `https://othy.pythonanywhere.com/api/comments/?product_id=${productId}`
        );
        
        const commentsData = response.data;
        if (Array.isArray(commentsData)) {
          setComments(commentsData);
        } else if (commentsData && Array.isArray(commentsData.results)) {
          // Handle paginated response
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
      // *** FIX 2: Use the getToken function or fallback methods ***
      let token = null;
      
      // Try getToken function first (if available)
      if (getToken) {
        token = getToken();
      } else {
        // Fallback to manual token retrieval
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
      console.log('Comment data:', commentData);
      console.log('Current user:', currentUser);
      console.log('Is authenticated:', isAuthenticated);

      // *** FIX 3: Try both Token and Bearer authentication ***
      let response = null;
      let lastError = null;

      // First try with Token format (Django REST framework default)
      try {
        response = await axios.post(
          'https://othy.pythonanywhere.com/api/comments/',
          commentData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Token ${token}`
            }
          }
        );
        console.log('SUCCESS with Token format');
      } catch (err) {
        console.log('Token format failed, trying Bearer...');
        lastError = err;

        // If Token format fails, try Bearer format
        try {
          response = await axios.post(
            'https://othy.pythonanywhere.com/api/comments/',
            commentData,
            {
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            }
          );
          console.log('SUCCESS with Bearer format');
        } catch (err2) {
          console.log('Bearer format also failed');
          lastError = err2;
          throw err2; // Throw the last error
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
      console.error('Full error:', err);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      
      if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else if (err.response?.status === 400) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join(' | ');
          setError(errorMessages || "Please check your input and try again.");
        } else {
          setError("Invalid data. Please check your input.");
        }
      } else if (err.response?.status === 403) {
        setError("You don't have permission to perform this action.");
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

      {/* Debug info - Remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ background: '#f0f0f0', padding: '10px', margin: '10px 0', fontSize: '12px' }}>
          <strong>Debug Info:</strong><br />
          Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}<br />
          Current User: {currentUser ? JSON.stringify(currentUser) : 'None'}<br />
          Token Available: {(getToken && getToken()) || currentUser?.token || localStorage.getItem('token') ? 'Yes' : 'No'}
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
              />
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
              <div className="message success">
                Review submitted successfully! ✨
              </div>
            )}
            {error && (
              <div className="message error">
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