// src/components/FeatureCard.jsx
import React from "react";
import "../styles/FeatureCard.css";

const FeatureCard = ({ title, description, imgSrc }) => {
  return (
    <div className="feature-card">
      <img src={imgSrc} alt={title} className="feature-img" />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default FeatureCard;
