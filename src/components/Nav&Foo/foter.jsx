import React,{ useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import '../../styles/Home.css';

const Footer = () => {
    const footerRef = useRef(null);

    useEffect(() => {
        const footer = footerRef.current;
        if (!footer) return;
    
        // Staggered animation for columns
        gsap.fromTo(
          footer.querySelectorAll('.footer-column'),
          { y: 50, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            stagger: 0.2, 
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: footer,
              start: "top 80%",
              toggleActions: "play none none none"
            }
          }
        );
        
        // Social icons animation
        gsap.fromTo(
          footer.querySelectorAll('.social-icon'),
          { scale: 0, opacity: 0 },
          { 
            scale: 1, 
            opacity: 1, 
            stagger: 0.1, 
            duration: 0.5,
            ease: 'back.out(1.7)',
            delay: 0.5,
            scrollTrigger: {
              trigger: footer,
              start: "top 85%",
              toggleActions: "play none none none"
            }
          }
        );
        
        // Copyright animation
        gsap.fromTo(
          footer.querySelector('.copyright'),
          { opacity: 0 },
          { 
            opacity: 1, 
            duration: 1,
            delay: 1,
            scrollTrigger: {
              trigger: footer.querySelector('.copyright'),
              start: "top 95%",
              toggleActions: "play none none none"
            }
          }
        );
        
        // Add hover effects to social icons
        footer.querySelectorAll('.social-icon').forEach(icon => {
          icon.addEventListener('mouseenter', () => {
            gsap.to(icon, { 
              scale: 1.2, 
              backgroundColor: '#ff4500', 
              duration: 0.3 
            });
          });
          
          icon.addEventListener('mouseleave', () => {
            gsap.to(icon, { 
              scale: 1, 
              backgroundColor: '', 
              duration: 0.3 
            });
          });
        });
        
        // Add hover effects to quick links
        footer.querySelectorAll('.quick-links li a').forEach(link => {
          link.addEventListener('mouseenter', () => {
            gsap.to(link, { 
              x: 10, 
              color: '#ff4500', 
              duration: 0.3 
            });
          });
          
          link.addEventListener('mouseleave', () => {
            gsap.to(link, { 
              x: 0, 
              color: '', 
              duration: 0.3 
            });
          });
        });
        
        // Subscribe button effect
        const subscribeButton = footer.querySelector('.newsletter-form button');
        if (subscribeButton) {
          subscribeButton.addEventListener('mouseenter', () => {
            gsap.to(subscribeButton, { 
              scale: 1.05, 
              backgroundColor: '#ff4500', 
              duration: 0.3 
            });
          });
          
          subscribeButton.addEventListener('mouseleave', () => {
            gsap.to(subscribeButton, { 
              scale: 1, 
              backgroundColor: '', 
              duration: 0.3 
            });
          });
        }
      }, []);
    return(
        <div>
            <footer ref={footerRef}>
            <div className="footer-container">
                <div className="footer-column">
                    <h3>About Us</h3>
                    <p>We are dedicated to providing the best services and products to our customers. Our mission is to create innovative solutions that make a difference.</p>
                    <div className="social-icons">
                        <Link to="#" className="social-icon"><i className="fab fa-facebook-f"></i></Link>
                        <Link to="#" className="social-icon"><i className="fab fa-twitter"></i></Link>
                        <Link to="#" className="social-icon"><i className="fab fa-instagram"></i></Link>
                        <Link to="#" className="social-icon"><i className="fab fa-linkedin-in"></i></Link>
                    </div>
                </div>
                
                <div className="footer-column">
                    <h3>Quick Links</h3>
                    <ul className="quick-links">
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/product">Productt</Link></li>
                        <li><Link to="/collections">collections</Link></li>
                        <li><Link to="/gift">Gifts</Link></li>
                        <li><Link to="/spinner">spinner</Link></li>
                        <li><Link to="/login">Login</Link></li>
                    </ul>
                </div>
                
                <div className="footer-column">
                    <h3>Contact Us</h3>
                    <div className="contact-info">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>123 Main Street, Mohammedia, Parc plaza, N3</span>
                    </div>
                    <div className="contact-info">
                        <i className="fas fa-phone"></i>
                        <span>+212 721-221670</span>
                    </div>
                    <div className="contact-info">
                        <i className="fas fa-envelope"></i>
                        <span>info@oj.com</span>
                    </div>
                </div>
                
                <div className="footer-column">
                    <h3>Newsletter</h3>
                    <p>Subscribe to our newsletter to receive updates and special offers.</p>
                    <form className="newsletter-form">
                        <input type="email" placeholder="Your Email Address" required />
                        <button type="submit">Subscribe</button>
                    </form>
                </div>
            </div>
            
            <div className="copyright">
                <p>&copy; 2025 OJ. All Rights Reserved.</p>
            </div>
            </footer>
        </div>
    )
}
export default Footer;