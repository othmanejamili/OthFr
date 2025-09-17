import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import gsap from "gsap";
import { Search, Heart, ShoppingBag } from 'lucide-react';
import '../../styles/Navbar.css';

const NavBar = () => {
  const navbarRef = useRef(null);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

  // Toggle menu function
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
      if (window.innerWidth > 767) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // GSAP animations
  useEffect(() => {
    const navbar = navbarRef.current;
    if (!navbar) return;
    
    // Logo animation
    gsap.fromTo(
      navbar.querySelector('.logo'),
      { x: -30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
    );
    
    // Nav links animation
    gsap.fromTo(
      navbar.querySelectorAll('.nav-links a'),
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.6, ease: 'power2.out', delay: 0.2 }
    );
    
    // Right section animation
    gsap.fromTo(
      navbar.querySelector('.nav-right'),
      { x: 30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out', delay: 0.3 }
    );
  }, []);
  
  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  
  // Check if link is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };
  
  // Navigation links
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/product", label: "Product" },
    { href: "/collection", label: "Collections" },
    { href: "/gifts", label: "Gifts" },
    { href: "/spinner", label: "Spinner" },
    { href: "/login", label: "Login" }
  ];

  return (
    <>
      {/* Mobile menu overlay */}
      {isMobile && menuOpen && (
        <div 
          className="menu-overlay active" 
          onClick={() => setMenuOpen(false)}
        />
      )}
      
      <div className={`Navbar ${scrolled ? 'scrolled' : ''}`} ref={navbarRef}>
        {/* Logo */}
        <div className="logo">
          <Link to="/">
            <img src="/logo.png" alt="Logo" />
          </Link>
        </div>
        
        {/* Navigation Links - Hidden on mobile */}
        <nav className={`nav-links ${menuOpen ? 'active' : ''}`}>
          {navLinks.map((link, index) => (
            <Link 
              key={index}
              to={link.href} 
              className={isActive(link.href) ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
              style={{ '--i': index + 1 }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        {/* Right section with search and icons */}
        <div className="nav-right">
          {/* Search - Hidden on mobile */}
          {!isMobile && (
            <div className="search-container">
              <Search size={16} color="#707072" />
              <input 
                type="text" 
                placeholder="Search" 
                aria-label="Search products"
              />
            </div>
          )}
          
          {/* Icons */}
          <button className="icon-button" aria-label="Wishlist">
            <Heart size={20} />
          </button>
          
          <Link to="/cart" className="icon-button" aria-label="Shopping cart">
            <ShoppingBag size={20} />
          </Link>
          
          {/* Mobile hamburger menu */}
          {isMobile && (
            <button 
              className={`menu-toggle ${menuOpen ? 'active' : ''}`} 
              onClick={toggleMenu}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default NavBar;