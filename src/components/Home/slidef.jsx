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
  const scrollingLogosRef = useRef(null);

  useEffect(() => {
    const timeline = gsap.timeline();
    
    // Animate main title with split text effect
    const title = contentAreaRef.current?.querySelector('.primary-title');
    if (title) {
      const words = title.textContent.split(' ');
      title.innerHTML = words.map(word => `<span class="word">${word}</span>`).join(' ');
      
      timeline.fromTo(title.querySelectorAll('.word'), 
        { y: 100, opacity: 0, rotationX: -90 },
        { 
          y: 0, 
          opacity: 1, 
          rotationX: 0,
          duration: 1, 
          stagger: 0.1,
          ease: 'back.out(1.7)' 
        }
      );
    }
    
    // Animate description with typewriter effect
    const description = contentAreaRef.current?.querySelector('.description-text');
    if (description) {
      timeline.fromTo(description, 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
        '-=0.5'
      );
    }
    
    // Animate action button with bounce effect
    timeline.fromTo(contentAreaRef.current?.querySelector('.action-btn'), 
      { scale: 0, rotation: -180 },
      { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' },
      '-=0.3'
    )
    
    // Animate metrics with stagger effect
    .fromTo(metricsRef.current?.querySelectorAll('.metric-box'), 
      { y: 50, opacity: 0, scale: 0.8 },
      { 
        y: 0, 
        opacity: 1, 
        scale: 1,
        duration: 0.8, 
        stagger: 0.2, 
        ease: 'back.out(1.7)' 
      },
      '-=0.4'
    )
    
    // Animate image with 3D effect
    .fromTo(imageAreaRef.current, 
      { x: 100, opacity: 0, rotationY: 45 },
      { x: 0, opacity: 1, rotationY: 0, duration: 1.2, ease: 'power3.out' },
      '-=1'
    );

    // Enhanced decorative stars animation
    const decorativeElements = document.querySelectorAll('.decorative-star');
    decorativeElements.forEach((element, index) => {
      gsap.to(element, {
        rotation: 360,
        scale: [1, 1.2, 1],
        duration: 4 + index * 0.5,
        repeat: -1,
        ease: 'none'
      });
      
      // Add floating effect
      gsap.to(element, {
        y: [-10, 10],
        duration: 2 + index * 0.3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });

    // Continuous scrolling animation for brand logos
    const setupScrollingLogos = () => {
      const logosContainer = scrollingLogosRef.current;
      if (!logosContainer) return;

      // Create infinite scrolling effect
      const logoElements = logosContainer.querySelectorAll('.companys-logo');
      const totalWidth = logosContainer.scrollWidth;
      
      gsap.set(logosContainer, { x: 0 });
      
      const scrollTween = gsap.to(logosContainer, {
        x: -totalWidth / 2,
        duration: 20,
        ease: 'none',
        repeat: -1
      });

      // Add individual logo animations
      logoElements.forEach((logo, index) => {
        // Entrance animation with delay
        gsap.fromTo(logo,
          { y: 50, opacity: 0, scale: 0 },
          { 
            y: 0, 
            opacity: 1, 
            scale: 1,
            duration: 0.6,
            delay: index * 0.2 + 2,
            ease: 'back.out(1.7)'
          }
        );

        // Hover effects
        logo.addEventListener('mouseenter', () => {
          gsap.to(logo, {
            scale: 1.2,
            color: '#ff4500',
            duration: 0.3,
            ease: 'power2.out'
          });
        });

        logo.addEventListener('mouseleave', () => {
          gsap.to(logo, {
            scale: 1,
            color: '#ffffff',
            duration: 0.3,
            ease: 'power2.out'
          });
        });
      });
    };

    // Setup scrolling after initial animations
    timeline.call(setupScrollingLogos, null, 2);

  }, []);

  // Enhanced button hover effect
  const handleButtonHover = (isEntering) => {
    const button = contentAreaRef.current?.querySelector('.action-btn');
    if (!button) return;

    if (isEntering) {
      gsap.to(button, {
        scale: 1.05,
        backgroundColor: '#ff4500',
        boxShadow: '0 10px 30px rgba(255, 69, 0, 0.4)',
        duration: 0.3,
        ease: 'power2.out'
      });
    } else {
      gsap.to(button, {
        scale: 1,
        backgroundColor: '#1a1a1a',
        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

  return (
    <div className="main-wrapper" ref={mainContainerRef}>
      <div className="content-layout">
        <div className="text-section" ref={contentAreaRef}>
          <h1 className="primary-title">
            FIND CLOTHES
            THAT MATCHES
            YOUR STYLE
          </h1>
          
          <div className="decorative-star star-one">✦</div>
          <div className="decorative-star star-two">✦</div>
          
          <p className="description-text">
            Browse through our diverse range of meticulously crafted garments, designed<br />
            to bring out your individuality and cater to your sense of style.
          </p>
          
          <Link to="/product" className="action-btn-link">
            <button 
              className="action-btn"
              onMouseEnter={() => handleButtonHover(true)}
              onMouseLeave={() => handleButtonHover(false)}
            >
              Shop Now
            </button>
          </Link>
         
        </div>
        

      </div>
      
      <div className="brands-area" ref={logosRef}>
        <div className="scrolling-logos-container" ref={scrollingLogosRef}>
          <div className="companys-logo">Venum</div>
          <div className="companys-logo">ZARA</div>
          <div className="companys-logo">GUCCI</div>
          <div className="companys-logo">PRADA</div>
          <div className="companys-logo">VERSACE</div>
          {/* Duplicate for seamless loop */}
          <div className="companys-logo">Venum</div>
          <div className="companys-logo">ZARA</div>
          <div className="companys-logo">GUCCI</div>
          <div className="companys-logo">PRADA</div>
          <div className="companys-logo">VERSACE</div>
        </div>
      </div>
      

    </div>
  );
};

export default ClothingHero;