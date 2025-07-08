// components/slider.jsx
import {  useEffect, useRef } from 'react';
import '../styles/Home.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);


const Slider = () => {
    const heroSectionRef = useRef(null);

  
  // Hero section animations
  useEffect(() => {
    const heroSection = heroSectionRef.current;
    if (!heroSection) return;

    // Glitch effect
    const glitchEffect = heroSection.querySelector('#glitchEffect');
    if (glitchEffect) {
      const glitchTimeline = gsap.timeline({ repeat: -1, repeatDelay: 5 });

      glitchTimeline.to(glitchEffect, {
        opacity: 0.8,
        duration: 0.1,
        ease: "none"
      })
        .to(glitchEffect, {
          opacity: 0,
          duration: 0.1,
          ease: "none"
        })
        .to(glitchEffect, {
          opacity: 0.8,
          duration: 0.05,
          ease: "none"
        })
        .to(glitchEffect, {
          opacity: 0,
          duration: 0.05,
          ease: "none"
        });
    }

    // Animated brand name
    const brandName = heroSection.querySelector('.brand-name');
    const brandNameOverlay = heroSection.querySelector('.brand-name-overlay');

    if (brandName && brandNameOverlay) {
      gsap.fromTo(
        brandName,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 1.5, ease: "power3.out" }
      );

      // Create glitch effect for text overlay
      gsap.timeline({ repeat: -1, repeatDelay: 3 })
        .to(brandNameOverlay, {
          skewX: 20,
          duration: 0.1,
          ease: "power4.inOut"
        })
        .to(brandNameOverlay, {
          skewX: 0,
          duration: 0.1,
          ease: "power4.inOut"
        })
        .to(brandNameOverlay, {
          opacity: 0.8,
          duration: 0.1,
          ease: "none"
        })
        .to(brandNameOverlay, {
          opacity: 1,
          duration: 0.1,
          ease: "none"
        });
    }

    // Tagline animation
    const tagline = heroSection.querySelector('.tagline');
    if (tagline) {
      gsap.fromTo(
        tagline,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.5, ease: "power2.out" }
      );
    }

    // Button animation
    const ctaButton = heroSection.querySelector('.cta-button');
    if (ctaButton) {
      gsap.fromTo(
        ctaButton,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.8, ease: "back.out(1.7)" }
      );

      // Add hover effect
      ctaButton.addEventListener('mouseenter', () => {
        gsap.to(ctaButton, {
          scale: 1.05,
          backgroundColor: '#ff3e00',
          duration: 0.3
        });
      });

      ctaButton.addEventListener('mouseleave', () => {
        gsap.to(ctaButton, {
          scale: 1,
          backgroundColor: '',
          duration: 0.3
        });
      });
    }

    // Feature cards animation
    const featureCards = heroSection.querySelectorAll('.feature-card');
    gsap.fromTo(
      featureCards,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.2,
        duration: 1,
        delay: 1,
        ease: "power3.out"
      }
    );

    // Add hover effects to feature cards
    featureCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -10,
          boxShadow: '0 20px 30px rgba(0, 0, 0, 0.25)',
          duration: 0.3
        });

        // Animate icon
        gsap.to(card.querySelector('.card-icon svg'), {
          scale: 1.2,
          fill: '#ff3e00',
          duration: 0.3
        });

        // Animate flow line
        gsap.to(card.querySelector('.flow-line'), {
          width: '100%',
          duration: 0.5
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
          duration: 0.3
        });

        // Reset icon
        gsap.to(card.querySelector('.card-icon svg'), {
          scale: 1,
          fill: '',
          duration: 0.3
        });

        // Reset flow line
        gsap.to(card.querySelector('.flow-line'), {
          width: '30%',
          duration: 0.5
        });
      });
    });

    // Floating shapes animation
    const floatingShapes = heroSection.querySelector('#floatingShapes');
    if (floatingShapes) {
      // Create floating shapes dynamically
      for (let i = 0; i < 10; i++) {
        const shape = document.createElement('div');
        shape.className = 'floating-shape';
        shape.style.left = `${Math.random() * 100}%`;
        shape.style.top = `${Math.random() * 100}%`;
        shape.style.width = `${20 + Math.random() * 30}px`;
        shape.style.height = shape.style.width;
        shape.style.opacity = `${0.1 + Math.random() * 0.3}`;
        floatingShapes.appendChild(shape);

        // Animate each shape randomly
        gsap.to(shape, {
          x: `${-50 + Math.random() * 100}px`,
          y: `${-50 + Math.random() * 100}px`,
          rotation: Math.random() * 360,
          duration: 5 + Math.random() * 10,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }
    }

    // Parallax background effect
    const parallaxBg = heroSection.querySelector('#parallaxBg');
    if (parallaxBg) {
      window.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth / 2 - e.clientX) / 30;
        const y = (window.innerHeight / 2 - e.clientY) / 30;

        gsap.to(parallaxBg, {
          x: x,
          y: y,
          duration: 1,
          ease: "power1.out"
        });
      });
    }

    // Moving stripes animation
    const movingStripes = heroSection.querySelector('#movingStripes');
    if (movingStripes) {
      // Create stripes dynamically
      for (let i = 0; i < 5; i++) {
        const stripe = document.createElement('div');
        stripe.className = 'stripe';
        stripe.style.top = `${i * 20}%`;
        movingStripes.appendChild(stripe);

        // Animate each stripe
        gsap.fromTo(
          stripe,
          { x: '-100%' },
          {
            x: '100%',
            duration: 15 + i * 5,
            repeat: -1,
            ease: "none"
          }
        );
      }
    }
  }, []);
  
  return (
    <div>
        <section className="hero" ref={heroSectionRef}>
            <div className="glitch-container">
            <div className="glitch-bg"></div>
            <div className="glitch-effect" id="glitchEffect"></div>
            </div>
            
            <div className="moving-stripes" id="movingStripes"></div>
            <div className="floating-shapes" id="floatingShapes"></div>
            <div className="parallax-bg" id="parallaxBg"></div>
            
            <div className="hero-content">
            <h1 className="brand-name">
                ECLIPSE
                <span className="brand-name-overlay">ECLIPSE</span>
            </h1>
            <p className="tagline">REDEFINING THE BOUNDARIES OF FASHION</p>
            <button className="cta-button">EXPLORE NOW</button>
            </div>
            
            <div className="feature-cards">
            <div className="feature-card">
                <div className="card-icon">
                <svg viewBox="0 0 24 24">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                </div>
                <h3 className="card-title">Crafted</h3>
                <p className="card-description">Handmade with passion and precision</p>
                <div className="flow-line"></div>
            </div>
            
            <div className="feature-card">
                <div className="card-icon">
                <svg viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                </div>
                <h3 className="card-title">Premium</h3>
                <p className="card-description">Finest materials from around the world</p>
                <div className="flow-line"></div>
            </div>
            
            <div className="feature-card">
                <div className="card-icon">
                <svg viewBox="0 0 24 24">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                </div>
                <h3 className="card-title">Trending</h3>
                <p className="card-description">Always ahead of fashion curves</p>
                <div className="flow-line"></div>
            </div>
            
            <div className="feature-card">
                <div className="card-icon">
                <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="4"></circle>
                    <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                    <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
                    <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
                    <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
                </svg>
                </div>
                <h3 className="card-title">Unique</h3>
                <p className="card-description">Limited editions that stand out</p>
                <div className="flow-line"></div>
            </div>
            </div>
        </section>
    </div>
  );
};

export default Slider;