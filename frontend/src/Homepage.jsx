import React from 'react';
import { useNavigate } from 'react-router-dom';
import {FaPenFancy, FaChartBar } from 'react-icons/fa';
import './Login_and_signup_css.css';

function Homepage() {
  const navigate = useNavigate();

  return (
    <div className="container homepage">
      <h1 className="title gradient-text">MoodJournal</h1>
      <p className="subtitle">
        Track your emotions, understand your patterns, and improve your mental well-being with AI-powered sentiment analysis.
      </p>

      <div className="button-group">
        <button className="button get-started" onClick={() => navigate('/auth')}>
          Get Started
        </button>
        <button className="button sign-in" onClick={() => navigate('/auth')}>
          Sign In
        </button>
      </div>

      <div className="card-container">

        <div className="card">
          <div className="icon-circle blue">
            <FaPenFancy size={28} color="#4a6cf7" />
          </div>
          <h3>Daily Journaling</h3>
          <p>
            Write your thoughts and feelings in a beautiful, distraction-free environment.
          </p>
        </div>

        <div className="card">
          <div className="icon-circle green">
            <FaChartBar size={28} color="#28a745" />
          </div>
          <h3>Mood Dashboard</h3>
          <p>
            Visualize your emotional journey with beautiful charts and insights.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Homepage;