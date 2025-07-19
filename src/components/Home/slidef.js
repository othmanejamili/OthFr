import React, { useEffect, useRef, useState } from "react";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../../styles/slidef.css';

gsap.registerPlugin(ScrollTrigger);

const EnhancedSlider = () => {
  const sliderRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  
  const slides = [
    {
      id: 1,
      image: "../../../build/images/slide1.png",
      text: "Crafted with care, made for the rare."
    },
    {
      id: 2,
      image: "../../../build/images/slide2.png",
      text: "Elevate your style with our exclusive collection."
    },
    {
      id: 3,
      image: "../../../build/images/slide3.png",
      text: "Designed for comfort, crafted for expression."
    }
  ];

  // Initialize slider and set up auto-rotation
  useEffect(() => {
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
  }, []);
  
  // Update slide whenever currentSlide changes
  useEffect(() => {
    goToSlide(currentSlide);
  }, [currentSlide]);

  const goToSlide = (index) => {
    // Safety check - ensure slider exists
    if (!sliderRef.current) return;
    
    const slideElements = sliderRef.current.querySelectorAll('.slide');
    
    // Safety check - ensure slides exist
    if (!slideElements || slideElements.length === 0) return;
    
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
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    
    if (touchStartX - touchEndX > 50) {
      // Swipe left, go next
      setCurrentSlide(prev => (prev + 1) % slides.length);
    } else if (touchEndX - touchStartX > 50) {
      // Swipe right, go prev
      setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1));
    }
  };

  // Handle pause on hover
  const handleMouseEnter = () => {
    // Could implement pause functionality here
  };

  const handleMouseLeave = () => {
    // Could implement resume functionality here
  };

  return (
    <div 
      className="slider-container" 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="slider" ref={sliderRef}>
        {slides.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`slide ${index === currentSlide ? 'active' : ''}`}
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