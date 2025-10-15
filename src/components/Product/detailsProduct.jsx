import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useCart } from '../../context/CartContext';
import '../../styles/ProductDetail.css';
import ProductComments from "./ProductComment";
import { Minus, Plus, ShoppingBag, ShoppingCart, Share2, Copy, Facebook, Twitter, MessageCircle, X, Heart, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useFavourite } from "../../context/FavouriteContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addFavourite } = useFavourite();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [similarProducts, setSimilarProducts] = useState([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addedToFavourite, setAddedToFavourite] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Nike-style states
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [expandedAccordion, setExpandedAccordion] = useState('');
  
  // Image lightbox states
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  
  // Refs for animations
  const productDetailRef = useRef(null);
  const containerRef = useRef(null);
  const imageGalleryRef = useRef(null);
  const productInfoRef = useRef(null);
  const thumbnailsRef = useRef([]);
  const mainImageRef = useRef(null);
  const shareModalRef = useRef(null);
  const lightboxRef = useRef(null);

  // Nike shoe sizes (you can make this dynamic based on product type)
  const shoeSizes = ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'];
  
  // Nike colors (you can make this dynamic from product data)
  const productColors = [
    { name: 'Black/White', color: '#000000' },
    { name: 'University Red', color: '#DC143C' },
    { name: 'Game Royal', color: '#4169E1' },
    { name: 'Pine Green', color: '#01796F' }
  ];

  useEffect(() => {
    if (!id) {
      setError("No product ID provided");
      setLoading(false);
      return;
    }

    axios.get(`https://othy.pythonanywhere.com/api/products/${id}/`)
      .then(response => {
        const productData = {
          ...response.data,
          images: response.data.image_list?.map(item => ({
            id: item.id,
            image_url: item.image
          })) || []
        };
        
        setProduct(productData);
        setLoading(false);
        
        if (response.data.type) {
          fetchSimilarProducts(response.data.type, response.data.id);
        }
        
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

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showLightbox) {
        closeLightbox();
      }
      if (event.key === 'ArrowLeft' && showLightbox) {
        navigateLightbox('prev');
      }
      if (event.key === 'ArrowRight' && showLightbox) {
        navigateLightbox('next');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox, lightboxImageIndex, product]);

  const fetchSimilarProducts = (productType, currentProductId) => {
    axios.get(`https://othy.pythonanywhere.com/api/products/`, {
      params: { type: productType }
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

  const animateProductDetails = () => {
    gsap.set([imageGalleryRef.current, productInfoRef.current?.children], { 
      clearProps: "all" 
    });
    
    gsap.fromTo(imageGalleryRef.current, 
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }
    );
    
    const thumbnails = thumbnailsRef.current.filter(Boolean);
    gsap.fromTo(thumbnails, 
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.2 }
    );
    
    if (productInfoRef.current) {
      const productInfoElements = productInfoRef.current.children;
      gsap.fromTo(productInfoElements, 
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out", delay: 0.3 }
      );
    }
  };

  const changeImage = (index) => {
    if (index === activeImageIndex) return;
    setActiveImageIndex(index);
  };

  // Lightbox functions
  const openLightbox = (index) => {
    setLightboxImageIndex(index);
    setShowLightbox(true);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    document.body.style.overflow = 'unset'; // Restore scrolling
  };

  const navigateLightbox = (direction) => {
    if (!product || !product.images) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (lightboxImageIndex + 1) % product.images.length;
    } else {
      newIndex = (lightboxImageIndex - 1 + product.images.length) % product.images.length;
    }
    setLightboxImageIndex(newIndex);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const adjustQuantity = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleColorSelect = (index) => {
    setSelectedColor(index);
  };

  const toggleAccordion = (section) => {
    setExpandedAccordion(expandedAccordion === section ? '' : section);
  };

  const handleAddToCart = () => {
    if (!selectedSize && product.type === 'footwear') {
      alert('Please select a size');
      return;
    }

    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = `Added to Bag`;
    document.body.appendChild(successMessage);

    setTimeout(() => {
      successMessage.remove();
    }, 3000);
    
    if (product) {
      const itemToAdd = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price.replace(/[^0-9.-]+/g,"")),
        quantity: quantity,
        size: selectedSize,
        color: productColors[selectedColor]?.name,
        image: product.images && product.images.length > 0 ? product.images[0].image_url : null
      };

      addItem(itemToAdd); 
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  const handleAddToFavourite = () => {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.textContent = `Added to Favourites`;
    document.body.appendChild(successMessage);

    setTimeout(() => {
      successMessage.remove();
    }, 3000);
    
    if (product) {
      const favouriteToAdd = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price.replace(/[^0-9.-]+/g,"")),
        image: product.images?.[0]?.image_url || null
      };
  
      addFavourite(favouriteToAdd);
      setAddedToFavourite(true);
      setTimeout(() => setAddedToFavourite(false), 3000);
    }
  };
  
  const goToCart = () => {
    navigate('/cart');
  };

  // Share functionality (keeping the same logic)
  const getProductUrl = () => {
    return window.location.href;
  };

  const getShareText = () => {
    return `Check out this amazing product: ${product.name} - ${product.price}`;
  };

  const handleShare = (platform) => {
    const url = encodeURIComponent(getProductUrl());
    const text = encodeURIComponent(getShareText());

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

  if (loading) return (
    <div className="product-detail-page">
      <div className="loading-spinner">Loading...</div>
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
        <Link to="/">Home</Link> / 
        <Link to="/product">Products</Link> / 
        <span className="current">{product.name}</span>
      </div>
      
      {/* Main product layout */}
      <div className="product-detail-container" ref={containerRef}>
        {/* Product Images Gallery */}
        <div className="product-gallery" ref={imageGalleryRef}>
          <div className="main-image-container" onClick={() => openLightbox(activeImageIndex)}>
            {product.images && product.images.length > 0 ? (
              <img 
                ref={mainImageRef}
                src={product.images[activeImageIndex].image_url}
                alt={product.name}
                className="main-image"
                style={{ cursor: 'zoom-in' }}
              />
            ) : (
              <div className="no-image">No image available</div>
            )}
          </div>
          
          <div className="thumbnails">
            {product.images && product.images.map((image, index) => (
              <img
                key={index}
                src={image.image_url}
                alt={`${product.name} thumbnail ${index + 1}`}
                className={`thumbnail ${index === activeImageIndex ? 'active' : ''}`}
                onClick={() => {
                  changeImage(index);
                  // Optional: Also open lightbox when clicking thumbnail
                  // openLightbox(index);
                }}
                ref={(el) => (thumbnailsRef.current[index] = el)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>

        {/* Product Info Section */}
        <div className="product-info" ref={productInfoRef}>
          {/* Product badge */}
          {product.isNew && (
            <div className="product-badge">Just In</div>
          )}

          <h1>{product.name}</h1>
          <p className="product-subtitle">{product.type || "Men's Shoes"}</p>
          
          <div className="price">{product.price}</div>
          
          <div className="description">
            {product.description}
            {product.points_reward && (
              <p>Earn {product.points_reward} points with this purchase</p>
            )}
          </div>



          {/* Size Selector */}
          {product.type === 'footwear' && (
            <div className="size-selector">
              <h3>Select Size</h3>
              <div className="size-options">
                {shoeSizes.map((size) => (
                  <button
                    key={size}
                    className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => handleSizeSelect(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="quantity-selector">
            <button 
              onClick={() => adjustQuantity(-1)}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
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
              <Plus size={16} />
            </button>
          </div>

          {/* Add to Bag Button */}
          <button
            className="add-to-cart-button"
            onClick={handleAddToCart}
            disabled={product.type === 'footwear' && !selectedSize}
          >
            <ShoppingBag size={20} />
            Add to Bag
          </button>

          {/* Favorite Button */}
          <button
            className="favorite-button"
            onClick={handleAddToFavourite}
          >
            <Heart size={20} />
            Favourite
          </button>

          {/* Share Button */}
          <button 
            className="share-button"
            onClick={() => setShowShareModal(true)}
          >
            <Share2 size={16} />
            Share
          </button>

          {/* Product Features */}
          <div className="product-features">
            <ul className="feature-list">
              <li>Shown: {productColors[selectedColor]?.name}</li>
              <li>Style: {product.id}</li>
              <li>Country/Region of Origin: Morocco</li>
            </ul>
          </div>

          {/* Shipping & Returns */}
          <div className="shipping-returns">
            <h3>Free Delivery and Returns</h3>
            <p>Free standard delivery on orders over DHD 50</p>
            <p>Free 30-day returns</p>
          </div>
        </div>
      </div>
      
      {/* Product Details Accordion */}
      <div className="product-details-sections">
        <div className="accordion-item">
          <button 
            className="accordion-button"
            onClick={() => toggleAccordion('description')}
          >
            Description
            <ChevronDown size={20} style={{ 
              transform: expandedAccordion === 'description' ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }} />
          </button>
          <div className={`accordion-content ${expandedAccordion === 'description' ? 'active' : ''}`}>
            <p>{product.fullDescription || product.description}</p>
            <p>This product is made with at least 20% recycled materials by weight.</p>
          </div>
        </div>

        <div className="accordion-item">
          <button 
            className="accordion-button"
            onClick={() => toggleAccordion('reviews')}
          >
            Reviews
            <ChevronDown size={20} style={{ 
              transform: expandedAccordion === 'reviews' ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }} />
          </button>
          <div className={`accordion-content ${expandedAccordion === 'reviews' ? 'active' : ''}`}>
            <ProductComments productId={product.id} />
          </div>
        </div>

        <div className="accordion-item">
          <button 
            className="accordion-button"
            onClick={() => toggleAccordion('delivery')}
          >
            Delivery & Returns
            <ChevronDown size={20} style={{ 
              transform: expandedAccordion === 'delivery' ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }} />
          </button>
          <div className={`accordion-content ${expandedAccordion === 'delivery' ? 'active' : ''}`}>
            <p><strong>Free standard delivery</strong></p>
            <p>Order by 11:59pm and choose Standard Delivery at checkout.</p>
            <p><strong>Free 30-day returns</strong></p>
            <p>Some exclusions apply. Return items in original packaging within 30 days for a full refund.</p>
          </div>
        </div>
      </div>
      
      {/* You Might Also Like */}
      <div className="similar-products">
        <h2>You Might Also Like</h2>
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
                  <p className="similar-product-category">{similarProduct.type || "Men's Shoes"}</p>
                  <p className="similar-product-price">{similarProduct.price}</p>
                  <div className="similar-product-colors">
                    <div className="similar-color-dot" style={{ backgroundColor: '#000' }}></div>
                    <div className="similar-color-dot" style={{ backgroundColor: '#DC143C' }}></div>
                    <div className="similar-color-dot" style={{ backgroundColor: '#4169E1' }}></div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p>No similar products found</p>
          )}
        </div>
      </div>

      {/* Image Lightbox Modal */}
      {showLightbox && product.images && product.images.length > 0 && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-container" ref={lightboxRef} onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox} aria-label="Close">
              <X size={24} />
            </button>
            
            {product.images.length > 1 && (
              <>
                <button 
                  className="lightbox-nav lightbox-prev" 
                  onClick={() => navigateLightbox('prev')}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  className="lightbox-nav lightbox-next" 
                  onClick={() => navigateLightbox('next')}
                  aria-label="Next image"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
            
            <div className="lightbox-image-container">
              <img 
                src={product.images[lightboxImageIndex].image_url} 
                alt={`${product.name} - Image ${lightboxImageIndex + 1}`}
                className="lightbox-image"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="lightbox-counter">
                {lightboxImageIndex + 1} / {product.images.length}
              </div>
            )}
            
            <div className="lightbox-thumbnails">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image.image_url}
                  alt={`Thumbnail ${index + 1}`}
                  className={`lightbox-thumbnail ${index === lightboxImageIndex ? 'active' : ''}`}
                  onClick={() => setLightboxImageIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Share Modal (keeping existing modal structure) */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div 
            className="share-modal" 
            ref={shareModalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="share-modal-header">
              <h3>Share this product</h3>
              <button 
                className="close-modal-btn"
                onClick={() => setShowShareModal(false)}
              >
                <X size={20} />
              </button>
            </div>

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
                <p className="share-product-price">{product.price}</p>
              </div>
            </div>
            
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

                <button 
                  className={`share-option copy-link ${copySuccess ? 'copied' : ''}`}
                  onClick={copyToClipboard}
                  title="Copy Link"
                >
                  {copySuccess ? '✓' : <Copy size={24} />}
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