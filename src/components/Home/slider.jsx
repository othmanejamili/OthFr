// components/slider.jsx
import React, { useEffect, useRef } from "react";
import gsap from 'gsap';
import '../../styles/Home.css';
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);


const Slider = () => {

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
    <div className="main-wrapper1" ref={mainContainerRef}>
    <div className="content-layout"> 
      {/* Text Section */}
      <div className="text-section" ref={contentAreaRef}>
        <h1 className="primary-title">PURE MOTION</h1>
        <p className="description-text">
          Pure performance. Pure comfort. Pure Motion.
        </p>

        <div className="decorative-star star-one">✦</div>
        <div className="decorative-star star-two">✦</div>

        <Link to="/product">
          <button className="action-btn">Shop now</button>
        </Link>
      </div>

      {/* Image Section */}
      <div className="image-section2" ref={imageAreaRef}>
        <div className="photo-container">
          <img 
            src="https://res.cloudinary.com/dsfgsdjgz/image/upload/v1758818878/Photoroom_20250925_174706_bjmej2.png" 
            alt="Fashion Models" 
            className="hero-photo"
          />
        </div>
      </div>
    </div>
  </div>

  );
};

export default Slider;