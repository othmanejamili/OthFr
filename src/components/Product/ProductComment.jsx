import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Star, User } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import '../../styles/Comment.css';

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
      setError("You must be logged in to review this product.");
      return;
    }

    if (!formData.content || !formData.content.trim()) {
      setError("Please write a review.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let token = null;
      
      if (getToken) {
        token = getToken();
      } else {
        token = currentUser?.token || 
                localStorage.getItem('token') || 
                sessionStorage.getItem('token');
      }
      
      if (!token) {
        setError("Please log in to continue.");
        return;
      }

      const commentData = {
        content: formData.content.trim(),
        rating: parseInt(formData.rating),
        product: parseInt(productId)
      };

      const response = await axios.post(
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

    } catch (err) {
      console.error('Comment submission error:', err);
      
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      } else if (err.response?.status === 400) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
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
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("Failed to submit review. Please try again.");
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
        fill={index < rating ? '#111' : 'none'}
        color={index < rating ? '#111' : '#ccc'}
      />
    ));
  };

  const renderInteractiveStars = (currentRating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={20}
        className={`interactive-star ${index < currentRating ? 'filled' : 'empty'}`}
        fill={index < currentRating ? '#111' : 'none'}
        color={index < currentRating ? '#111' : '#ccc'}
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
        <h3>Reviews ({safeComments.length})</h3>
      </div>

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <div className="add-comment-form">
          <h4>Write a Review</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="rating">Rating</label>
              <div className="rating-input">
                {renderInteractiveStars(formData.rating)}
                <span className="rating-text">({formData.rating} out of 5)</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="content">Review</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="How did this product work for you?"
                rows="4"
                required
                maxLength="500"
              />
              <div className="character-count">
                {formData.content.length}/500
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="submit-comment-btn"
                disabled={isLoading || !formData.content || !formData.content.trim()}
              >
                {isLoading ? 'Publishing...' : 'Publish Review'}
              </button>
            </div>

            {/* Messages */}
            {success && (
              <div className="success-message">
                Review published successfully!
              </div>
            )}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </form>
        </div>
      ) : (
        <div className="login-prompt">
          <p>Sign in to write a review</p>
        </div>
      )}

      {/* Comments List */}
      <div className="comments-list">
        {loadingComments ? (
          <div className="loading-comments">
            <div className="loading-text">Loading reviews...</div>
          </div>
        ) : safeComments.length === 0 ? (
          <div className="no-comments">
            <h4>No Reviews Yet</h4>
            <p>Be the first to review this product.</p>
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
                      <div className="username">
                        {comment.user_details?.username || comment.username || 'Anonymous'}
                      </div>
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