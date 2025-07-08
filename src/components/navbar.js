import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import '../styles/Navbar.css';

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
      { href: "/collections", label: "Collections" },
      { href: "/gifts", label: "Gifts" },
      { href: "/Spinner", label: "Spinner" },
      { href: "/login", label: "Login" },
      { 
        href: "/cart", 
        label:<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V16.5M9 19.5C9.8 19.5 10.5 20.2 10.5 21S9.8 22.5 9 22.5 7.5 21.8 7.5 21 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21S20.8 22.5 20 22.5 18.5 21.8 18.5 21 19.2 19.5 20 19.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
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
          <img src='/images/logo.png' alt="Logo" />
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