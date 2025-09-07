import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Star, MessageCircle, User } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const ProductComments = ({ productId }) => {
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    username: isAuthenticated && currentUser ? currentUser.name || '' : '',
    content: '',
    rating: 5
  });

  // Update username when authentication state changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      username: isAuthenticated && currentUser ? currentUser.name || '' : ''
    }));
  }, [isAuthenticated, currentUser]);

  // Fetch existing comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const response = await axios.get(
          `https://othy.pythonanywhere.com/api/comments/${productId}`
        );
        
        // Ensure we always set an array
        const commentsData = response.data;
        if (Array.isArray(commentsData)) {
          setComments(commentsData);
        } else if (commentsData && Array.isArray(commentsData.comments)) {
          // Handle case where API returns { comments: [...] }
          setComments(commentsData.comments);
        } else if (commentsData && Array.isArray(commentsData.data)) {
          // Handle case where API returns { data: [...] }
          setComments(commentsData.data);
        } else if (commentsData && typeof commentsData === 'object' && commentsData.id) {
          // Handle case where API returns a single comment object
          setComments([commentsData]);
        } else if (commentsData === null || commentsData === undefined) {
          // Handle null/undefined response
          setComments([]);
        } else {
          console.warn("API returned unexpected data format:", commentsData);
          setComments([]);
        }
        
      } catch (err) {
        console.error("Error fetching comments:", err);
        setComments([]); // Ensure comments is always an array even on error
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

    // Validation with safer null checking
    if (!formData.content || !formData.content.trim()) {
      setError("Please write a comment.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check for token in multiple possible locations
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('access_token') || 
                   localStorage.getItem('authToken') ||
                   localStorage.getItem('accessToken');
      
      // Also check if token might be stored in user object
      const userData = localStorage.getItem('user');
      let tokenFromUser = null;
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          tokenFromUser = parsedUser.token || parsedUser.access_token || parsedUser.authToken;
        } catch (e) {
          console.log("Could not parse user data:", e);
        }
      }

      const finalToken = token || tokenFromUser;
      
      // Debug: Check all auth-related items in localStorage
      console.log("=== DEBUGGING AUTH ===");
      console.log("Token from 'token':", localStorage.getItem('token'));
      console.log("Token from 'access_token':", localStorage.getItem('access_token'));
      console.log("Token from 'authToken':", localStorage.getItem('authToken'));
      console.log("Token from 'accessToken':", localStorage.getItem('accessToken'));
      console.log("User data:", userData);
      console.log("Token from user object:", tokenFromUser);
      console.log("Final token:", finalToken);
      console.log("Current user:", currentUser);
      console.log("Is authenticated:", isAuthenticated);
      console.log("Product ID:", productId);
      
      if (!finalToken) {
        setError("Authentication token not found. Please log in again to submit reviews.");
        setIsLoading(false);
        return;
      }

      // Try different authentication methods
      const authHeaders = [
        { 'Authorization': `Bearer ${finalToken}` },  // JWT style
        { 'Authorization': `Token ${finalToken}` },   // Django Token style
        { 'X-Auth-Token': finalToken },               // Custom header
        { 'Authentication': finalToken }              // Alternative
      ];

      const baseHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const commentData = {
        content: formData.content.trim(),
        rating: parseInt(formData.rating),
        product: parseInt(productId)
      };

      console.log("=== REQUEST DATA ===");
      console.log("URL:", 'https://othy.pythonanywhere.com/api/comments/');
      console.log("Data:", commentData);

      // Try each authentication method
      let response = null;
      let lastError = null;

      for (let i = 0; i < authHeaders.length; i++) {
        const headers = { ...baseHeaders, ...authHeaders[i] };
        
        console.log(`=== TRYING AUTH METHOD ${i + 1} ===`);
        console.log("Headers:", headers);

        try {
          response = await axios.post(
            'https://othy.pythonanywhere.com/api/comments/',
            commentData,
            { headers }
          );
          
          console.log(`=== SUCCESS WITH METHOD ${i + 1} ===`);
          console.log("Response:", response.data);
          break; // Success, exit loop
          
        } catch (err) {
          console.log(`Method ${i + 1} failed:`, err.response?.status, err.response?.data);
          lastError = err;
          continue; // Try next method
        }
      }

      if (!response) {
        // All methods failed
        console.error("=== ALL AUTH METHODS FAILED ===");
        console.error("Last error:", lastError.response?.data);
        
        if (lastError.response?.status === 401) {
          setError("Authentication failed. You may need to log in again.");
        } else {
          setError("Failed to submit comment. Please try logging in again.");
        }
        return;
      }

      // Success! Add comment to list
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
      console.error("=== UNEXPECTED ERROR ===");
      console.error("Full error:", err);
      console.error("Response status:", err.response?.status);
      console.error("Response data:", err.response?.data);
      
      if (err.response?.status === 400) {
        const errorData = err.response.data;
        console.log("Validation error details:", errorData);
        
        if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join(' | ');
          setError(errorMessages || "Please check your input and try again.");
        } else {
          setError("Invalid data. Please check your input.");
        }
      } else {
        setError("Something went wrong. Please try logging in again.");
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

  // Additional safety check before rendering
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
                      <h5 className="username">{comment.user_details?.username || comment.username || 'Anonymous'}</h5>
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