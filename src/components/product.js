import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/product.css"; 
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import { Filter, X, ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Product = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Enhanced filter state
  const [filters, setFilters] = useState({
    searchTerm: '',
    type: '',
    minPrice: 0,
    maxPrice: 1000,
    date: '',
    rating: ''
  });
  
  // Active filters tracking
  const [activeFilters, setActiveFilters] = useState([]);
  
  // Navigation hook
  const navigate = useNavigate();
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  
  // Filter visibility state and animation
  const [showFilters, setShowFilters] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const filterRef = useRef(null);

  // Refs for animations
  const productGridRef = useRef(null);
  const productCardsRef = useRef([]);

  const fetchProducts = () => {
    axios.get('http://127.0.0.1:8000/api/products/')
      .then(response => {
        setProducts(response.data);
        setFilteredProducts(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
    // Reset to first page when filters change
    setCurrentPage(1);
    // Update active filters display
    updateActiveFilters();
  }, [filters, products]);

  // Handle click outside to close filter
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterRef.current && !filterRef.current.contains(event.target) && 
          !event.target.classList.contains('filter-toggle-button') && 
          showFilters) {
        closeFilter();
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters]);

  // Initialize animations after products are loaded
  useEffect(() => {
    if (!loading && filteredProducts.length > 0) {
      // Initial animation for product grid
      animateProductsOnLoad();
      
      // Initialize scroll animations
      initScrollAnimations();
    }
  }, [loading, filteredProducts, currentPage]);

  // Update active filters list
  const updateActiveFilters = () => {
    const newFilters = [];
    
    if (filters.searchTerm) {
      newFilters.push({ type: 'search', value: filters.searchTerm });
    }
    
    if (filters.type) {
      newFilters.push({ type: 'type', value: filters.type });
    }
    
    if (filters.minPrice !== 0 || filters.maxPrice !== 1000) {
      newFilters.push({ type: 'price', value: `$${filters.minPrice} - $${filters.maxPrice}` });
    }
    
    if (filters.date) {
      newFilters.push({ type: 'date', value: filters.date });
    }
    
    if (filters.rating) {
      newFilters.push({ type: 'rating', value: filters.rating });
    }
    
    setActiveFilters(newFilters);
  };

  // Animation for products on initial load
  const animateProductsOnLoad = () => {
    const cards = document.querySelectorAll('.product-card');
    
    gsap.fromTo(cards, 
      { 
        opacity: 0, 
        y: 50,
        scale: 0.9
      },
      { 
        opacity: 1, 
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out"
      }
    );
  };

  // Initialize scroll animations
  const initScrollAnimations = () => {
    // Clear any existing scroll triggers to prevent duplicates
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    
    const cards = document.querySelectorAll('.product-card');
    
    cards.forEach((card) => {
      // Create a scroll trigger for each card
      ScrollTrigger.create({
        trigger: card,
        start: "top bottom-=100",
        onEnter: () => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: "power2.out"
          });
        },
        onLeaveBack: () => {
          gsap.to(card, {
            opacity: 0.5,
            y: 30,
            scale: 0.95,
            duration: 0.5,
            ease: "power2.in"
          });
        }
      });
      
      // Add hover animation
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.05,
          boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
          duration: 0.3
        });
        
        // Animate the product name overlay
        const overlay = card.querySelector('.product-name-overlay');
        gsap.to(overlay, {
          opacity: 1,
          duration: 0.3
        });
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          scale: 1,
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          duration: 0.3
        });
        
        // Animate the product name overlay
        const overlay = card.querySelector('.product-name-overlay');
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.3
        });
      });
    });
    
    // Add a "reveal" animation to the pagination when it comes into view
    const pagination = document.querySelector('.pagination');
    if (pagination) {
      ScrollTrigger.create({
        trigger: pagination,
        start: "top bottom-=50",
        onEnter: () => {
          gsap.fromTo(pagination, 
            { 
              opacity: 0, 
              y: 20 
            },
            { 
              opacity: 1, 
              y: 0, 
              duration: 0.8,
              ease: "power2.out"
            }
          );
        }
      });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  // Handle price input changes
  const handlePriceChange = (type, value) => {
    const numValue = value === '' ? '' : parseInt(value, 10);
    
    setFilters(prevFilters => ({
      ...prevFilters,
      [type]: numValue
    }));
  };

  // Handle price range selection from dropdown
  const handlePriceRangeSelect = (e) => {
    const [min, max] = e.target.value.split('-');
    setFilters(prevFilters => ({
      ...prevFilters,
      minPrice: parseInt(min),
      maxPrice: parseInt(max)
    }));
  };

  const applyFilters = () => {
    let result = [...products];
    
    // Filter by search term (name or description)
    if (filters.searchTerm) {
      const searchTermLower = filters.searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTermLower) ||
        product.description.toLowerCase().includes(searchTermLower));
    }
    
    // Filter by type
    if (filters.type) {
      result = result.filter(product=>
        product.type.toLowerCase() === filters.type.toLowerCase()
      );
    }
    
    // Filter by min price
    if (filters.minPrice !== '') {
      const minPrice = parseFloat(filters.minPrice);
      result = result.filter(product => 
        parseFloat(product.price) >= minPrice
      );
    }
    
    // Filter by max price
    if (filters.maxPrice !== '') {
      const maxPrice = parseFloat(filters.maxPrice);
      result = result.filter(product => 
        parseFloat(product.price) <= maxPrice
      );
    }
    
    // Filter by date (assuming product has a date field)
    if (filters.date) {
      const now = new Date();
      let dateLimit;
      
      switch(filters.date) {
        case 'Today':
          dateLimit = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'This Week':
          dateLimit = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'This Month':
          dateLimit = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'This Year':
          dateLimit = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          dateLimit = null;
      }
      
      if (dateLimit) {
        result = result.filter(product => {
          const productDate = new Date(product.created_at || product.date);
          return productDate >= dateLimit;
        });
      }
    }
    
    // Filter by rating (assuming product has a rating field)
    if (filters.rating) {
      let minRating;
      
      switch(filters.rating) {
        case '5 Stars':
          minRating = 5;
          break;
        case '4+ Stars':
          minRating = 4;
          break;
        case '3+ Stars':
          minRating = 3;
          break;
        default:
          minRating = 0;
      }
      
      result = result.filter(product => {
        const rating = parseFloat(product.rating || 0);
        return rating >= minRating;
      });
    }
    
    setFilteredProducts(result);
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      type: '',
      minPrice: 0,
      maxPrice: 1000,
      date: '',
      rating: ''
    });
    setActiveFilters([]);
  };

  // Remove individual filter
  const removeFilter = (filterType) => {
    if (filterType === 'price') {
      setFilters(prev => ({
        ...prev,
        minPrice: 0,
        maxPrice: 1000
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [filterType]: ''
      }));
    }
  };
  
  // Toggle filter visibility with animation
  const toggleFilters = () => {
    if (showFilters) {
      closeFilter();
    } else {
      openFilter();
    }
  };

  // Open filter with animation
  const openFilter = () => {
    setShowFilters(true);
    setAnimationClass('show');
  };

  // Close filter with animation
  const closeFilter = () => {
    setAnimationClass('hide');
    setTimeout(() => {
      setShowFilters(false);
      setAnimationClass('');
    }, 300); // Match CSS animation duration
  };

  // Get unique product types for filter dropdown
  const productTypes = [...new Set(products.map(product => product.type))];

  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Change page with animation
  const paginate = (pageNumber) => {
    // First animate out current products
    const cards = document.querySelectorAll('.product-card');
    gsap.to(cards, {
      opacity: 0,
      y: 30,
      scale: 0.95,
      stagger: 0.05,
      duration: 0.3,
      onComplete: () => {
        // Change page after animation completes
        setCurrentPage(pageNumber);
        // Products will animate in via the useEffect
      }
    });
  };
  
  // Go to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      paginate(currentPage - 1);
    }
  };
  
  // Go to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      paginate(currentPage + 1);
    }
  };

  // Generate price range options
  const generatePriceRanges = () => {
    const ranges = [
      { label: "All Prices", min: 0, max: 1000 },
      { label: "Under $50", min: 0, max: 50 },
      { label: "$50 - $100", min: 50, max: 100 },
      { label: "$100 - $200", min: 100, max: 200 },
      { label: "$200 - $500", min: 200, max: 500 },
      { label: "$500+", min: 500, max: 1000 }
    ];
    
    return ranges;
  };
  
  // Check which price range is currently selected
  const getCurrentPriceRangeValue = () => {
    const ranges = generatePriceRanges();
    const currentRange = ranges.find(
      range => range.min === filters.minPrice && range.max === filters.maxPrice
    );
    
    if (currentRange) {
      return `${currentRange.min}-${currentRange.max}`;
    }
    
    return "custom";
  };

  // Navigate to product details page when a product is clicked
  const handleProductClick = (productId) => {
    // Animate the clicked product card before navigation
    const clickedCard = document.querySelector(`[data-product-id="${productId}"]`);
    
    if (clickedCard) {
      gsap.to(clickedCard, {
        scale: 0.95,
        opacity: 0.8,
        y: -10,
        duration: 0.2,
        onComplete: () => {
          // Navigate to the product detail page after animation completes
          navigate(`/product/${productId}`);
        }
      });
    } else {
      // Fallback if animation doesn't work
      navigate(`/product/${productId}`);
    }
  };

  // Helper function to get the first image URL from a product
  const getProductImageUrl = (product) => {
    // Check if product has image_list and it's not empty
    if (product.image_list && product.image_list.length > 0) {
      return product.image_list[0].image;
    }
    // Fallback to direct image property if it exists
    else if (product.image) {
      return product.image;
    }
    // Return a placeholder if no image is available
    else {
      return "https://via.placeholder.com/300x400?text=No+Image";
    }
  };

  if (loading) return(
    <div className='container'>
      <div className="loading-spinner">loading...</div>
    </div>
  );
  
  if (error) return(
    <div className='container'>
      <div className="alert alert-error">Error: {error}</div>
    </div>
  );

  const priceRanges = generatePriceRanges();

  return (
    <div className="product-page">
      {/* Filter toggle button */}
      {showFilters && <div className={`filter-overlay ${animationClass}`}></div>}
      <div className="filter-toggle-container">
        <button className="filter-toggle-button" onClick={toggleFilters}>
          <span className="filter-icon">
            <Filter size={16} />
          </span>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          <ChevronDown size={16} style={{ marginLeft: '8px' }} />
        </button>
      </div>

      {/* Filter Section - Conditionally rendered */}
      <div 
        ref={filterRef}
        className={`filter-container ${animationClass}`}
        style={{ display: showFilters || animationClass ? 'block' : 'none' }}
      >
        <div className="filter-header">
          <h2 className="filter-title">Filter Products</h2>
          <h3 className="filter-subtitle">Narrow down your product search</h3>
        </div>
        
        <div className="filter-grid">
          {/* Search filter */}
          <div className="filter-item">
            <label>Search</label>
            <input
              type="text"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleFilterChange}
              placeholder="Search products..."
            />
          </div>
          
          {/* Type filter */}
          <div className="filter-item">
            <label>Product Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">All Types</option>
              {productTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          {/* Price filter dropdown */}
          <div className="filter-item">
            <label>Price Range</label>
            <select
              value={getCurrentPriceRangeValue()}
              onChange={handlePriceRangeSelect}
              className="price-range-select"
            >
              {priceRanges.map((range, index) => (
                <option key={index} value={`${range.min}-${range.max}`}>
                  {range.label}
                </option>
              ))}
              <option value="custom" disabled={getCurrentPriceRangeValue() !== "custom"}>
                Custom Range
              </option>
            </select>
          </div>
          
          {/* Custom price range inputs */}
          <div className="filter-item custom-price-inputs">
            <label>Custom Price Range</label>
            <div className="price-input-group">
              <div className="min-price-input">
                <span className="price-symbol">$</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                  min="0"
                />
              </div>
              <span className="price-range-separator">to</span>
              <div className="max-price-input">
                <span className="price-symbol">$</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="filter-buttons">
          <button 
            onClick={resetFilters}
            className="reset-button"
          >
            Reset Filters
          </button>
          <button 
            onClick={closeFilter}
            className="close-filter-button"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Active filters display */}
      {activeFilters.length > 0 && (
        <div className="active-filters">
          <div className="active-filters-container">
            <span className="active-filters-label">Active Filters:</span>
            <div className="active-filters-list">
              {activeFilters.map((filter, index) => (
                <span className="active-filter-tag" key={index}>
                  {filter.type === 'search' ? 'Search' : filter.type.charAt(0).toUpperCase() + filter.type.slice(1)}: {filter.value}
                  <span 
                    className="remove-icon" 
                    onClick={() => removeFilter(filter.type)}
                  >
                    <X size={12} />
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product Cards Grid */}
      <div className="product-grid" ref={productGridRef}>
        {currentProducts.length > 0 ? (
          currentProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="product-card"
              data-product-id={product.id}
              ref={el => productCardsRef.current[index] = el}
              style={{ opacity: 0, transform: 'translateY(50px) scale(0.9)' }}
              onClick={() => handleProductClick(product.id)}
            >
              <div className="product-image-container">
                <img 
                  src={getProductImageUrl(product)} 
                  alt={product.name}
                  className="product-image"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/300x400?text=Image+Error";
                  }}
                />
              </div>
              
              {/* Product info overlay that appears on hover */}
              <div className="product-name-overlay" style={{ opacity: 0 }}>
                <h3>{product.name}</h3>
              </div>
            </div>
          ))
        ) : (
          <div className="no-products-message">
            <p>No products found matching your filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <div className="pagination" style={{ opacity: 0 }}>
          <button 
            onClick={goToPreviousPage} 
            disabled={currentPage === 1}
            className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
          >
            &laquo; Previous
          </button>
          
          <div className="pagination-numbers">
            {[...Array(totalPages)].map((_, index) => {
              // Show limited page buttons based on current page
              const pageNumber = index + 1;
              
              // Always show first and last page
              // Show 2 pages before and after current page
              // Show ellipsis when needed
              const showPageButton = 
                pageNumber === 1 || 
                pageNumber === totalPages || 
                (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2);
              
              // Show ellipsis before and after gap in numbers
              const showPrevEllipsis = pageNumber === currentPage - 2 && currentPage > 4;
              const showNextEllipsis = pageNumber === currentPage + 2 && currentPage < totalPages - 3;
              
              if (showPageButton) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (showPrevEllipsis || showNextEllipsis) {
                return <span key={`ellipsis-${pageNumber}`} className="pagination-ellipsis">...</span>;
              } else {
                return null;
              }
            })}
          </div>
          
          <button 
            onClick={goToNextPage} 
            disabled={currentPage === totalPages}
            className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
          >
            Next &raquo;
          </button>
        </div>
      )}

      {/* Page info */}
      {filteredProducts.length > 0 && (
        <div className="page-info">
          Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
        </div>
      )}
    </div>
  );
};

export default Product;