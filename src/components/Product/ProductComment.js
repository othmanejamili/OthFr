import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../crud/context/AuthContext';
import { Star, MessageCircle, User } from 'lucide-react';

const ProductComments = ({ productId }) => {
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    username: isAuthenticated && currentUser ? currentUser.name : '',
    content: '',
    rating: 5
  });

  // Fetch existing comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const response = await axios.get(
          `https://othy.pythonanywhere.com/api/comments/product/${productId}`
        );
        setComments(response.data);
      } catch (err) {
        console.error("Error fetching comments:", err);
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
    
    // Clear messages when user starts typing
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

    // Validation
    if (!formData.content.trim()) {
      setError("Please write a comment.");
      return;
    }

    if (!formData.username.trim()) {
      setError("Username is required.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

      const commentData = {
        username: formData.username.trim(),
        content: formData.content.trim(),
        rating: parseInt(formData.rating),
        product_id: productId
      };

      const response = await axios.post(
        'https://othy.pythonanywhere.com/api/comments/',
        commentData,
        { headers }
      );

      // Add new comment to the beginning of the list
      setComments(prev => [response.data, ...prev]);
      
      // Reset form
      setFormData({
        username: currentUser ? currentUser.name : '',
        content: '',
        rating: 5
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      console.error("Comment submission error:", err);
      
      if (err.response?.data) {
        setError(
          err.response.data.error ||
          err.response.data.detail ||
          err.response.data.message ||
          "Failed to submit comment."
        );
      } else if (err.request) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Something went wrong. Please try again.");
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

  return (
    <div className="product-comments-section">
      {/* Comments Header */}
      <div className="comments-header">
        <div className="comments-title">
          <MessageCircle size={24} />
          <h3>Customer Reviews ({comments.length})</h3>
        </div>
      </div>

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <div className="add-comment-form">
          <h4>Write a Review</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Display Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>
            </div>

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
                disabled={isLoading || !formData.content.trim()}
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
        ) : comments.length === 0 ? (
          <div className="no-comments">
            <MessageCircle size={48} className="no-comments-icon" />
            <h4>No reviews yet</h4>
            <p>Be the first to review this product!</p>
          </div>
        ) : (
          <div className="comments-grid">
            {comments.map((comment, index) => (
              <div key={comment.id || index} className="comment-card">
                <div className="comment-header">
                  <div className="user-info">
                    <div className="user-avatar">
                      <User size={16} />
                    </div>
                    <div className="user-details">
                      <h5 className="username">{comment.username}</h5>
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