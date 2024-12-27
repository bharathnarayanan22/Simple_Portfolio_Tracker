// src/pages/Home.jsx
import React from "react";
import Navbar from "../components/Navbar";
import FeatureCard from "../components/FeatureCard";
import "../styles/Home.css";

const Home = () => {
  return (
    <div>
      <Navbar />
      <div className="home-content">
        <div className="hero-section">
          <h1>Welcome to Portfolio Tracker</h1>
          <p>Your ultimate tool to manage and track your investments.</p>
        </div>

        <div className="features-section">
          <FeatureCard
            title="Track Portfolio"
            description="View your stock portfolio, including current value, top performers, and historical performance."
            imgSrc="/images/portfolio-tracking.png"
          />
          <FeatureCard
            title="Add/Edit Stocks"
            description="Easily add or edit stocks, set quantities, and track the purchase price."
            imgSrc="/images/add-edit-stocks.png"
          />
          <FeatureCard
            title="Real-Time Updates"
            description="Get live stock price updates to track the latest value of your portfolio."
            imgSrc="/images/real-time-updates.png"
          />
          <FeatureCard
            title="Portfolio Analytics"
            description="Analyze portfolio performance with detailed metrics and graphs."
            imgSrc="/images/portfolio-analytics.png"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
