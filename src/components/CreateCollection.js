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

    // Axios-like fetch function (with token support)
    const axiosRequest = async (url, options = {}) => {
        const token = localStorage.getItem('accessToken');
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }), // ✅ Include token
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

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification({ type: '', message: '' }), 5000);
    };

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
        if (!formData.name.trim()) newErrors.name = "Collection name is required";
        else if (formData.name.length > 100) newErrors.name = "Collection name must be less than 100 characters";
        if (formData.description.length > 500) newErrors.description = "Description must be less than 500 characters";
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

            {/* Form content continues here... (you already have this part correctly implemented) */}

            {/* ... everything below remains unchanged */}
            {/* This includes the form fields, selected products, search, and submit button */}
        </div>
    );
};

export default CreateCollection;
