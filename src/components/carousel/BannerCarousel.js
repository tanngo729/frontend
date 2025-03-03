// src/components/banner/BannerCarousel.jsx
import React, { useState } from 'react';
import './BannerCarousel.scss';

const BannerCarousel = ({ banners }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = banners.length;

  const handleRadioChange = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="banner-carousel-container">
      {/* Các input radio để điều khiển slide */}
      {banners.map((_, index) => (
        <input
          key={index}
          type="radio"
          name="slider"
          id={`item-${index + 1}`}
          checked={currentSlide === index}
          onChange={() => handleRadioChange(index)}
        />
      ))}

      <div className="cards">
        {banners.map((banner, index) => (
          <label
            key={index}
            className="card"
            htmlFor={`item-${index + 1}`}
            id={`banner-${index + 1}`}
          >
            <img src={banner.image} alt={banner.title || `Banner ${index + 1}`} />
          </label>
        ))}
      </div>

      <div className="player">
        <div className="upper-part">
          <div className="play-icon">
            {/* Ví dụ SVG icon, bạn có thể thay đổi */}
            <svg width="20" height="20" fill="#2992dc" stroke="#2992dc" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          </div>
          <div className="info-area">
            {banners.map((banner, index) => (
              <div
                key={index}
                className="song-info"
                style={{ display: currentSlide === index ? 'block' : 'none' }}
              >
                <div className="title">{banner.title}</div>
                <div className="sub-line">
                  {banner.subtitle && <div className="subtitle">{banner.subtitle}</div>}
                  {banner.time && <div className="time">{banner.time}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="progress-bar">
          <span className="progress" style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}></span>
        </div>
      </div>
    </div>
  );
};

export default BannerCarousel;
