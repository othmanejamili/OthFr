import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import gsap from "gsap";
import '../../styles/Navbar.css';
import { ShoppingBag } from 'lucide-react';

const NavBar = () => {
  const navbarRef = useRef(null);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

  // Simple toggle menu function
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
    
    // Initial check
    handleResize();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // GSAP animations for navbar elements
  useEffect(() => {
    const navbar = navbarRef.current;
    if (!navbar) return;
    
    // Logo animation
    gsap.fromTo(
      navbar.querySelector('.logo'),
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: 'back.out(1.7)' }
    );
    
    // Nav links animation
    gsap.fromTo(
      navbar.querySelectorAll('.nav-links a'),
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out', delay: 0.3 }
    );
    
    // Add hover animation for nav links on desktop
    if (window.innerWidth >= 768) {
      const links = navbar.querySelectorAll('.nav-links a');
      
      links.forEach(link => {
        link.addEventListener('mouseenter', () => {
          gsap.to(link, { y: -5, duration: 0.2, ease: 'power1.out' });
        });
        
        link.addEventListener('mouseleave', () => {
          gsap.to(link, { y: 0, duration: 0.2, ease: 'power1.out' });
        });
      });
      
      return () => {
        links.forEach(link => {
          link.removeEventListener('mouseenter', () => {});
          link.removeEventListener('mouseleave', () => {});
        });
      };
    }
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  
  // Helper function to determine if link should be active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };
  
  // Render nav links with proper structure
  const renderNavLinks = () => {
    const links = [
      { href: "/", label: "Home" },
      { href: "/product", label: "Product" },
      { href: "/collection", label: "collections" },
      { href: "/gifts", label: "gifts" },
      { href: "/spinner", label: "spinner" },
      { href: "/login", label: "Login" },
      { 
        href: "/cart", 
        label:  <ShoppingBag />

      }
    ];

    return links.map((link, index) => (
      <a 
        key={index} 
        href={link.href} 
        className={isActive(link.href) ? 'active' : ''}
        onClick={() => setMenuOpen(false)}
        style={{ '--i': index + 1 }}
      >
        {link.label}
      </a>
    ));
  };
  
  return (
    <>
      {/* Overlay for mobile menu */}
      {isMobile && menuOpen && (
        <div 
          className="menu-overlay active" 
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
      
      <div className={`Navbar ${scrolled ? 'scrolled' : ''}`} ref={navbarRef}>
        <div className="logo">
          <Link to={'/'}><img src='/images/logo.png' alt="Logo" /></Link>
        </div>
        
        {/* Hamburger Menu Toggle Button */}
        {isMobile && (
          <div 
            className={`menu-toggle ${menuOpen ? 'active' : ''}`} 
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        
        <nav className={`nav-links ${menuOpen ? 'active' : ''}`}>
          {renderNavLinks()}
        </nav>
      </div>
    </>
  );
};

export default NavBar;