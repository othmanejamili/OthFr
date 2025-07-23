import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useCart } from '../../context/CartContext';
import '../../styles/ProductDetail.css';
import { Minus, Plus, ShoppingBag, ShoppingCart, Share2, Copy, Facebook, Twitter, MessageCircle, X } from "lucide-react";

const ProductDetail = () => {
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Refs for animations
  const productDetailRef = useRef(null);
  const containerRef = useRef(null);
  const imageGalleryRef = useRef(null);
  const productInfoRef = useRef(null);
  const thumbnailsRef = useRef([]);
  const mainImageRef = useRef(null);
  const shareModalRef = useRef(null);

  useEffect(() => {
    console.log("Product ID from params:", id);
    
    if (!id) {
      setError("No product ID provided");
      setLoading(false);
      return;
    }
    
    // Fetch product details by ID
    axios.get(`https://othy.pythonanywhere.com/api/products/${id}/`)
      .then(response => {
        console.log("Product data:", response.data);
        
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
          if (containerRef.current) {
            containerRef.current.classList.add('animate-in');
          }
        }, 100);
      })
      .catch(error => {
        console.error("Error fetching product:", error);
        setError(error.message);
        setLoading(false);
      });
  }, [id]);

  // Fetch products with the same type
  const fetchSimilarProducts = (productType, currentProductId) => {
    axios.get(`https://othy.pythonanywhere.com/api/products/`, {
      params: {
        type: productType
      }
    })
      .then(response => {
        const filtered = response.data.filter(prod => prod.id !== currentProductId);
        
        const normalizedProducts = filtered.map(prod => ({
          ...prod,
          images: prod.image_list?.map(item => ({
            id: item.id,
            image_url: item.image
          })) || []
        }));
        
        setSimilarProducts(normalizedProducts.slice(0, 4));
      })
      .catch(error => {
        console.error("Error fetching similar products:", error);
      });
  };

  // Animation for product details on load
  const animateProductDetails = () => {
    gsap.set([imageGalleryRef.current, productInfoRef.current?.children], { 
      clearProps: "all" 
    });
    
    gsap.fromTo(imageGalleryRef.current, 
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.8, ease: "power2.out" }
    );
    
    const thumbnails = thumbnailsRef.current.filter(Boolean);
    gsap.fromTo(thumbnails, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.3 }
    );
    
    if (productInfoRef.current) {
      const productInfoElements = productInfoRef.current.children;
      gsap.fromTo(productInfoElements, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.5 }
      );
    }
  };

  // Handle image change with animation
  const changeImage = (index) => {
    if (index === activeImageIndex) return;
    
    const mainImage = mainImageRef.current;
    
    gsap.fromTo(mainImage,
      { opacity: 0.7, scale: 0.98 },
      { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
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
    const addToCartButton = document.querySelector('.add-to-cart-button');
    
    gsap.to(addToCartButton, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        const successMessage = document.createElement('div');
        successMessage.className = 'cart-success-message';
        successMessage.textContent = `${product.name} (${quantity}) added to cart!`;
        
        document.querySelector('.product-detail-page').appendChild(successMessage);
        
        gsap.fromTo(successMessage, 
          { opacity: 0, y: -20 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
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
    
    if (product) {
      const itemToAdd = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price.replace(/[^0-9.-]+/g,"")),
        quantity: quantity,
        image: product.images && product.images.length > 0 ? product.images[0].image_url : null
      };
      
      addItem(itemToAdd);
      setAddedToCart(true);
      setQuantity(1);
      
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    }
  };
  
  // Navigate to cart
  const goToCart = () => {
    navigate('/cart');
  };

  // Share functionality
  const getProductUrl = () => {
    return window.location.href;
  };

  const getShareText = () => {
    return `Check out this amazing product: ${product.name} - ${product.price}`;
  };

  const handleShare = (platform) => {
    const url = encodeURIComponent(getProductUrl());
    const text = encodeURIComponent(getShareText());
    const imageUrl = product.images && product.images.length > 0 
      ? encodeURIComponent(product.images[0].image_url) 
      : '';

    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(product.name)}&body=${text}%20${url}`;
        break;
      default:
        return;
    }

    if (platform === 'email') {
      window.location.href = shareUrl;
    } else {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
    
    setShowShareModal(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getProductUrl());
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
        setShowShareModal(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const openShareModal = () => {
    setShowShareModal(true);
    setTimeout(() => {
      if (shareModalRef.current) {
        gsap.fromTo(shareModalRef.current,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
        );
      }
    }, 10);
  };

  const closeShareModal = () => {
    if (shareModalRef.current) {
      gsap.to(shareModalRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => setShowShareModal(false)
      });
    } else {
      setShowShareModal(false);
    }
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
      
      {/* Main product layout */}
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
          <div className="product-header">
            <h1>{product.name}</h1>
            <button 
              className="share-button"
              onClick={openShareModal}
              aria-label="Share this product"
            >
              <Share2 size={20} />
              Share
            </button>
          </div>
          
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
              <Minus size={18} />
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
              <Plus size={18}/>
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
                  <ShoppingBag />
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
              <ShoppingCart size={18} strokeWidth={2} />
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
      
      {/* Similar Products */}
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={closeShareModal}>
          <Share2 />
          <div 
            className="share-modal" 
            ref={shareModalRef}
            onClick={(e) => e.stopPropagation()}
          ><Share2 />
            <div className="share-modal-header">
              <h3>Share this product</h3>
              <button 
                className="close-modal-btn"
                onClick={closeShareModal}
                aria-label="Close share modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Product Preview Section */}
            <div className="share-product-preview">
              <div className="share-product-image">
                <img
                  src={product.images?.[activeImageIndex]?.image_url || product.images?.[0]?.image_url}
                  alt={product.name}
                  className="share-modal-product-img"
                />
              </div>
              <div className="share-product-info">
                <h4 className="share-product-name">{product.name}</h4>
                <p className="share-product-price">DH {product.price}</p>
              </div>
            </div>
            
            {/* Social Share Options - Horizontal Layout */}
            <div className="share-options-horizontal">
              <h5 className="share-options-title">Share on social media</h5>
              <div className="social-icons-row">
                <button 
                  className="share-option facebook"
                  onClick={() => handleShare('facebook')}
                  title="Share on Facebook"
                >
                  <Facebook size={24} />
                </button>
                
                <button 
                  className="share-option twitter"
                  onClick={() => handleShare('twitter')}
                  title="Share on Twitter/X"
                >
                  <X size={24} />
                </button>
                
                <button 
                  className="share-option whatsapp"
                  onClick={() => handleShare('whatsapp')}
                  title="Share on WhatsApp"
                >
                  <MessageCircle size={24} />
                </button>
                
                <button 
                  className="share-option email"
                  onClick={() => handleShare('email')}
                  title="Share via Email"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </button>

                
              </div>
            </div>
          </div>
        
        </div>
      )}
    </div>
  );
};
 
export default ProductDetail;