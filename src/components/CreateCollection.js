import React, { useState, useEffect } from 'react';
import { Plus, X, Search, Package, Tag, FileText, AlertCircle } from 'lucide-react';

const CreateCollection = () => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        selectedProducts: []
    });

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showProductSelector, setShowProductSelector] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [notification, setNotification] = useState({ type: '', message: '' });

    // Axios-like fetch function (since we can't import axios in artifacts)
    const axiosRequest = async (url, options = {}) => {
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (options.data) {
            config.body = JSON.stringify(options.data);
        }

        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw { response: { status: response.status, data } };
        }

        return { data, status: response.status };
    };

    // Show notification
    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    };

    // Fetch products on component mount
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axiosRequest('https://othy.pythonanywhere.com/api/products/');
                setProducts(response.data);
                setFilteredProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
                showNotification('error', 'Failed to load products. Please refresh the page.');
            }
        };

        fetchProducts();
    }, []);

    // Filter products based on search term
    useEffect(() => {
        if (!searchTerm) {
            setFilteredProducts(products);
            return;
        }

        const filtered = products.filter(product =>
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.size?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleProductSelect = (product) => {
        if (!formData.selectedProducts.find(p => p.id === product.id)) {
            setFormData(prev => ({
                ...prev,
                selectedProducts: [...prev.selectedProducts, product]
            }));
        }
    };

    const handleProductRemove = (productId) => {
        setFormData(prev => ({
            ...prev,
            selectedProducts: prev.selectedProducts.filter(p => p.id !== productId)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = "Collection name is required";
        } else if (formData.name.length > 100) {
            newErrors.name = "Collection name must be less than 100 characters";
        }
        
        if (formData.description.length > 500) {
            newErrors.description = "Description must be less than 500 characters";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            selectedProducts: []
        });
        setSearchTerm("");
        setShowProductSelector(false);
        setErrors({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            showNotification('error', 'Please fix the errors in the form');
            return;
        }
    
        setLoading(true);
    
        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                products: formData.selectedProducts.map(p => p.id)
            };

            const response = await axiosRequest('https://othy.pythonanywhere.com/api/collections/', {
                method: 'POST',
                data: payload
            });

            console.log("Collection created successfully:", response.data);
            showNotification('success', 'Collection created successfully!');
            resetForm();
    
        } catch (error) {
            console.error("Error creating collection:", error);
            
            if (error.response?.status === 401) {
                showNotification('error', 'Authentication required. Please log in as admin.');
            } else if (error.response?.status === 403) {
                showNotification('error', 'Permission denied. Admin access required.');
            } else if (error.response?.status === 400) {
                showNotification('error', 'Invalid data. Please check your inputs.');
            } else {
                showNotification('error', 'Failed to create collection. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
            {/* Notification */}
            {notification.message && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center ${
                    notification.type === 'success' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {notification.message}
                </div>
            )}

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Collection</h1>
                <p className="text-gray-600">Create a curated collection of products for your customers.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Collection Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        <Tag className="inline w-4 h-4 mr-2" />
                        Collection Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter collection name (e.g., Summer Essentials)"
                        maxLength={100}
                        required
                    />
                    {errors.name && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.name}
                        </p>
                    )}
                    <p className="text-gray-500 text-sm mt-1">{formData.name.length}/100 characters</p>
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        <FileText className="inline w-4 h-4 mr-2" />
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.description ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Describe your collection (optional)"
                        maxLength={500}
                    />
                    {errors.description && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            {errors.description}
                        </p>
                    )}
                    <p className="text-gray-500 text-sm mt-1">{formData.description.length}/500 characters</p>
                </div>

                {/* Product Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Package className="inline w-4 h-4 mr-2" />
                        Products in Collection
                    </label>
                    
                    {/* Selected Products */}
                    {formData.selectedProducts.length > 0 && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                Selected Products ({formData.selectedProducts.length})
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {formData.selectedProducts.map(product => (
                                    <div
                                        key={product.id}
                                        className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                    >
                                        <span className="mr-2">{product.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleProductRemove(product.id)}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                            aria-label={`Remove ${product.name}`}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add Products Button */}
                    <button
                        type="button"
                        onClick={() => setShowProductSelector(!showProductSelector)}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {showProductSelector ? 'Hide Products' : 'Add Products'}
                    </button>

                    {/* Product Selector */}
                    {showProductSelector && (
                        <div className="mt-4 border rounded-lg p-4 bg-gray-50">
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            
                            <div className="max-h-60 overflow-y-auto">
                                {filteredProducts.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No products found</p>
                                ) : (
                                    filteredProducts.map(product => (
                                        <div
                                            key={product.id}
                                            className={`p-3 border rounded-lg mb-2 cursor-pointer transition-colors ${
                                                formData.selectedProducts.find(p => p.id === product.id)
                                                    ? 'bg-blue-50 border-blue-200'
                                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}
                                            onClick={() => handleProductSelect(product)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-sm text-gray-500">Type: {product.type}</span>
                                                        <span className="text-sm text-gray-500">Size: {product.size}</span>
                                                        <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                                                        {product.points_reward > 0 && (
                                                            <span className="text-sm text-green-600">Points: {product.points_reward}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right ml-4">
                                                    <span className="font-semibold text-gray-900">${product.price}</span>
                                                    {formData.selectedProducts.find(p => p.id === product.id) && (
                                                        <div className="text-blue-600 text-sm mt-1 font-medium">✓ Selected</div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Display product images if available */}
                                            {product.image && product.image.length > 0 && (
                                                <div className="mt-3 flex space-x-2">
                                                    {product.image.slice(0, 3).map((image, index) => (
                                                        <img
                                                            key={index}
                                                            src={image.image_url}
                                                            alt={`${product.name} ${index + 1}`}
                                                            className="w-12 h-12 object-cover rounded border"
                                                        />
                                                    ))}
                                                    {product.image.length > 3 && (
                                                        <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                                                            +{product.image.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-6">
                    <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Creating Collection...
                            </>
                        ) : (
                            'Create Collection'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCollection;