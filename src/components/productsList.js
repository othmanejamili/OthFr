import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import axios from 'axios';
import '../styles/ProductList.css'; // Using the same styles from UpdateProduct

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        searchTerm: '',
        type: '',
        minPrice: '',
        maxPrice: ''
    });

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

    useEffect(() => {
        applyFilters();
    }, [filters, products]);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setLoading(true);
            axios.delete(`http://127.0.0.1:8000/api/products/${id}/`)
                .then(() => {
                    // Refresh the product list after successful deletion
                    fetchProducts();
                })
                .catch(error => {
                    setError(error.message);
                    setLoading(false);
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
        
        if (filters.minPrice) {
            const minPrice = parseFloat(filters.minPrice);
            result = result.filter(product => 
                parseFloat(product.price) >= minPrice
            );
        }

        // Filter by max price
        if (filters.maxPrice) {
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
            minPrice: '',
            maxPrice: ''
        });
    };

    // Get unique product types for filter dropdown
    const productTypes = [...new Set(products.map(product => product.type))];

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
    
    return (
        <div className="container1">
            <h2>Product List</h2>
            <Link to={'/admin/products/add/'} className="button-primary">Add Product</Link>
            <div className="filter-section">
                <div className="filter-row">
                    <div className="filter-group">
                        <label htmlFor="searchTerm">Search:</label>
                        <input
                            type="text"
                            id="searchTerm"
                            name="searchTerm"
                            value={filters.searchTerm}
                            onChange={handleFilterChange}
                            placeholder="Search by name or description"
                        />
                    </div>
                    
                    <div className="filter-group">
                        <label htmlFor="type">Product Type:</label>
                        <select
                            id="type"
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                        >
                            <option value="">All Types</option>
                            {productTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="filter-group">
                        <label htmlFor="minPrice">Min Price:</label>
                        <input
                            type="number"
                            id="minPrice"
                            name="minPrice"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                            placeholder="Min"
                        />
                    </div>
                    
                    <div className="filter-group">
                        <label htmlFor="maxPrice">Max Price:</label>
                        <input
                            type="number"
                            id="maxPrice"
                            name="maxPrice"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                            placeholder="Max"
                        />
                    </div>
                    
                    <button className="button-primary" onClick={resetFilters}>
                        Reset Filters
                    </button>
                </div>
                
                <div className="filter-summary">
                    Showing {filteredProducts.length} of {products.length} products
                </div>
            </div>
            
            <div className="table-responsive">
                <table className="product-table">
                    <thead>
                        <tr>
                            <th>Id</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Type</th>
                            <th>Size</th>
                            <th>Pictures</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                    {filteredProducts.map(product => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td className="description-cell">{product.description}</td>
                            <td>${parseFloat(product.price).toFixed(2)}</td>
                            <td>{product.type}</td>
                            <td>{product.size}</td>
                            <td>
                                {product.image_list && product.image_list.length > 0 && (
                                    <img 
                                        src={product.image_list[0].image}
                                        alt={`${product.name} thumbnail`}
                                        className="product-thumbnail"
                                    />
                                )}
                            </td>
                            <td className="action-buttons">
                                <Link to={`/admin/products/updute/${product.id}`} 
                                className="button-primary">
                                    Edit
                                </Link>
                                <button 
                                    onClick={() => handleDelete(product.id)}
                                    className="button-delete"
                                    title="Delete product">
                                    <i className="fa fa-trash" aria-hidden="true"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductList;