import React, {useState, useEffect, useCallback} from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import '../styles/Form.css'

const UpdateProduct = () => {

    const { id } = useParams();

    const [formData, setFormData] = useState({
        name:"",
        description:"",
        price:"",
        type:"",
        size:"",
        points_reward:"",
        images:[]
    });
    const [message, setMessage] = useState({text:"", type:""});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false)
    const [previewUrls, setPreviewUrls] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [removedImageIds, setRemovedImageIds] = useState([]);


    // Changed: Wrapped fetchProductData in useCallback
    const fetchProductData = useCallback(async () => {
        if (!id) return;
        
        try {
            setLoading(true);
            const response = await axios.get(`https://othy.pythonanywhere.com/api/products/${id}/`);
            const product = response.data;

            setFormData({
                name: product.name || "",
                description: product.description || "",
                price: product.price ? parseFloat(product.price).toString() : "",
                type: product.type || "",
                size: product.size || "",
                points_reward: product.points_reward ? parseFloat(product.points_reward).toString() : "",
                images: []
            });

            // Check for image_list instead of images
            if (product.image_list && product.image_list.length > 0) {
                // Transform each image object to have an image_url property
                const transformedImages = product.image_list.map(img => ({
                    id: img.id,
                    image_url: img.image, // Map the 'image' field to 'image_url'
                    product: img.product
                }));
                setExistingImages(transformedImages);
            } else {
                setExistingImages([]);
            }
            
            // Reset other related states
            setPreviewUrls([]);
            setRemovedImageIds([]);
            setErrors({});
            setMessage({text:"", type:""});
            
        } catch (error) {
            console.error("Error fetching product:", error);
            setMessage({
                text: "Failed to fetch the product",
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    }, [id]); // Added id as a dependency


    // Changed: Added fetchProductData to the dependency array
    useEffect(() => {
      fetchProductData();
    }, [fetchProductData]);
    


    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]:value});

        if (errors[name]) {
            setErrors({...errors, [name] :""});
        }
    }

    const handleFileChange = (e) => { 
        const files = Array.from(e.target.files);

        if (files.length > 0) {
            // When new files are selected, mark all existing images for removal
            // This ensures complete replacement of images
            const allExistingImageIds = existingImages
                .filter(img => img.id)
                .map(img => img.id);
            
            // Update removedImageIds with all existing image IDs
            setRemovedImageIds(allExistingImageIds);
            
            // Clear existing images from the UI immediately
            setExistingImages([]);
            
            // Set the new files in formData
            setFormData({...formData, images: files});

            // Create preview URLs for the new images
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
        }
    };

    // Change this validation function
    const validateForm = () =>  {
      const newError = {};

      if(!formData.name.trim()) newError.name ="Field name is required";
      if(!formData.description.trim()) newError.description ="Field description is required";
      if (!formData.price) {
          newError.price = "Field price is required";
      } else if (isNaN(formData.price) || parseFloat(formData.price) < 0) {
          newError.price = "Please ensure the price is positive";
      }
      if(!formData.type.trim()) newError.type ="Field type is required";
      if(!formData.size.trim()) newError.size ="Field size is required";
      
      // Fixed points_reward validation to properly handle "0" as a valid value
      if (formData.points_reward === "") {
          newError.points_reward = "Field point is required";
      } else if(isNaN(formData.points_reward) || parseFloat(formData.points_reward) < 0){
          newError.points_reward = "Points should be a non-negative number";
      }
      
      // Only validate images if both existing and new images are empty
      if(formData.images.length === 0 && existingImages.length === 0) {
          newError.images = "At least select one picture";
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
        data.append("points_reward", formData.points_reward);
    
        // Append images to formData
        for (let i = 0; i < formData.images.length; i++) {
          data.append("images", formData.images[i]);
        }
        
        // Add removed image IDs to request
        if (removedImageIds.length > 0) {
          // Convert array to JSON string for the API
          data.append("removed_image_ids", JSON.stringify(removedImageIds));
        }
    
        try {
           await axios.put(`http://127.0.0.1:8000/api/products/${id}/`, data, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          
          setMessage({ 
            text: "Product updated successfully!", 
            type: "success" 
          });
          
          // Reset form after successful update and fetch the updated product
          fetchProductData();
          
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
        fetchProductData();
    };

    const handleRemoveExistingImage = (indexToRemove) => {
        const removedImage = existingImages[indexToRemove];
        
        // Only add to removedImageIds if it has an id
        if (removedImage && removedImage.id) {
            setRemovedImageIds([...removedImageIds, removedImage.id]);
        }

        // Remove from existingImages state
        setExistingImages(existingImages.filter((_, index) => index !== indexToRemove));
    };
    
    const handleRemoveNewImage = (indexToRemove) => {
        // Create new arrays without the removed item
        const newImages = [...formData.images];
        newImages.splice(indexToRemove, 1);
        
        const newPreviewUrls = [...previewUrls];
        newPreviewUrls.splice(indexToRemove, 1);
        
        // Update state
        setFormData({...formData, images: newImages});
        setPreviewUrls(newPreviewUrls);
    };



    return(
        <div className="container">
          <h2>Update Product</h2>
          {loading && <div className="loading-indicator">Loading product data...</div>}
          
          <form onSubmit={handleSubmit} noValidate>
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
              <label htmlFor="points_reward">Points</label>
              <input
                id="points_reward"
                name="points_reward"
                type="number"
                min="0"
                step="1"
                className={`form-input ${errors.points_reward ? "error" : ""}`}
                placeholder="0.00"
                value={formData.points_reward}
                onChange={handleChange}
              />
              {errors.points_reward && <p className="error-text">{errors.points_reward}</p>}
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
                    {existingImages.map((image, index) => (
                      <div key={index} className="preview-item relative">
                        <img 
                          src={image.image_url} 
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
                      <div key={index} className="preview-item relative">
                        <img 
                          src={url} 
                          alt={`Preview ${index}`} 
                          className="preview-image"
                        />
                        <button 
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                        >
                          X
                        </button>
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
            <div className={`alert ${message.type === "success" ? "alert-success" : message.type === "warning" ? "alert-warning" : "alert-error"}`}>
              {message.text}
            </div>
          )}
        </div>
      );
    };

export default UpdateProduct;
