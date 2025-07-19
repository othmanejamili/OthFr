import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useCart } from '../../context/CartContext';
import '../../styles/ProductDetail.css';
$
const ProductDetail = () => {
  // Changed from productId to id to match the route parameter name
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [similarProducts, setSimilarProducts] = useState([]);
  const [addedToCart, setAddedToCart] = useState(false);
  
  // Refs for animations
  const productDetailRef = useRef(null);
  const containerRef = useRef(null);
  const imageGalleryRef = useRef(null);
  const productInfoRef = useRef(null);
  const thumbnailsRef = useRef([]);
  const mainImageRef = useRef(null);

  useEffect(() => {
    console.log("Product ID from params:", id); // Add this line for debugging
    
    if (!id) {
      setError("No product ID provided");
      setLoading(false);
      return;
    }
    
    // Fetch product details by ID
    axios.get(`https://othy.pythonanywhere.com/api/products/${id}/`)
      .then(response => {
        console.log("Product data:", response.data); // Add this line for debugging
        
        // Create a normalized product object with images array for compatibility
        const productData = {
          ...response.data,
          images: response.data.image_list?.map(item => ({
            id: item.id,
            image_url: item.image
          })) || []
        };
        
        setProduct(productData);
        setLoading(false);
        
        // Fetch products with the same type
        if (response.data.type) {
          fetchSimilarProducts(response.data.type, response.data.id);
        }
        
        // Initialize animations after product is loaded
        setTimeout(() => {
          animateProductDetails();
          // Add the animate-in class for CSS animations
          if (containerRef.current) {
            containerRef.current.classList.add('animate-in');
          }
        }, 100);
      })
      .catch(error => {
        console.error("Error fetching product:", error); // Add this line for debugging
        setError(error.message);
        setLoading(false);
      });
  }, [id]); // Changed from productId to id

  // Fetch products with the same type
  const fetchSimilarProducts = (productType, currentProductId) => {
    axios.get(`https://othy.pythonanywhere.com/api/products/`, {
      params: {
        type: productType
      }
    })
      .then(response => {
        // Filter out the current product
        const filtered = response.data.filter(prod => prod.id !== currentProductId);
        
        // Normalize similar products data to match component expectations
        const normalizedProducts = filtered.map(prod => ({
          ...prod,
          images: prod.image_list?.map(item => ({
            id: item.id,
            image_url: item.image
          })) || []
        }));
        
        // Limit to 4 similar products
        setSimilarProducts(normalizedProducts.slice(0, 4));
      })
      .catch(error => {
        console.error("Error fetching similar products:", error);
      });
  };

  // Animation for product details on load
  const animateProductDetails = () => {
    // Reset any previous animations
    gsap.set([imageGalleryRef.current, productInfoRef.current?.children], { 
      clearProps: "all" 
    });
    
    // Animate the main image container
    gsap.fromTo(imageGalleryRef.current, 
      { 
        opacity: 0, 
        x: -30 
      },
      { 
        opacity: 1, 
        x: 0, 
        duration: 0.8,
        ease: "power2.out"
      }
    );
    
    // Animate thumbnails
    const thumbnails = thumbnailsRef.current.filter(Boolean);
    gsap.fromTo(thumbnails, 
      { 
        opacity: 0, 
        y: 20 
      },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.3
      }
    );
    
    // Animate product info with staggered effect
    if (productInfoRef.current) {
      const productInfoElements = productInfoRef.current.children;
      gsap.fromTo(productInfoElements, 
        { 
          opacity: 0, 
          y: 20 
        },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.5
        }
      );
    }
  };

  // Handle image change with animation
  const changeImage = (index) => {
    if (index === activeImageIndex) return;
    
    // Get the main image element
    const mainImage = mainImageRef.current;
    
    // Animate image change
    gsap.fromTo(mainImage,
      { 
        opacity: 0.7,
        scale: 0.98
      },
      { 
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      }
    );
    
    setActiveImageIndex(index);
  };

  // Handle quantity change
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  // Handle increment/decrement quantity
  const adjustQuantity = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  // Navigate through images
  const navigateGallery = (direction) => {
    if (!product) return;
    
    let newIndex = activeImageIndex;
    
    if (direction === 'next') {
      newIndex = (activeImageIndex + 1) % product.images.length;
    } else {
      newIndex = (activeImageIndex - 1 + product.images.length) % product.images.length;
    }
    
    changeImage(newIndex);
  };

  // Handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle Add to Cart with animation
  const handleAddToCart = () => {
    // Add to cart animation
    const addToCartButton = document.querySelector('.add-to-cart-button');
    
    gsap.to(addToCartButton, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        // Create success message
        const successMessage = document.createElement('div');
        successMessage.className = 'cart-success-message';
        successMessage.textContent = `${product.name} (${quantity}) added to cart!`;
        
        document.querySelector('.product-detail-page').appendChild(successMessage);
        
        // Animate success message
        gsap.fromTo(successMessage, 
          { 
            opacity: 0, 
            y: -20 
          },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
              // Remove success message after delay
              setTimeout(() => {
                gsap.to(successMessage, {
                  opacity: 0,
                  y: -20,
                  duration: 0.5,
                  ease: "power2.in",
                  onComplete: () => {
                    successMessage.remove();
                  }
                });
              }, 2000);
            }
          }
        );
      }
    });
    
    // Add the product to the cart context
    if (product) {
      const itemToAdd = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price.replace(/[^0-9.-]+/g,"")), // Convert price string to number
        quantity: quantity,
        image: product.images && product.images.length > 0 ? product.images[0].image_url : null
      };
      
      addItem(itemToAdd);
      setAddedToCart(true);
      
      // Optional: Reset quantity after adding to cart
      setQuantity(1);
      
      // After a delay, reset the "added to cart" state
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    }
  };
  
  // Navigate to cart
  const goToCart = () => {
    navigate('/cart');
  };

  if (loading) return (
    <div className="product-detail-page">
      <div className="loading-spinner">Loading product details...</div>
    </div>
  );
  
  if (error) return (
    <div className="product-detail-page">
      <div className="alert-error">Error: {error}</div>
    </div>
  );
  
  if (!product) return (
    <div className="product-detail-page">
      <div className="alert-error">Product not found</div>
    </div>
  );

  return (
    <div className="product-detail-page" ref={productDetailRef}>
      {/* Breadcrumb navigation */}
      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; 
        <Link to="/product">Products</Link> &gt; 
        <span className="current">{product.name}</span>
      </div>
      
      {/* Main product layout - Image left, Info right */}
      <div className="product-detail-container" ref={containerRef}>
        {/* Product Images Gallery */}
        <div className="product-gallery" ref={imageGalleryRef}>
          <div className="main-image-container">
            {product.images && product.images.length > 0 ? (
              <img 
                ref={mainImageRef}
                src={product.images[activeImageIndex].image_url}
                alt={product.name}
                className="main-image"
              />
            ) : (
              <div className="no-image">No image available</div>
            )}
            
            {/* Gallery navigation */}
            {product.images && product.images.length > 1 && (
              <div className="gallery-navigation">
                <button 
                  className="gallery-nav-button" 
                  onClick={() => navigateGallery('prev')}
                  aria-label="Previous image"
                >
                  &#10094;
                </button>
                <button 
                  className="gallery-nav-button" 
                  onClick={() => navigateGallery('next')}
                  aria-label="Next image"
                >
                  &#10095;
                </button>
              </div>
            )}
            
            {/* Gallery counter */}
            {product.images && product.images.length > 0 && (
              <div className="gallery-counter">
                {activeImageIndex + 1} / {product.images.length}
              </div>
            )}
          </div>
          
          <div className="thumbnails">
            {product.images && product.images.map((image, index) => (
              <img
                key={index}
                src={image.image_url}
                alt={`${product.name} thumbnail ${index + 1}`}
                className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                onClick={() => changeImage(index)}
                ref={(el) => (thumbnailsRef.current[index] = el)}
              />
            ))}
          </div>
        </div>
        

        {/* Product Info Section */}
        <div className="product-info" ref={productInfoRef}>
          <h1>{product.name}</h1>
          <p className="description">{product.description}</p>
          <p className="price">{product.price}</p>
          <p className="description">Points : {product.points_reward}</p>
          
          {/* Quantity Selector */}
          <div className="quantity-selector">
            <button 
              onClick={() => adjustQuantity(-1)}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              aria-label="Quantity"
            />
            <button 
              onClick={() => adjustQuantity(1)}
              aria-label="Increase quantity"
            >
              <svg className="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>

          {/* Cart Buttons */}
          <div className="cart-buttons">
            <button
              className={`luxury-btn-primary ${addedToCart ? 'added' : ''}`}
              onClick={handleAddToCart}
            >
              {addedToCart ? (
                <>
                  <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Added to Cart!
                </>
              ) : (
                <>
                  <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  Add to Cart
                </>
              )}
            </button>
            
            <button
              className="view-cart-button"
              onClick={goToCart}
            >
              <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              View Cart
            </button>
          </div>
        </div>
      </div>
      
      {/* Product Details Tabs */}
      <div className="product-details-sections">
        <div className="details-tabs">
          <button 
            className={`tab-button ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => handleTabChange('description')}
          >
            Description
          </button>
          <button 
            className={`tab-button ${activeTab === 'specifications' ? 'active' : ''}`}
            onClick={() => handleTabChange('specifications')}
          >
            Specifications
          </button>
          <button 
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => handleTabChange('reviews')}
          >
            Reviews
          </button>
        </div>
        
        <div className={`tab-content ${activeTab === 'description' ? 'active' : ''}`}>
          <p>{product.fullDescription || product.description}</p>
        </div>
        
        <div className={`tab-content ${activeTab === 'specifications' ? 'active' : ''}`}>
          <table>
            <tbody>
              {product.specifications?.map((spec, index) => (
                <tr key={index}>
                  <td>{spec.name}</td>
                  <td>{spec.value}</td>
                </tr>
              )) || (
                <tr>
                  <td colSpan="2">No specifications available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className={`tab-content ${activeTab === 'reviews' ? 'active' : ''}`}>
          {product.reviews?.length > 0 ? (
            product.reviews.map((review, index) => (
              <div key={index} className="review-item">
                <div className="review-header">
                  <h4>{review.userName}</h4>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`star ${i < review.rating ? 'filled' : ''}`}>★</span>
                    ))}
                  </div>
                </div>
                <p>{review.comment}</p>
              </div>
            ))
          ) : (
            <p>No reviews yet. Be the first to review this product!</p>
          )}
        </div>
      </div>
      
      {/* Similar Products of Same Type */}
      <div className="similar-products">
        <h2>Similar Products</h2>
        <div className="similar-products-grid">
          {similarProducts.length > 0 ? (
            similarProducts.map((similarProduct, index) => (
              <Link 
                to={`/product/${similarProduct.id}`} 
                key={index}
                className="similar-product-card"
              >
                <div className="similar-product-image-container">
                  <img 
                    src={similarProduct.images && similarProduct.images[0]?.image_url} 
                    alt={similarProduct.name} 
                    className="similar-product-image"
                  />
                </div>
                <div className="similar-product-info">
                  <h3 className="similar-product-name">{similarProduct.name}</h3>
                  <p className="similar-product-price">{similarProduct.price}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="no-similar-products">
              No similar products found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default ProductDetail;
