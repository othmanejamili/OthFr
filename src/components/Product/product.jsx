import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../../styles/product.css"; 
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";
import { Filter, X, ChevronDown, Plus, Minus } from 'lucide-react';

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
  
  // Mobile filter overlay state
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Sidebar filter group expansion states
  const [expandedGroups, setExpandedGroups] = useState({
    category: false,
    price: false,
    rating: false,
    date: false
  });

  // Refs for animations
  const productGridRef = useRef(null);
  const productCardsRef = useRef([]);

  const fetchProducts = () => {
    axios.get('https://othy.pythonanywhere.com/api/products/')
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
    setCurrentPage(1);
    updateActiveFilters();
  }, [filters, products]);

  // Initialize animations after products are loaded
  useEffect(() => {
    if (!loading && filteredProducts.length > 0) {
      animateProductsOnLoad();
      initScrollAnimations();
    }
  }, [loading, filteredProducts, currentPage]);

  // Update active filters list
  const updateActiveFilters = () => {
    const newFilters = [];
    
    if (filters.searchTerm) {
      newFilters.push({ type: 'searchTerm', value: filters.searchTerm, label: 'Search' });
    }
    
    if (filters.type) {
      newFilters.push({ type: 'type', value: filters.type, label: 'Category' });
    }
    
    if (filters.minPrice !== 0 || filters.maxPrice !== 1000) {
      newFilters.push({ type: 'price', value: `$${filters.minPrice} - $${filters.maxPrice}`, label: 'Price' });
    }
    
    if (filters.date) {
      newFilters.push({ type: 'date', value: filters.date, label: 'Date' });
    }
    
    if (filters.rating) {
      newFilters.push({ type: 'rating', value: filters.rating, label: 'Rating' });
    }
    
    setActiveFilters(newFilters);
  };

  // Animation for products on initial load
  const animateProductsOnLoad = () => {
    const cards = document.querySelectorAll('.product-card');
    
    gsap.fromTo(cards, 
      { 
        opacity: 0, 
        y: 30,
        scale: 0.95
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
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    
    const cards = document.querySelectorAll('.product-card');
    
    cards.forEach((card) => {
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
        }
      });
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const handlePriceChange = (type, value) => {
    const numValue = value === '' ? (type === 'minPrice' ? 0 : 1000) : parseInt(value, 10);
    
    setFilters(prevFilters => ({
      ...prevFilters,
      [type]: numValue
    }));
  };

  const applyFilters = () => {
    let result = [...products];
    
    if (filters.searchTerm) {
      const searchTermLower = filters.searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTermLower) ||
        product.description.toLowerCase().includes(searchTermLower));
    }
    
    if (filters.type) {
      result = result.filter(product =>
        product.type.toLowerCase() === filters.type.toLowerCase()
      );
    }
    
    if (filters.minPrice !== '') {
      const minPrice = parseFloat(filters.minPrice);
      result = result.filter(product => 
        parseFloat(product.price) >= minPrice
      );
    }
    
    if (filters.maxPrice !== '') {
      const maxPrice = parseFloat(filters.maxPrice);
      result = result.filter(product => 
        parseFloat(product.price) <= maxPrice
      );
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

  // Toggle mobile filter overlay
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  // Toggle filter group expansion
  const toggleFilterGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const productTypes = [...new Set(products.map(product => product.type))];

  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => {
    const cards = document.querySelectorAll('.product-card');
    gsap.to(cards, {
      opacity: 0,
      y: 20,
      scale: 0.95,
      stagger: 0.05,
      duration: 0.3,
      onComplete: () => {
        setCurrentPage(pageNumber);
      }
    });
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const getProductImageUrl = (product) => {
    if (product.image_list && product.image_list.length > 0) {
      return product.image_list[0].image;
    }
    else if (product.image) {
      return product.image;
    }
    else {
      return "https://via.placeholder.com/300x400?text=No+Image";
    }
  };

  if (loading) return (
    <div className="product-page">
      <div className="loading-spinner"></div>
    </div>
  );
  
  if (error) return (
    <div className="alert-error">Error: {error}</div>
  );

  return (
    <div className="product-page">
      {/* Sidebar for desktop */}
      <div className="sidebar">
        {/* Category Navigation */}
        <div className="category-nav">
          <ul>
            <li><a href="#" className="active">All Products</a></li>
            <li><a href="#">Footwear</a></li>
            <li><a href="#">Clothing</a></li>
            <li><a href="#">Accessories</a></li>
            <li><a href="#">Equipment</a></li>
            <li><a href="#">New Releases</a></li>
            <li><a href="#">Sale</a></li>
          </ul>
        </div>

        {/* Desktop Filters */}
        <div className="sidebar-filters">
          {/* Search Filter */}
          <div className={`filter-group ${expandedGroups.category ? 'expanded' : ''}`}>
            <h3 onClick={() => toggleFilterGroup('category')}>
              Search & Category
            </h3>
            <div className="filter-options">
              <label>
                <input
                  type="text"
                  name="searchTerm"
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                  placeholder="Search products..."
                  style={{ width: '100%', marginBottom: '0.5rem' }}
                />
              </label>
              <label>
                Product Type:
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  style={{ width: '100%', marginTop: '0.25rem' }}
                >
                  <option value="">All Types</option>
                  {productTypes.map((type, index) => (
                    <option key={index} value={type}>{type}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Price Filter */}
          <div className={`filter-group ${expandedGroups.price ? 'expanded' : ''}`}>
            <h3 onClick={() => toggleFilterGroup('price')}>
              Price
            </h3>
            <div className="filter-options">
              <label>
                <input type="checkbox" /> Under DHD 50
              </label>
              <label>
                <input type="checkbox" /> DHD 50 - DHD 100
              </label>
              <label>
                <input type="checkbox" /> DHD 100 - DHD200
              </label>
              <label>
                <input type="checkbox" /> DHD 200+
              </label>
              <div style={{ marginTop: '0.75rem' }}>
                <label>
                  Min Price:
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                    min="0"
                    style={{ width: '100%', marginTop: '0.25rem' }}
                  />
                </label>
                <label style={{ marginTop: '0.5rem', display: 'block' }}>
                  Max Price:
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                    min="0"
                    style={{ width: '100%', marginTop: '0.25rem' }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div className={`filter-group ${expandedGroups.rating ? 'expanded' : ''}`}>
            <h3 onClick={() => toggleFilterGroup('rating')}>
              Rating
            </h3>
            <div className="filter-options">
              <label>
                <input type="checkbox" /> 5 Stars
              </label>
              <label>
                <input type="checkbox" /> 4+ Stars
              </label>
              <label>
                <input type="checkbox" /> 3+ Stars
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Men's Running Shoes ({filteredProducts.length})</h1>
          <div className="page-controls">
            <button className="filter-toggle-button" onClick={toggleMobileFilters}>
              <Filter size={16} />
              Hide Filters
            </button>
            <div className="sort-dropdown">
              <select>
                <option>Sort By</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
                <option>Best Sellers</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="active-filters">
            {activeFilters.map((filter, index) => (
              <span className="active-filter-tag" key={index}>
                {filter.label}: {filter.value}
                <span 
                  className="remove-icon" 
                  onClick={() => removeFilter(filter.type)}
                >
                  <X size={12} />
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Product Grid */}
        <div className="product-grid" ref={productGridRef}>
          {currentProducts.length > 0 ? (
            currentProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="product-card"
                data-product-id={product.id}
                ref={el => productCardsRef.current[index] = el}
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
                
                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-subtitle">Men's Running Shoe</p>
                  
                  {/* Color dots (placeholder) */}
                  <div className="product-colors">
                    <div className="color-dot" style={{ backgroundColor: '#8B4513' }}></div>
                    <div className="color-dot" style={{ backgroundColor: '#f5f5f5' }}></div>
                    <div className="color-dot" style={{ backgroundColor: '#000' }}></div>
                    <div className="color-dot" style={{ backgroundColor: '#DC143C' }}></div>
                    <div className="color-dot" style={{ backgroundColor: '#f5f5f5' }}></div>
                    <span className="color-count">+1</span>
                  </div>
                  
                  <p className="product-price">DHD {product.price}</p>
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
        {filteredProducts.length > productsPerPage && (
          <div className="pagination">
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
              className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
            >
              Previous
            </button>
            
            <div className="pagination-numbers">
              {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
            </div>
            
            <button 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Mobile Filter Overlay */}
      {showMobileFilters && (
        <div className="mobile-filter-overlay show">
          <div className="mobile-filter-container">
            <div className="mobile-filter-header">
              <h2>Filters</h2>
              <button className="mobile-filter-close" onClick={toggleMobileFilters}>
                <X size={24} />
              </button>
            </div>
            
            {/* Mobile filter content - same as sidebar filters */}
            <div className="sidebar-filters">
              <div className="filter-group expanded">
                <h3>Search & Category</h3>
                <div className="filter-options">
                  <label>
                    <input
                      type="text"
                      name="searchTerm"
                      value={filters.searchTerm}
                      onChange={handleFilterChange}
                      placeholder="Search products..."
                    />
                  </label>
                  <label>
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
                  </label>
                </div>
              </div>
              
              <div className="filter-group expanded">
                <h3>Price</h3>
                <div className="filter-options">
                  <label>
                    Min Price:
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                      min="0"
                    />
                  </label>
                  <label>
                    Max Price:
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                      min="0"
                    />
                  </label>
                </div>
              </div>
            </div>
            
            <button onClick={resetFilters} style={{ marginTop: '1rem', width: '100%' }}>
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;