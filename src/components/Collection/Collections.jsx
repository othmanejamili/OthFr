import { ChevronRight, Link } from "lucide-react";
import React from "react";
import "../../styles/coll/Collections.css";

const collections = [
  {
    season: "Summer",
    title: "Summer Escape",
    subtitle: "Endless possibilities",
    description: "Dive into vibrant textures and refreshing palettes that capture the essence of warm adventures.",
    img: "https://res.cloudinary.com/dsfgsdjgz/image/upload/v1753459033/__nicgq4.jpg",
    accent: "summer-accent",
    background: "summer-bg",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3L19 12L5 21V3Z" />
    )
  },
  {
    season: "Winter",
    title: "Winter Serenity",
    subtitle: "Cozy elegance",
    description: "Embrace sophisticated warmth with textures that whisper comfort and timeless style.",
    img: "https://res.cloudinary.com/dsfgsdjgz/image/upload/v1753458444/__1_hjei4x.jpg",
    accent: "winter-accent",
    background: "winter-bg",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
    )
  },
  {
    season: "Spring",
    title: "Spring Awakening",
    subtitle: "Fresh beginnings",
    description: "Celebrate renewal with soft pastels and organic forms that breathe life into every space.",
    img: "https://res.cloudinary.com/dsfgsdjgz/image/upload/v1753458868/sstyle_me_m2u4ed.jpg",
    accent: "spring-accent",
    background: "spring-bg",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
    )
  },
  {
    season: "Autumn",
    title: "Autumn Harmony",
    subtitle: "Golden moments",
    description: "Rich earth tones and luxurious textures that capture the poetry of changing seasons.",
    img: "https://res.cloudinary.com/dsfgsdjgz/image/upload/v1753458765/autumn_smhg3v.jpg",
    accent: "autumn-accent",
    background: "autumn-bg",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    )
  },
];

const SeasonalCollections = () => {
  return (
    <div className="body">
        <div className="containers">
        <div className="header">
            <h1>Seasonal Collections</h1>
            <p>Discover curated experiences that capture the essence of each season</p>
        </div>

        <div className="collections-grids">
            {collections.map((item, index) => (
            <div className="collection-cardss" key={index}>
                <div className={`cards-background ${item.background}`}></div>
                <div className="cards-content">
                <div className="cards-header">
                    <div className="cards-icon">
                    <div className="icon-container">
                        <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {item.icon}
                        </svg>
                    </div>
                    <div>
                        <h3 className="cards-title">{item.title}</h3>
                        <p className="cards-subtitle">{item.subtitle}</p>
                    </div>
                    </div>
                    <div className={`accent-dot ${item.accent}`}></div>
                </div>

                <div className="cards-image">
                    <img src={item.img} alt={`${item.season} Collection`} />
                    <div className="image-overlay"></div>
                </div>

                <div className="cards-description">{item.description}</div>

                <div className="cards-footer">
                    <button>
                    <Link to="/product" className="explore-btn" />
                    <span>Explore Collection</span>
                    <ChevronRight size={24} strokeWidth={2} />
                    </button>
                    <div className="dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                    </div>
                </div>
                </div>
                <div className="floating-element-1"></div>
                <div className="floating-element-2"></div>
            </div>
            ))}
        </div>

        <div className="bottom-section">
            <div className="interactive-bar">
            <div className="status-dots">
                <div className="status-dot summer-accent"></div>
                <div className="status-dot winter-accent"></div>
                <div className="status-dot spring-accent"></div>
                <div className="status-dot autumn-accent"></div>
            </div>
            <span className="status-text">Interactive Collections</span>
            </div>
        </div>
        </div>
    </div>
  );
};

export default SeasonalCollections;
