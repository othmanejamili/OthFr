import React, { useState, useEffect, useContext } from 'react';
import { Star, MessageCircle, User, AlertCircle } from 'lucide-react';

// Mock AuthContext for demonstration - replace with your actual import
const AuthContext = React.createContext({
  currentUser: null,
  isAuthenticated: false
});

const ProductComments = ({ productId = "123" }) => {
  const { currentUser, isAuthenticated } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [authDebugInfo, setAuthDebugInfo] = useState(null);
  const [formData, setFormData] = useState({
    username: isAuthenticated && currentUser ? currentUser.name || '' : '',
    content: '',
    rating: 5
  });

  // Enhanced auth debugging function
  const debugAuthentication = () => {
    const debugInfo = {
      // Check localStorage keys
      localStorage: {
        token: localStorage.getItem('token'),
        access_token: localStorage.getItem('access_token'),
        authToken: localStorage.getItem('authToken'),
        accessToken: localStorage.getItem('accessToken'),
        user: localStorage.getItem('user'),
        userData: localStorage.getItem('userData')
      },
      // Check AuthContext
      context: {
        isAuthenticated,
        currentUser,
        hasToken: currentUser?.token || currentUser?.access_token
      },
      // Check sessionStorage as backup
      sessionStorage: {
        token: sessionStorage.getItem('token'),
        access_token: sessionStorage.getItem('access_token'),
        authToken: sessionStorage.getItem('authToken'),
        user: sessionStorage.getItem('user')
      }
    };

    console.log('=== FULL AUTH DEBUG ===', debugInfo);
    setAuthDebugInfo(debugInfo);
    return debugInfo;
  };

  // Get the best available token
  const getAuthToken = () => {
    // First check AuthContext
    if (currentUser?.token) return currentUser.token;
    if (currentUser?.access_token) return currentUser.access_token;
    
    // Check localStorage
    const tokenKeys = ['token', 'access_token', 'authToken', 'accessToken'];
    for (const key of tokenKeys) {
      const token = localStorage.getItem(key);
      if (token) return token;
    }
    
    // Check user object in localStorage
    const userDataStr = localStorage.getItem('user') || localStorage.getItem('userData');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        if (userData.token) return userData.token;
        if (userData.access_token) return userData.access_token;
      } catch (e) {
        console.warn('Could not parse user data from localStorage');
      }
    }
    
    // Check sessionStorage as last resort
    for (const key of tokenKeys) {
      const token = sessionStorage.getItem(key);
      if (token) return token;
    }
    
    return null;
  };

  // Simulate API call with fetch
  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await fetch(
        `https://othy.pythonanywhere.com/api/comments/?product_id=${productId}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const commentsData = await response.json();
      if (Array.isArray(commentsData)) {
        setComments(commentsData);
      } else if (commentsData && Array.isArray(commentsData.results)) {
        setComments(commentsData.results);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Update username when authentication state changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      username: isAuthenticated && currentUser ? currentUser.name || currentUser.username || '' : ''
    }));
  }, [isAuthenticated, currentUser]);

  // Fetch existing comments
  useEffect(() => {
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
      debugAuthentication();
      return;
    }

    if (!formData.content || !formData.content.trim()) {
      setError("Please write a comment.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        debugAuthentication();
        return;
      }

      const commentData = {
        content: formData.content.trim(),
        rating: parseInt(formData.rating),
        product: parseInt(productId)
      };

      console.log('Submitting comment with token:', token ? 'Token found' : 'No token');
      console.log('Comment data:', commentData);

      const response = await fetch('https://othy.pythonanywhere.com/api/comments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(commentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      const responseData = await response.json();
      console.log('Comment submitted successfully:', responseData);
      setComments(prev => [responseData, ...prev]);
      setFormData(prev => ({
        ...prev,
        content: '',
        rating: 5
      }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

    } catch (err) {
      console.error('Submit error:', err.message);
      
      if (err.message.includes('401')) {
        setError("Authentication failed. Please log in again.");
        debugAuthentication();
      } else if (err.message.includes('400')) {
        try {
          const errorData = JSON.parse(err.message);
          if (typeof errorData === 'object') {
            const errorMessages = Object.entries(errorData)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join(' | ');
            setError(errorMessages || "Please check your input and try again.");
          } else {
            setError("Invalid data. Please check your input.");
          }
        } catch {
          setError("Invalid data. Please check your input.");
        }
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
        fill={index < currentRating ? '#ffd700' : 'none'}
        color={index < currentRating ? '#ffd700' : '#ddd'}
        onClick={() => setFormData(prev => ({ ...prev, rating: index + 1 }))}
        className="cursor-pointer hover:scale-110 transition-transform"
      />
    ));
  };

  const safeComments = Array.isArray(comments) ? comments : [];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Debug Panel - Remove this in production */}
      {authDebugInfo && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-red-500" size={16} />
            <h4 className="text-red-700 font-medium">Authentication Debug Info</h4>
          </div>
          <pre className="text-xs text-red-600 overflow-auto max-h-40">
            {JSON.stringify(authDebugInfo, null, 2)}
          </pre>
        </div>
      )}

      {/* Comments Header */}
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle size={24} className="text-blue-500" />
        <h3 className="text-2xl font-bold text-gray-800">
          Customer Reviews ({safeComments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h4 className="text-lg font-semibold mb-4 text-gray-700">Write a Review</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex items-center gap-2">
                {renderInteractiveStars(formData.rating)}
                <span className="text-sm text-gray-600">({formData.rating}/5)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                placeholder="Share your thoughts about this product..."
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={isLoading || !formData.content || !formData.content.trim()}
              >
                {isLoading ? 'Submitting...' : 'Submit Review'}
              </button>

              <button
                onClick={debugAuthentication}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
              >
                Debug Auth
              </button>
            </div>

            {/* Messages */}
            {success && (
              <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
                Review submitted successfully! ✨
              </div>
            )}
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-yellow-800">Please log in to write a review.</p>
        </div>
      )}

      {/* Comments List */}
      <div>
        {loadingComments ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading reviews...</p>
          </div>
        ) : safeComments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h4 className="text-xl font-semibold text-gray-600 mb-2">No reviews yet</h4>
            <p className="text-gray-500">Be the first to review this product!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {safeComments.map((comment, index) => (
              <div key={comment.id || index} className="p-6 bg-white border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800">
                        {comment.user_details?.username || comment.username || 'Anonymous'}
                      </h5>
                      <div className="flex items-center gap-1">
                        {renderStars(comment.rating)}
                      </div>
                    </div>
                  </div>
                  {comment.created_at && (
                    <div className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                </div>
                <div className="text-gray-700">
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