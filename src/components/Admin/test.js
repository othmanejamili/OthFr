import React, { useState, useRef } from "react";

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
  
  // Add ref for file input to properly reset it
  const fileInputRef = useRef(null);

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
    
    // Clear previous previews
    setPreviewUrls([]);
    
    // Generate new previews
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
    
    // Create FormData object
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("size", formData.size);
    data.append("type", formData.type);
    data.append("points_reward", formData.points_reward);
    
    // Append each image file
    for (let i = 0; i < formData.images.length; i++) {
      data.append("images", formData.images[i]);
    }

    try {
      console.log("Submitting form data...");
      console.log("Images to upload:", formData.images.length);
      
      // Simulate API call - replace with your actual axios call
      const response = await fetch(`https://othy.pythonanywhere.com/api/products/`, {
        method: 'POST',
        body: data
      });

      if (!response.ok) {
        const serverError = await response.json();
        setMessage({
          text: serverError.message || `Server error: ${response.status}. Please try again.`,
          type: "error"
        });
        
        if (serverError.errors) {
          setErrors(serverError.errors);
        }
      } else {
        const responseData = await response.json();
        console.log("Success response:", responseData);

        setMessage({
          text: "Product added successfully!",
          type: "success"
        });

        // Reset form completely
        handleReset();
      }
      
    } catch (error) {
      console.log("Error details:", error);

      setMessage({
        text: "Failed to add product. Please check your connection and try again.",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ 
      name: "", 
      description: "", 
      price: "", 
      type: "", 
      size: "", 
      points_reward: "", 
      images: [] 
    });
    setPreviewUrls([]);
    setErrors({});
    setMessage({ text: "", type: "" });
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Add Product</h2>
      
      {message.text && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          borderRadius: '4px',
          backgroundColor: message.type === "success" ? '#d4edda' : '#f8d7da',
          color: message.type === "success" ? '#155724' : '#721c24',
          border: `1px solid ${message.type === "success" ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name</label>
          <input
            name="name"
            style={{
              width: '100%',
              padding: '8px',
              border: `1px solid ${errors.name ? '#dc3545' : '#ccc'}`,
              borderRadius: '4px'
            }}
            placeholder="Enter product name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p style={{ color: '#dc3545', fontSize: '14px', margin: '5px 0' }}>{errors.name}</p>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description</label>
          <textarea
            name="description"
            rows="3"
            style={{
              width: '100%',
              padding: '8px',
              border: `1px solid ${errors.description ? '#dc3545' : '#ccc'}`,
              borderRadius: '4px',
              resize: 'vertical'
            }}
            placeholder="Enter product description"
            value={formData.description}
            onChange={handleChange}
          />
          {errors.description && <p style={{ color: '#dc3545', fontSize: '14px', margin: '5px 0' }}>{errors.description}</p>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Price</label>
          <input
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            style={{
              width: '100%',
              padding: '8px',
              border: `1px solid ${errors.price ? '#dc3545' : '#ccc'}`,
              borderRadius: '4px'
            }}
            placeholder="0.00"
            value={formData.price}
            onChange={handleChange}
          />
          {errors.price && <p style={{ color: '#dc3545', fontSize: '14px', margin: '5px 0' }}>{errors.price}</p>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Points</label>
          <input
            name="points_reward"
            type="number"
            min="0"
            step="0.5"
            style={{
              width: '100%',
              padding: '8px',
              border: `1px solid ${errors.points_reward ? '#dc3545' : '#ccc'}`,
              borderRadius: '4px'
            }}
            placeholder="0.00"
            value={formData.points_reward}
            onChange={handleChange}
          />
          {errors.points_reward && <p style={{ color: '#dc3545', fontSize: '14px', margin: '5px 0' }}>{errors.points_reward}</p>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Type</label>
          <select
            name="type"
            style={{
              width: '100%',
              padding: '8px',
              border: `1px solid ${errors.type ? '#dc3545' : '#ccc'}`,
              borderRadius: '4px'
            }}
            value={formData.type}
            onChange={handleChange}
          >
            <option value="">Select Clothing type</option>
            <option value="summer">Summer</option>
            <option value="winter">Winter</option>
            <option value="spring">Spring</option>
            <option value="autumn">Autumn</option>
          </select>
          {errors.type && <p style={{ color: '#dc3545', fontSize: '14px', margin: '5px 0' }}>{errors.type}</p>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Size</label>
          <select
            name="size"
            style={{
              width: '100%',
              padding: '8px',
              border: `1px solid ${errors.size ? '#dc3545' : '#ccc'}`,
              borderRadius: '4px'
            }}
            value={formData.size}
            onChange={handleChange}
          >
            <option value="">Select size</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
            <option value="XL">Extra Large</option>
          </select>
          {errors.size && <p style={{ color: '#dc3545', fontSize: '14px', margin: '5px 0' }}>{errors.size}</p>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Product Images</label>
          <div style={{
            border: `2px dashed ${errors.images ? '#dc3545' : '#ccc'}`,
            borderRadius: '8px',
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa'
          }}>
            <input 
              ref={fileInputRef}
              type="file" 
              multiple 
              accept="image/*"
              onChange={handleFileChange}
              style={{
                display: 'block',
                margin: '0 auto',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: 'white'
              }}
            />
            <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '14px' }}>
              Select multiple images (PNG, JPG, GIF)
            </p>
          </div>
          {errors.images && <p style={{ color: '#dc3545', fontSize: '14px', margin: '5px 0' }}>{errors.images}</p>}

          {previewUrls.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Image previews:</p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                gap: '10px' 
              }}>
                {previewUrls.map((url, index) => (
                  <div key={index} style={{ textAlign: 'center' }}>
                    <img 
                      src={url} 
                      alt={`Preview ${index + 1}`} 
                      style={{
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}
                    />
                    <p style={{ fontSize: '12px', margin: '5px 0', color: '#666' }}>
                      Image {index + 1}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {loading ? "Processing..." : "Add Product"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestAddProduct;