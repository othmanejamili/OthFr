import React, { useState, useEffect } from 'react';
import { Plus, X, Search, Package, Tag, FileText } from 'lucide-react';

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

    // Fetch products from your Django API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('https://othy.pythonanywhere.com/api/products/'); // Adjust URL to your API endpoint
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setProducts(data);
                setFilteredProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
                // Handle error - show notification or fallback
            }
        };

        fetchProducts();
    }, []);

    useEffect(() => {
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.size.toLowerCase().includes(searchTerm.toLowerCase())
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

    const handleSubmit = async () => {
        
        if (!validateForm()) return;
        
        setLoading(true);
        
        try {
            // Call your Django API to create the collection
            const response = await fetch('https://othy.pythonanywhere.com/api/collections/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authentication headers if needed
                    // 'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    products: formData.selectedProducts.map(p => p.id) // Send product IDs
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create collection');
            }

            const result = await response.json();
            console.log("Collection created successfully:", result);
            
            // Reset form after successful submission
            setFormData({
                name: "",
                description: "",
                selectedProducts: []
            });
            setSearchTerm("");
            setShowProductSelector(false);
            
            alert("Collection created successfully!");
            
        } catch (error) {
            console.error("Error creating collection:", error);
            alert("Error creating collection. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Collection</h1>
                <p className="text-gray-600">Create a curated collection of products for your customers.</p>
            </div>

            <div className="space-y-6">
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
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
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
                                        <span>{product.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleProductRemove(product.id)}
                                            className="ml-2 text-blue-600 hover:text-blue-800"
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
                        Add Products
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
                                {filteredProducts.map(product => (
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
                                                <p className="text-sm text-gray-600">{product.description}</p>
                                                <div className="flex items-center gap-4 mt-1">
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
                                                    <div className="text-blue-600 text-sm mt-1">✓ Selected</div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Display product images if available */}
                                        {product.image_list && product.image_list.length > 0 && (
                                            <div className="mt-2 flex space-x-2">
                                                {product.image_list.slice(0, 3).map((image, index) => (
                                                    <img
                                                        key={index}
                                                        src={image.image_url}
                                                        alt={`${product.name} ${index + 1}`}
                                                        className="w-12 h-12 object-cover rounded border"
                                                    />
                                                ))}
                                                {product.image_list.length > 3 && (
                                                    <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                                                        +{product.image_list.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => {
                            setFormData({ name: "", description: "", selectedProducts: [] });
                            setSearchTerm("");
                            setShowProductSelector(false);
                            setErrors({});
                        }}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors flex items-center"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Creating...
                            </>
                        ) : (
                            'Create Collection'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateCollection;