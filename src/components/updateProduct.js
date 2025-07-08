import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import '../styles/Form.css';
 

const UpdateProduct = () => {
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    size: "",
    type: "",
    images: []
  });
  const [message, setMessage] = useState({text:"", type:""});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);

  // Fetch existing product data when component mounts
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/products/${id}/`);
        const product = response.data;
        
        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price ? product.price.toString() : "",
          size: product.size || "",
          type: product.type || "",
          images: []
        });

        // Set existing images if they exist
        if (product.images && product.images.length > 0) {
          setExistingImages(product.images);
        }
      } catch (error) {
        setMessage({
          text: "Failed to fetch product details",
          type: "error"
        });
      }
    };

    if (id) {
      fetchProductData();
    }
  }, [id]);

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData({...formData, [name]:value});

    if (errors[name]) {
      setErrors({...errors,[name]:""});
    } 
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // If we're replacing images, mark all existing ones for removal
    if (files.length > 0) {
      const idsToRemove = existingImages
        .filter(img => img.id || img.image_id)
        .map(img => img.id || img.image_id);
      
      setRemovedImageIds(idsToRemove);
      // Clear existing images display when new files are selected
      setExistingImages([]);
    }
  
    setFormData({...formData, images: files });
  
    const newPreviewUrls = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        newPreviewUrls.push(reader.result);
        if (newPreviewUrls.length === files.length) {
          setPreviewUrls(newPreviewUrls);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  const validateForm = () => {
    const newError = {};
    if(!formData.name.trim()) newError.name = "Product name is required";
    if(!formData.description.trim()) newError.description = "Product description is required";
    if (!formData.price) {
      newError.price ="Product price is required";
    } else if(isNaN(formData.price) || parseFloat(formData.price) <=0) {
      newError.price = "Please ensure the price is positive";
    }
    if(!formData.size.trim()) newError.size = "Product size is required";
    if(!formData.type.trim()) newError.type = "Product type is required";
    
    // Only require images if there are no existing images and no new images
    if(formData.images.length === 0 && existingImages.length === 0) {
      newError.images = "At least one image is required";
    }
    
    setErrors(newError);
    return Object.keys(newError).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage({ text: "", type: "" });

    // Prepare form data
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("type", formData.type);
    data.append("size", formData.size);

    // Append images to formData
    for (let i = 0; i < formData.images.length; i++) {
      data.append("images", formData.images[i]);
    }
    
    // Add removed image IDs to request
    if (removedImageIds.length > 0) {
      // Convert array to JSON string if your API expects a string
      data.append("removed_image_ids", JSON.stringify(removedImageIds));
      // Or if your API expects them as separate values:
      // removedImageIds.forEach(id => {
      //   data.append("removed_image_ids", id);
      // });
    }

    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/products/${id}/`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setMessage({ 
        text: "Product Updated successfully!", 
        type: "success" 
      });
      
      // Reset image states after successful update
      setExistingImages(response.data.images || []);
      setPreviewUrls([]);
      setRemovedImageIds([]);
      setFormData({...formData, images: []});
      
    } catch (error) {
      console.error("Error:", error);
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with an error status
        const serverErrors = error.response.data;
        setMessage({ 
          text: serverErrors.message || "Server error. Please try again.", 
          type: "error" 
        });
        
        // If server returns field-specific errors, display them
        if (serverErrors.errors) {
          setErrors(serverErrors.errors);
        }
      } else if (error.request) {
        // The request was made but no response was received
        setMessage({ 
          text: "No response from server. Please check your connection.", 
          type: "error" 
        });
      } else {
        // Something happened in setting up the request
        setMessage({ 
          text: "Failed to update product. Please try again.", 
          type: "error" 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Reset to original product data by refetching
    if (id) {
      const fetchProductData = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/products/${id}/`);
          const product = response.data;
          
          setFormData({
            name: product.name || "",
            description: product.description || "",
            price: product.price ? product.price.toString() : "",
            size: product.size || "",
            type: product.type || "",
            images: []
          });
  
          // Reset existing images
          if (product.images && product.images.length > 0) {
            setExistingImages(product.images);
          }
          
          setPreviewUrls([]);
          setErrors({});
          setMessage({text:"", type:""});
          setRemovedImageIds([]);
          
        } catch (error) {
          setMessage({
            text: "Failed to reset product data",
            type: "error"
          });
        }
      };
      
      fetchProductData();
    }
  };

  const handleRemoveExistingImage = (indexToRemove) => {
    const removedImage = existingImages[indexToRemove];
    
    // Track the ID of removed image if it has one
    if (removedImage.id) {
      setRemovedImageIds([...removedImageIds, removedImage.id]);
    } else if (removedImage.image_id) {
      setRemovedImageIds([...removedImageIds, removedImage.image_id]);
    }
    
    // Remove from existingImages in the UI
    setExistingImages(existingImages.filter((_, index) => index !== indexToRemove));
  };

  return(
    <div className="container">
      <h2>Update Product</h2>
      <form onSubmit={handleSubmit} noValidate>
        {/* Form fields remain the same */}
        <div className="form-group">
          <label>Name</label>
          <input
          id="name"
          name="name"
          className={`form-input ${errors.name ? "error":""} `}
          placeholder="Enter product name"
          value={formData.name}
          onChange={handleChange}
          />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
          id="description"
          name="description"
          rows="3"
          className={`form-textarea ${errors.description ? "error":""} `}
          placeholder="Enter product description"
          value={formData.description}
          onChange={handleChange}
          />
          {errors.description && <p className="error-text">{errors.description}</p>}
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
          id="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          className={`form-input ${errors.price ? "error":""} `}
          placeholder="0.00"
          value={formData.price}
          onChange={handleChange}
          />
          {errors.price && <p className="error-text">{errors.price}</p>}
        </div>
        <div className="form-group">
          <label>Type</label>
          <select
          id="type"
          name="type"
          className={`form-select ${errors.type ? "error":""} `}
          value={formData.type}
          onChange={handleChange}
          >
            <option value="">Select type</option>
            <option value="clothing">Clothing</option>
            <option value="accessories">Accessories</option>
            <option value="electronics">Electronics</option>
            <option value="home">Home Goods</option>
          </select>
          {errors.type && <p className="error-text">{errors.type}</p>}
        </div>
        <div className="form-group">
          <label>Size</label>
          <select
          id="size"
          name="size"
          className={`form-select ${errors.size ? "error":""} `}
          value={formData.size}
          onChange={handleChange}
          >
            <option value="">Select size</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
            <option value="XL">Extra Large</option>
          </select>
          {errors.size && <p className="error-text">{errors.size}</p>}
        </div>
        <div className="form-group">
          <label className="form-label">
            Product Images
          </label>
          <div className="file-upload-area">
            <div>
              <svg className="file-upload-icon" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="file-upload-text">
                <label htmlFor="file-upload" className="file-upload-button">
                  <span>Upload files</span>
                  <input 
                    id="file-upload" 
                    name="file-upload" 
                    type="file" 
                    style={{ display: 'none' }} 
                    multiple 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
                <p>or drag and drop</p>
              </div>
              <p className="file-upload-helper">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>

          {/* Existing Images Preview */}
          {existingImages.length > 0 && (
            <div className="preview-container">
              <p className="preview-title">Existing Images:</p>
              <div className="preview-grid">
                {existingImages.map((imageUrl, index) => (
                  <div key={index} className="preview-item relative">
                    <img 
                      src={imageUrl.image_url} 
                      alt="product"
                      className="preview-image"
                    />
                    <button 
                      type="button"
                      onClick={() => handleRemoveExistingImage(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Preview */}
          {previewUrls.length > 0 && (
            <div className="preview-container">
              <p className="preview-title">New Image Previews:</p>
              <div className="preview-grid">
                {previewUrls.map((url, index) => (
                  <div key={index} className="preview-item">
                    <img 
                      src={url} 
                      alt={`Preview ${index}`} 
                      className="preview-image"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {errors.images && <p className="error-text">{errors.images}</p>}
        </div>
        <div className="button-container">
          <button
              type="submit"
              disabled={loading}
              className="button-primary"
            >
              {loading ? (
                <span>
                  <svg className="spinner" width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Update Product"
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="button-secondary"
            >
              Reset
            </button>
        </div>
      </form>
      {message.text && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default UpdateProduct;