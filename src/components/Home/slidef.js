import React, { useEffect, useRef, useState } from "react";
import gsap from 'gsap';
import '../../styles/slidef.css';

// Remove ScrollTrigger import since it's not being used in this component
// gsap.registerPlugin(ScrollTrigger);

const EnhancedSlider = () => {
  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  const slides = [
    {
      id: 1,
      image: "https://res.cloudinary.com/dsfgsdjgz/image/upload/v1753458292/Photoroom_20250203_011430_e7wddp.png",
      text: "Crafted with care, made for the rare."
    },
    {
      id: 2,
      image: "https://res.cloudinary.com/dsfgsdjgz/image/upload/v1753458540/Photoroom_20250722_151619_d1v8el.png",
      text: "Elevate your style with our exclusive collection."
    },
    {
      id: 3,
      image: "https://res.cloudinary.com/dsfgsdjgz/image/upload/v1753458577/Photoroom_20250722_151545_rmaahv.png",
      text: "Designed for comfort, crafted for expression."
    }
  ];

  // Ensure component only runs client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize slider and set up auto-rotation
  useEffect(() => {
    if (!isClient) return;
    
    // Safety check - ensure slider exists
    if (!sliderRef.current) return;
    
    // Initialize first slide
    goToSlide(0);
    
    // Set up auto-rotation with interval
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [isClient]);
  
  // Update slide whenever currentSlide changes
  useEffect(() => {
    if (!isClient) return;
    goToSlide(currentSlide);
  }, [currentSlide, isClient]);

  const goToSlide = (index) => {
    // Safety check - ensure slider exists and we're on client
    if (!sliderRef.current || !isClient) return;
    
    const slideElements = sliderRef.current.querySelectorAll('.slide');
    
    // Safety check - ensure slides exist
    if (!slideElements || slideElements.length === 0) return;
    
    try {
      // Hide all slides with fade out
      gsap.to(slideElements, { 
        opacity: 0, 
        duration: 0.5, 
        ease: 'power2.inOut' 
      });

      // Show selected slide with fade in and scale effect
      gsap.fromTo(
        slideElements[index],
        { opacity: 0, scale: 1.05 },
        { 
          opacity: 1, 
          scale: 1, 
          duration: 0.8, 
          ease: 'power2.inOut', 
          delay: 0.3 
        }
      );

      // Safely animate text content
      const currentSlideElement = slideElements[index];
      if (currentSlideElement) {
        const slideContent = currentSlideElement.querySelector('.slide-text');
        if (slideContent) {
          gsap.fromTo(
            slideContent,
            { y: 30, opacity: 0 },
            { 
              y: 0, 
              opacity: 1, 
              duration: 1, 
              delay: 0.6, 
              ease: 'power3.out' 
            }
          );
        }
      }

      // Update active dot
      const dots = document.querySelectorAll('.dot');
      if (dots && dots.length) {
        dots.forEach((dot, i) => {
          if (i === index) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      }
    } catch (error) {
      console.error('GSAP animation error:', error);
      // Fallback without animations
      slideElements.forEach((slide, i) => {
        slide.style.opacity = i === index ? '1' : '0';
      });
    }
  };

  const handleTouchStart = (e) => {
    if (!isClient) return;
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!isClient) return;
    const touchEndX = e.changedTouches[0].clientX;
    
    if (touchStartX - touchEndX > 50) {
      // Swipe left, go next
      setCurrentSlide(prev => (prev + 1) % slides.length);
    } else if (touchEndX - touchStartX > 50) {
      // Swipe right, go prev
      setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
    }
  };

  // Don't render anything until we're on the client
  if (!isClient) {
    return <div className="slider-container loading">Loading...</div>;
  }

  return (
    <div 
      className="slider-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="slider" ref={sliderRef}>
        {slides.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ opacity: index === 0 ? 1 : 0 }}
          >
            <div className="image-section">
              <img src={slide.image} alt={`Slide ${index + 1}`} />
            </div>
            <div className="content-section">
              <div className="slide-text">{slide.text}</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Slider Navigation Buttons */}
      <div className="slider-nav">
        <button 
          className="prev-btn" 
          onClick={() => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))}
        >
          &#10094;
        </button>
        <button 
          className="next-btn" 
          onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
        >
          &#10095;
        </button>
      </div>
      
      {/* Navigation Dots */}
      <div className="navigation-dots">
        {slides.map((_, index) => (
          <div 
            key={index} 
            className={`dot ${index === currentSlide ? 'active' : ''}`} 
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default EnhancedSlider;