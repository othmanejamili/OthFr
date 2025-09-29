import React, {  useEffect, useRef, useState } from "react";
import '../../styles/Home.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ClothingHero from "./slidef";
import { Link } from 'react-router-dom';
import axios from "axios";
import FeaturesSection from "./FeaturesSection";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const Home = () => {

//this's about fetch product for show it in the page
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null) 

  const fetchProduct = () => { 
      axios.get(`https://othy.pythonanywhere.com/api/products/`)
      .then(response => {
        setProduct(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(true);
      });
  };

  useEffect(()=>{
    fetchProduct();
  },[])


  const getProductImageUrl = (product) => {
    if (product.image_list && product.image_list.length > 0) {
      return product.image_list[0].image;
    }
    else if (product.image) {
      return product.image;
    }
    else {
      return "https://via.placeholder.com/300x400?text=No+Image";
    }
  };

  // 
  const productCardsRef = useRef([]);

  const cursorRef = useRef(null);
  const collectionsSectionRef = useRef(null);
  const uniqueSectionRef = useRef(null);
  const carouselRef = useRef(null);

  // Custom cursor effect
  useEffect(() => {
    const customCursor = cursorRef.current;
    if (!customCursor) return;

    const moveCursor = (e) => {
      gsap.to(customCursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.2,
        ease: "power2.out"
      });
    };

    // Show cursor on mouse enter, hide on leave
    const showCursor = () => {
      gsap.to(customCursor, { scale: 1, opacity: 1, duration: 0.3 });
    };

    const hideCursor = () => {
      gsap.to(customCursor, { scale: 0, opacity: 0, duration: 0.3 });
    };

    // Add interactive elements cursor effect
    const handleInteractiveElements = () => {
      const interactiveElements = document.querySelectorAll('a, button, .card, .collection-card, .product-card');

      interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
          gsap.to(customCursor, {
            scale: 1.5,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid white',
            duration: 0.3
          });
        });

        el.addEventListener('mouseleave', () => {
          gsap.to(customCursor, {
            scale: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            duration: 0.3
          });
        });
      });
    };

    document.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseenter', showCursor);
    document.addEventListener('mouseleave', hideCursor);

    handleInteractiveElements();

    return () => {
      document.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseenter', showCursor);
      document.removeEventListener('mouseleave', hideCursor);
    };
  }, []);

 





  // Collections section animations
  useEffect(() => {
    const collectionsSection = collectionsSectionRef.current;
    if (!collectionsSection) return;

    // Title animation
    gsap.fromTo(
      collectionsSection.querySelector('.section-title'),
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        scrollTrigger: {
          trigger: collectionsSection,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    );

    // Cards animation with stagger
    gsap.fromTo(
      collectionsSection.querySelectorAll('.collection-card'),
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.2,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: collectionsSection,
          start: "top 70%",
          toggleActions: "play none none none"
        }
      }
    );

    // Add hover effects for collection cards
    collectionsSection.querySelectorAll('.collection-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -10,
          boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
          duration: 0.3
        });

        // Scale up image
        gsap.to(card.querySelector('img'), { scale: 1.1, duration: 0.5 });

        // Highlight tag
        gsap.to(card.querySelector('.collection-tag'), {
          backgroundColor: '#ff4500',
          scale: 1.1,
          duration: 0.3
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
          duration: 0.3
        });

        // Reset image
        gsap.to(card.querySelector('img'), { scale: 1, duration: 0.5 });

        // Reset tag
        gsap.to(card.querySelector('.collection-tag'), {
          backgroundColor: '',
          scale: 1,
          duration: 0.3
        });
      });
    });
  }, []);

  // Unique section animations
  useEffect(() => {
    const uniqueSection = uniqueSectionRef.current;
    if (!uniqueSection) return;

    // Title animation
    gsap.fromTo(
      uniqueSection.querySelector('.section-text1'),
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        scrollTrigger: {
          trigger: uniqueSection,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    );

    // Cards staggered animation
    gsap.fromTo(
      uniqueSection.querySelectorAll('.card'),
      { y: 80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: uniqueSection,
          start: "top 70%",
          toggleActions: "play none none none"
        }
      }
    );

    // Add floating animation to card icons
    uniqueSection.querySelectorAll('.card-icon').forEach(icon => {
      gsap.to(icon, {
        y: -10,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    });
  }, []);



  // Product carousel animations
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    // Header animation
    gsap.fromTo(
      '.collection-header',
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        scrollTrigger: {
          trigger: carousel,
          start: "top 80%",
          toggleActions: "play none none none"
        }
      }
    );

    // Product cards animation with enhanced effects
    gsap.fromTo(
      carousel.querySelectorAll('.product-card'),
      { opacity: 0, scale: 0.8, y: 30 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: carousel,
          start: "top 70%",
          toggleActions: "play none none none"
        }
      }
    );

    // Add hover effects to product cards
    carousel.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -15,
          boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)',
          duration: 0.3
        });

        // Scale up image and add brightness
        gsap.to(card.querySelector('img'), {
          scale: 1.1,
          filter: 'brightness(1.1)',
          duration: 0.5
        });

        // Move up product info
        gsap.to(card.querySelector('.product-info'), {
          y: -10,
          duration: 0.3
        });

        // Animate add to cart button if exists
        const button = card.querySelector('.add-to-cart');
        if (button) {
          gsap.to(button, {
            backgroundColor: '#ff4500',
            scale: 1.05,
            duration: 0.3
          });
        }

        // Animate price with highlight effect
        const price = card.querySelector('.product-price');
        if (price) {
          gsap.to(price, {
            color: '#ff4500',
            fontWeight: 'bold',
            duration: 0.3
          });
        }
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
          duration: 0.3
        });

        // Reset image
        gsap.to(card.querySelector('img'), {
          scale: 1,
          filter: 'brightness(1)',
          duration: 0.5
        });

        // Reset product info
        gsap.to(card.querySelector('.product-info'), {
          y: 0,
          duration: 0.3
        });

        // Reset button if exists
        const button = card.querySelector('.add-to-cart');
        if (button) {
          gsap.to(button, {
            backgroundColor: '',
            scale: 1,
            duration: 0.3
          });
        }

        // Reset price
        const price = card.querySelector('.product-price');
        if (price) {
          gsap.to(price, {
            color: '',
            fontWeight: '',
            duration: 0.3
          });
        }
      });
    });

    // Adding subtle animation to continually draw attention to products
    carousel.querySelectorAll('.product-card').forEach((card, index) => {
      // Create subtle breathing animation on each card with different delays
      gsap.to(card, {
        y: -5,
        duration: 2,
        delay: index * 0.3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Subtle pulse animation on the add to cart button
      const button = card.querySelector('.add-to-cart');
      if (button) {
        gsap.to(button, {
          scale: 1.03,
          duration: 1.5,
          delay: index * 0.3 + 0.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      }
    });

  }, []);



  // Main component returned here with refs attached
  return (
    <>
    <ClothingHero />



      <section className="product-carousel" ref={carouselRef}>
        <div className="collection-header">
          <h2>Our most popular items</h2>
        </div>

        <div className="collection-carousel">
        {product.length > 0 ? (
          product.map((product, index) => (
            <Link to="/product" className="product-link">
            <div
            key={product.id}
            className="product-card"
            data-product-id = {product.id}
            ref={el => productCardsRef.current[index] = el}
            >
                <img src={getProductImageUrl(product)}
                alt={product.name}
                className="product-image" 
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x400?text=Image+Error";
                }}/>
                
                <div className="prduct-info">
                  <p className="product-title">{product.name}</p>
                  <p className="product-price">DHD{product.price}</p>
                </div>
              
            </div>
            </Link>
          ))
        ) : (
          <div className="no-products-message">
          <p>No products found matching your filters.</p>
        </div>
        )}
        </div>
      </section>






      
      <section className="unique-section">
        <h2 className="section-text1">What Makes Us Unique</h2>
        <div className="collection-carousel1">
          <div className="card">
            <div className="card-icon">OJ</div>
            <h3>System Points</h3>
            <p>When you create an account here, you earn points for every order you place.
              You can also use these points to place orders instead of money once you've accumulated enough.
            </p>
          </div>
          <div className="card">
            <div className="card-icon">OJ</div>
            <h3>First Order</h3>
            <p>When you create an account here, you get a 20% discount on your first order.</p>
          </div>
          <div className="card animate__animated animate__fadeInUp animate__delay-2s">
            <div className="card-icon">OJ</div>
            <h3>Spinner by Points</h3>
            <p>When you earn enough points, you can spin the wheel to win a gift from the system, such as a shirt, T-shirt, or cologne.</p>
          </div>
          <div className="card animate__animated animate__fadeInUp animate__delay-3s">
            <div className="card-icon">OJ</div>
            <h3>Try Outfit</h3>
            <p>When you create an account, you can use the 'Try Outfit' option to preview how different items like caps, T-shirts, shorts, and shoes look on you</p>
          </div>
          <div className="card animate__animated animate__fadeInUp animate__delay-4s">
            <div className="card-icon">OJ</div>
            <h3>Free Delivery</h3>
            <p>Get free delivery on all orders over 400 DH. No extra fees—just shop, order, and enjoy fast delivery to your doorstep!</p>
          </div>
          <div className="card animate__animated animate__fadeInUp animate__delay-4s">
            <div className="card-icon">OJ</div>
            <h3>helped system</h3>
            <p>We created a system to help you find the best clothes you like. All you need to do is answer a few questions to filter your choices, and you'll see only the clothes that suit your preferences.</p>
          </div>
        </div>
      </section>



      <div className="main-wrapper1" ref={carouselRef}>
          <div className="content-layout"> 
            {/* Text Section */}
            <div className="text-section">
              <h1 className="primary-title1">PURE MOTION</h1>
              <p className="description-text1">
                Pure performance. Pure comfort. Pure Motion.
              </p>
              <Link to="/product">
                <button className="action-btn">Shop now</button>
              </Link>
            </div>

            {/* Image Section */}

          </div>
        </div>

        <FeaturesSection />

        <section className="product-carousel" ref={carouselRef}>
        <div className="collection-header">
          <h2>Our most popular items</h2>
        </div>

        <div className="collection-carousel">
        {product.length > 0 ? (
          product.map((product, index) => (
            <Link to="/product" className="product-link">
            <div
            key={product.id}
            className="product-card"
            data-product-id = {product.id}
            ref={el => productCardsRef.current[index] = el}
            >
                <img src={getProductImageUrl(product)}
                alt={product.name}
                className="product-image" 
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300x400?text=Image+Error";
                }}/>
                
                <div className="prduct-info">
                  <p className="product-title">{product.name}</p>
                  <p className="product-price">DHD{product.price}</p>
                </div>
              
            </div>
            </Link>
          ))
        ) : (
          <div className="no-products-message">
          <p>No products found matching your filters.</p>
        </div>
        )}
        </div>
      </section>
    </>
  )
}
export default Home;