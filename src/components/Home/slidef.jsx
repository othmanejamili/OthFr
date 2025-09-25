import React, { useEffect, useRef } from "react";
import gsap from 'gsap';
import '../../styles/slider.css';
import { Link } from "react-router-dom";

const ClothingHero = () => {
  const mainContainerRef = useRef(null);
  const contentAreaRef = useRef(null);
  const metricsRef = useRef(null);
  const imageAreaRef = useRef(null);
  const logosRef = useRef(null);

  useEffect(() => {
    const timeline = gsap.timeline();
    
    // Animate main title
    timeline.fromTo(contentAreaRef.current?.querySelector('.primary-title'), 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
    )
    // Animate description
    .fromTo(contentAreaRef.current?.querySelector('.description-text'), 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
      '-=0.5'
    )
    // Animate action button
    .fromTo(contentAreaRef.current?.querySelector('.action-btn'), 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
      '-=0.3'
    )
    // Animate metrics
    .fromTo(metricsRef.current?.querySelectorAll('.metric-box'), 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
      '-=0.2'
    )
    // Animate image
    .fromTo(imageAreaRef.current, 
      { x: 50, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: 'power3.out' },
      '-=0.8'
    )
    // Animate brand logos
    .fromTo(logosRef.current?.querySelectorAll('.company-logo'), 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' },
      '-=0.3'
    );

    // Add decorative element animation
    const decorativeElements = document.querySelectorAll('.decorative-star');
    decorativeElements.forEach((element, index) => {
      gsap.to(element, {
        rotation: 360,
        duration: 3 + index,
        repeat: -1,
        ease: 'none'
      });
    });
  }, []);

  return (
    <div className="main-wrapper" ref={mainContainerRef}>
      <div className="content-layout">
        <div className="text-section" ref={contentAreaRef}>
          <h1 className="primary-title">
            FIND CLOTHES<br />
            THAT MATCHES<br />
            YOUR STYLE
          </h1>
          
          <div className="decorative-star star-one">✦</div>
          <div className="decorative-star star-two">✦</div>
          
          <p className="description-text">
            Browse through our diverse range of meticulously crafted garments, designed<br />
            to bring out your individuality and cater to your sense of style.
          </p>
          
          <button className="action-btn">
            <Link to="/product" className="action-btn">
              Shop Now
              </Link>
          </button>
         
          <div className="metrics-wrapper" ref={metricsRef}>
            <div className="metric-box">
              <span className="metric-value">200+</span>
              <span className="metric-title">International Brands</span>
            </div>
            <div className="metric-separator"></div>
            <div className="metric-box">
              <span className="metric-value">2,000+</span>
              <span className="metric-title">High-Quality Products</span>
            </div>
            <div className="metric-separator"></div>
            <div className="metric-box">
              <span className="metric-value">30,000+</span>
              <span className="metric-title">Happy Customers</span>
            </div>
          </div>
        </div>
        
        <div className="image-section2" ref={imageAreaRef}>
          <div className="photo-container">
            <img 
              src="https://res.cloudinary.com/dsfgsdjgz/image/upload/v1758734137/Photoroom_20250924_173921_iwnx4a.png" 
              alt="Fashion Models" 
              className="hero-photo"
            />
          </div>
        </div>
      </div>
      
      <div className="brands-area" ref={logosRef}>
        <div className="company-logo">VERSACE</div>
        <div className="company-logo">ZARA</div>
        <div className="company-logo">GUCCI</div>
        <div className="company-logo">PRADA</div>
        <div className="company-logo">Calvin Klein</div>
      </div>
    </div>
  );
};

export default ClothingHero;