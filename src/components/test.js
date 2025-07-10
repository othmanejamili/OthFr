import React, { useState } from "react";
import axios from "axios";
// Assuming you have the Form.css file in your project

const TestAddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    size: "",
    type: "",
    points_reward: "",
    images: []
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, images: files });
    
    // Clear previous previews before adding new ones
    setPreviewUrls([]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrls(prevUrls => [...prevUrls, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim()) newErrors.description = "Product description is required";
    
    if (!formData.price) {
      newErrors.price = "Product price is required";
    } else if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      newErrors.price = "Price should be a positive number";
    }
    
    if (!formData.points_reward) {
      newErrors.points_reward = "Product points are required";
    } else if (isNaN(formData.points_reward) || parseFloat(formData.points_reward) < 0) {
      newErrors.points_reward = "Points should be a non-negative number";
    }
    
    if (!formData.size) newErrors.size = "Product size is required";
    if (!formData.type) newErrors.type = "Product type is required";
    if (formData.images.length === 0) newErrors.images = "At least one image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("size", formData.size);
    data.append("type", formData.type);
    data.append("points_reward", formData.points_reward);
    
    for (let i = 0; i < formData.images.length; i++) {
      data.append("images", formData.images[i]);
    }

    try {
         await axios.post(`https://othy.pythonanywhere.com/api/products/`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setMessage({
        text: "Product added successfully!",
        type: "success"
      });

      setFormData({ name: "", description: "", price: "", type: "", size: "", points_reward: "", images: [] });
      setPreviewUrls([]);
      
    } catch (error) {
      console.log("Error:", error);

      if (error.response) {
        const serverError = error.response.data;
        setMessage({
          text: serverError.message || "Server error. Please try again.",
          type: "error"
        });

        if (serverError.errors) {
          setErrors(serverError.errors);
        }
      } else if (error.request) {
        setMessage({
          text: "No response from server. Please check your connection.",
          type: "error"  
        });
      } else {
        setMessage({
          text: "Failed to add product. Please try again.",
          type: "error"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: "", description: "", price: "", type: "", size: "", points_reward: "", images: [] });
    setPreviewUrls([]);
    setErrors({});
    setMessage({ text: "", type: "" });
  };

  return (
    <div className="container">
      <h2>Add Product</h2>
      {message.text && (
        <div className={`alert ${message.type === "success" ? "alert-success" : "alert-error"}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            className={`form-input ${errors.name ? "error" : ""}`}
            placeholder="Enter product name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="3"
            className={`form-textarea ${errors.description ? "error" : ""}`}
            placeholder="Enter product description"
            value={formData.description}
            onChange={handleChange}
          />
          {errors.description && <p className="error-text">{errors.description}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            id="price"
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            className={`form-input ${errors.price ? "error" : ""}`}
            placeholder="0.00"
            value={formData.price}
            onChange={handleChange}
          />
          {errors.price && <p className="error-text">{errors.price}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="points_reward">Points</label>
          <input
            id="points_reward"
            name="points_reward"
            type="number"
            min="0"
            step="0.5"
            className={`form-input ${errors.points_reward ? "error" : ""}`}
            placeholder="0.00"
            value={formData.points_reward}
            onChange={handleChange}
          />
          {errors.points_reward && <p className="error-text">{errors.points_reward}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            name="type"
            className={`form-select ${errors.type ? "error" : ""}`}
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
          <label htmlFor="size">Size</label>
          <select
            id="size"
            name="size"
            className={`form-select ${errors.size ? "error" : ""}`}
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
          <label className="form-label">Product Images</label>
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
          {errors.images && <p className="error-text">{errors.images}</p>}

          {previewUrls.length > 0 && (
            <div className="preview-container">
              <p className="preview-title">Image previews:</p>
              <div className="preview-grid">
                {previewUrls.map((url, index) => (
                  <div key={index} className="preview-item">
                    <img 
                      src={url} 
                      alt={`Preview ${index + 1}`} 
                      className="preview-image"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
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
              "Add Product"
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
    </div>
  );
};

export default TestAddProduct;
