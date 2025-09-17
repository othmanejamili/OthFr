// Admin Dashboard with Apex Charts Integration
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ReactApexChart from 'react-apexcharts';
import '../../styles/AdminDashBord.css';

const AdminDashboard = () => {
  const { currentUser, logout } = useContext(AuthContext);
  
  // State for chart data
  const [salesData, setSalesData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [timeFilter, setTimeFilter] = useState('weekly');
  
  // Mock data - In a real app, fetch this from your API
  useEffect(() => {
    // Sample sales data for the line chart
    const generateSalesData = () => {
      const weekly = [
        { x: 'Mon', y: 31 },
        { x: 'Tue', y: 40 },
        { x: 'Wed', y: 28 },
        { x: 'Thu', y: 51 },
        { x: 'Fri', y: 42 },
        { x: 'Sat', y: 82 },
        { x: 'Sun', y: 56 },
      ];
      
      const monthly = Array.from({ length: 30 }, (_, i) => ({
        x: `Day ${i + 1}`,
        y: Math.floor(Math.random() * 100) + 20,
      }));
      
      const yearly = Array.from({ length: 12 }, (_, i) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return {
          x: months[i],
          y: Math.floor(Math.random() * 500) + 200,
        };
      });
      
      return { weekly, monthly, yearly };
    };
    
    // Sample orders data for the area chart
    const generateOrdersData = () => {
      const weekly = [
        { x: 'Mon', y: 15 },
        { x: 'Tue', y: 21 },
        { x: 'Wed', y: 18 },
        { x: 'Thu', y: 25 },
        { x: 'Fri', y: 27 },
        { x: 'Sat', y: 43 },
        { x: 'Sun', y: 31 },
      ];
      
      const monthly = Array.from({ length: 30 }, (_, i) => ({
        x: `Day ${i + 1}`,
        y: Math.floor(Math.random() * 50) + 10,
      }));
      
      const yearly = Array.from({ length: 12 }, (_, i) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return {
          x: months[i],
          y: Math.floor(Math.random() * 300) + 100,
        };
      });
      
      return { weekly, monthly, yearly };
    };
    
    // Sample data for the pie chart (product categories)
    const generateCategoryData = () => {
      return [
        { name: 'Electronics', value: 44 },
        { name: 'Clothing', value: 55 },
        { name: 'Home & Kitchen', value: 41 },
        { name: 'Books', value: 17 },
        { name: 'Toys', value: 15 }
      ];
    };
    
    const salesDataSets = generateSalesData();
    const ordersDataSets = generateOrdersData();
    
    setSalesData(salesDataSets);
    setOrdersData(ordersDataSets);
    setCategoryData(generateCategoryData());
  }, []);
  
  // Chart options for the sales line chart
  const salesChartOptions = {
    chart: {
      type: 'line',
      height: 350,
      fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
      toolbar: {
        show: false
      },
      dropShadow: {
        enabled: true,
        top: 10,
        left: 0,
        blur: 3,
        opacity: 0.1,
        color: '#4261ee',
      },
    },
    colors: ['#4261ee'],
    stroke: {
      width: 5,
      curve: 'smooth'
    },
    xaxis: {
      categories: salesData[timeFilter]?.map(item => item.x) || [],
      labels: {
        style: {
          fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
        }
      }
    },
    yaxis: {
      title: {
        text: 'Sales ($)',
        style: {
          fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: '#4261ee',
            opacity: 0.8
          },
          {
            offset: 100,
            color: '#6c3df4',
            opacity: 0.2
          }
        ]
      }
    },
    markers: {
      size: 5,
      colors: ["#FFF"],
      strokeColors: "#4261ee",
      strokeWidth: 3,
    },
    grid: {
      borderColor: 'rgba(0, 0, 0, 0.05)',
      row: {
        colors: ['transparent', 'transparent'],
        opacity: 0.5
      },
    },
    tooltip: {
      theme: 'light',
      x: {
        show: true,
      },
      y: {
        title: {
          formatter: () => 'Sales:',
        },
        formatter: (value) => `$${value}`,
      },
    }
  };

  // Chart options for the orders area chart
  const ordersChartOptions = {
    chart: {
      type: 'area',
      height: 350,
      fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
      toolbar: {
        show: false
      },
      dropShadow: {
        enabled: true,
        top: 10,
        left: 0,
        blur: 3,
        opacity: 0.1,
        color: '#36d1bc',
      },
    },
    colors: ['#36d1bc'],
    stroke: {
      width: 3,
      curve: 'smooth'
    },
    xaxis: {
      categories: ordersData[timeFilter]?.map(item => item.x) || [],
      labels: {
        style: {
          fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
        }
      }
    },
    yaxis: {
      title: {
        text: 'Orders',
        style: {
          fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: '#36d1bc',
            opacity: 0.8
          },
          {
            offset: 100,
            color: '#00d4ff',
            opacity: 0.2
          }
        ]
      }
    },
    markers: {
      size: 4,
      colors: ["#FFF"],
      strokeColors: "#36d1bc",
      strokeWidth: 3,
    },
    grid: {
      borderColor: 'rgba(0, 0, 0, 0.05)',
      row: {
        colors: ['transparent', 'transparent'],
        opacity: 0.5
      },
    },
    tooltip: {
      theme: 'light',
      x: {
        show: true,
      },
      y: {
        title: {
          formatter: () => 'Orders:',
        },
      },
    }
  };

  // Chart options for the category pie chart
  const categoryChartOptions = {
    chart: {
      type: 'donut',
      height: 350,
      fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
    },
    colors: ['#4261ee', '#f33f82', '#36d1bc', '#ff8a47', '#6c3df4'],
    labels: categoryData.map(item => item.name),
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          background: 'transparent',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '22px',
              fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
              fontWeight: 600,
              color: undefined,
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: '16px',
              fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
              fontWeight: 400,
              color: undefined,
              offsetY: 16,
              formatter: (val) => `${val}%`
            },
            total: {
              show: true,
              showAlways: false,
              label: 'Total',
              fontSize: '22px',
              fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
              fontWeight: 600,
              color: '#373d3f',
              formatter: (w) => {
                return w.globals.seriesTotals
                  .reduce((a, b) => a + b, 0);
              }
            }
          }
        }
      }
    },
    stroke: {
      width: 2,
      colors: ['transparent']
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
      fontSize: '14px',
      labels: {
        colors: 'var(--text-secondary)',
      },
      markers: {
        width: 12,
        height: 12,
        strokeWidth: 0,
        radius: 12,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 8
      }
    },
    dataLabels: {
      enabled: false
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          height: 300
        },
        legend: {
          position: 'bottom'
        }
      }
    }],
    tooltip: {
      style: {
        fontSize: '14px',
        fontFamily: 'Plus Jakarta Sans, Inter, sans-serif',
      },
      y: {
        formatter: (val) => `${val}%`
      }
    }
  };

  // Chart series for all charts
  const salesChartSeries = [
    {
      name: "Sales",
      data: salesData[timeFilter]?.map(item => item.y) || []
    }
  ];

  const ordersChartSeries = [
    {
      name: "Orders",
      data: ordersData[timeFilter]?.map(item => item.y) || []
    }
  ];

  const categoryChartSeries = categoryData.map(item => item.value);

  // Handler for time filter
  const handleTimeFilter = (filter) => {
    setTimeFilter(filter);
  };

  return (
    <div className="content"> 
      <div className="admin-dashboard">
        <header className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {currentUser?.username}</span>
            <button onClick={logout}>Logout</button>
          </div>
        </header>
        
        {/* Stats Section */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fa fa-shopping-cart"></i>
            </div>
            <div className="stat-info">
              <h4>4,385</h4>
              <p>Total Sales</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fa fa-users"></i>
            </div>
            <div className="stat-info">
              <h4>1,249</h4>
              <p>Active Customers</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fa fa-box"></i>
            </div>
            <div className="stat-info">
              <h4>286</h4>
              <p>Products</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fa fa-money-bill"></i>
            </div>
            <div className="stat-info">
              <h4>$38,291</h4>
              <p>Total Revenue</p>
            </div>
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="charts-grid">
          <div className="chart-container">
            <div className="chart-header">
              <h2 className="chart-title">Sales Overview</h2>
              <div className="chart-filters">
                <button 
                  className={`chart-filter-btn ${timeFilter === 'weekly' ? 'active' : ''}`}
                  onClick={() => handleTimeFilter('weekly')}
                >
                  Weekly
                </button>
                <button 
                  className={`chart-filter-btn ${timeFilter === 'monthly' ? 'active' : ''}`}
                  onClick={() => handleTimeFilter('monthly')}
                >
                  Monthly
                </button>
                <button 
                  className={`chart-filter-btn ${timeFilter === 'yearly' ? 'active' : ''}`}
                  onClick={() => handleTimeFilter('yearly')}
                >
                  Yearly
                </button>
              </div>
            </div>
            <ReactApexChart 
              options={salesChartOptions} 
              series={salesChartSeries} 
              type="line" 
              height={350} 
            />
          </div>
          
          <div className="chart-container">
            <div className="chart-header">
              <h2 className="chart-title">Orders Trend</h2>
              <div className="chart-filters">
                <button 
                  className={`chart-filter-btn ${timeFilter === 'weekly' ? 'active' : ''}`}
                  onClick={() => handleTimeFilter('weekly')}
                >
                  Weekly
                </button>
                <button 
                  className={`chart-filter-btn ${timeFilter === 'monthly' ? 'active' : ''}`}
                  onClick={() => handleTimeFilter('monthly')}
                >
                  Monthly
                </button>
                <button 
                  className={`chart-filter-btn ${timeFilter === 'yearly' ? 'active' : ''}`}
                  onClick={() => handleTimeFilter('yearly')}
                >
                  Yearly
                </button>
              </div>
            </div>
            <ReactApexChart 
              options={ordersChartOptions} 
              series={ordersChartSeries} 
              type="area" 
              height={350} 
            />
          </div>
        </div>
        
        <div className="chart-container">
          <div className="chart-header">
            <h2 className="chart-title">Product Categories</h2>
          </div>
          <ReactApexChart 
            options={categoryChartOptions} 
            series={categoryChartSeries} 
            type="donut" 
            height={350} 
          />
        </div>
        
        {/* Menu Cards Section */}
        <div className="admin-menu">
          <div className="menu-card">
            <h3>Products</h3>
            <p>Manage your store's products</p>
            <Link to="/admin/products">View Products</Link>
            <Link to="/admin/products/add">Add New Product</Link>
          </div>
          
          <div className="menu-card">
            <h3>Orders</h3>
            <p>Manage customer orders</p>
            <Link to="/admin/orders">View Orders</Link>
            
          </div>
          
          <div className="menu-card">
            <h3>Collections</h3>
            <p>Manage product collections</p>
            <Link to="/admin/collections">View Collections</Link>
            <Link to="/admin/collections/add">Add New Collection</Link>
          </div>
          
          <div className="menu-card">
            <h3>Users</h3>
            <p>Manage user accounts</p>
            <Link to="/admin/users">View Users</Link>
            <Link to="/admin/users/add">Add Admin User</Link>
          </div>
          
          <div className="menu-card">
            <h3>Spinner Rewards</h3>
            <p>Manage spinner rewards</p>
            <Link to="/admin/spinner-rewards">View Rewards</Link>
            <Link to="/admin/spinner-rewards/add">Add New Reward</Link>
          </div>
        </div>
      </div>
    </div> 
  );
};

export default AdminDashboard;