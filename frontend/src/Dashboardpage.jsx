import React, { useEffect, useState } from 'react';
import MoodChart from './MoodChart';
import './Dashboard.css';
import { FiTrendingUp, FiAward, FiBarChart2, FiFilter } from 'react-icons/fi';
import {
  FaRegSmile,
  FaRegLaughBeam,
  FaRegSadTear,
  FaRegFrownOpen,
  FaGrinStars,
  FaRegMeh,
  FaAngry,
  FaSurprise,
} from 'react-icons/fa';
import Navbar from './Navbar';

const moodColors = {
  happiness: '#FFD700',
  joy: '#FFEB3B',
  happy: '#4CAF50',
  content: '#8BC34A',
  neutral: '#9E9E9E',
  sad: '#2196F3',
  sadness: '#1976D2',
  anxious: '#FF9800',
  fear: '#FF5722',
  anger: '#F44336',
  disgust: '#795548',
  surprise: '#9C27B0',
  excited: '#E91E63'
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalEntries: 0,
    recentMoods: [],
    moodStats: {},
    activeDays: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [expandedMood, setExpandedMood] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('https://moodjournal-backend-w00a.onrender.com/api/dashboard', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardData({
            totalEntries: data.totalEntries,
            recentMoods: data.recentMoods || [],
            moodStats: data.moodStats || {},
            activeDays: data.activeDays || 0
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const moodIcons = {
    happy: <FaRegLaughBeam className="mood-icon" />,
    joy: <FaRegLaughBeam className="mood-icon" />,
    happiness: <FaRegLaughBeam className="mood-icon" />,
    content: <FaRegSmile className="mood-icon" />,
    sad: <FaRegSadTear className="mood-icon" />,
    sadness: <FaRegSadTear className="mood-icon" />,
    anxious: <FaRegFrownOpen className="mood-icon" />,
    fear: <FaRegFrownOpen className="mood-icon" />,
    excited: <FaGrinStars className="mood-icon" />,
    neutral: <FaRegMeh className="mood-icon" />,
    anger: <FaAngry className="mood-icon" />,
    disgust: <FaRegFrownOpen className="mood-icon" />,
    surprise: <FaSurprise className="mood-icon" />
  };

  const getMoodIcon = (mood) => 
    moodIcons[mood?.toLowerCase()] || <FaRegMeh className="mood-icon" />;

  const getMoodColor = (mood) => 
    moodColors[mood?.toLowerCase()] || '#9E9E9E';

  // Filter recent moods by time range
  const filterRecentMoods = () => {
    const now = new Date();
    let cutoffDate = new Date(0); // Default to all time

    switch (timeFilter) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return dashboardData.recentMoods;
    }

    return dashboardData.recentMoods.filter(mood => 
      new Date(mood.date) >= cutoffDate
    );
  };

  const filteredMoods = filterRecentMoods();
  const mostCommonMood = dashboardData.moodStats && Object.keys(dashboardData.moodStats).length > 0
    ? Object.entries(dashboardData.moodStats).sort((a, b) => b[1] - a[1])[0][0]
    : 'N/A';

  const toggleMoodExpansion = (index) => {
    setExpandedMood(expandedMood === index ? null : index);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your mood data...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Mood Insights</h1>
          <p className="dashboard-subtitle">Visualizing your emotional journey</p>
        </div>

        <div className="stats-grid">
          <div className="card2 gradient-blue">
            <FiBarChart2 className="card2-icon" />
            <div className="card2-content">
              <p className="card2-title">Total Entries</p>
              <p className="card2-value">{dashboardData.totalEntries}</p>
            </div>
          </div>

          <div className="card2 gradient-green">
            <FiTrendingUp className="card2-icon" />
            <div className="card2-content">
              <p className="card2-title">Top Mood</p>
              <p className="card2-value">
                {mostCommonMood !== 'N/A' ? (
                  <>
                    {getMoodIcon(mostCommonMood)} {mostCommonMood}
                  </>
                ) : (
                  'N/A'
                )}
              </p>
            </div>
          </div>

          <div className="card2 gradient-orange">
            <FiAward className="card2-icon" />
            <div className="card2-content">
              <p className="card2-title">Active Days</p>
              <p className="card2-value">{dashboardData.activeDays}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="chart-container">
            <div className="section-header">
              <h2 className="section-title">Mood Trends</h2>
              <p className="section-subtitle">Your emotional patterns over time</p>
            </div>
            <MoodChart moodStats={dashboardData.moodStats} />
          </div>

          <div className="recent-moods">
            <div className="section-header">
              <div>
                <h2 className="section-title">Recent Moods</h2>
                <p className="section-subtitle">Latest rating and emotion details</p>
              </div>
              <div className="time-filter">
                <FiFilter className="filter-icon" />
                <select 
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Time</option>
                  <option value="year">Past Year</option>
                  <option value="month">Past Month</option>
                  <option value="week">Past Week</option>
                </select>
              </div>
            </div>
            
            <div className="mood-list">
              {filteredMoods.length === 0 ? (
                <div className="empty-state">
                  <FaRegMeh className="empty-icon" />
                  <p>No moods recorded for this time period</p>
                </div>
              ) : (
                filteredMoods.map((entry, index) => (
                  <div
                    key={index}
                    className={`mood-item ${expandedMood === index ? 'expanded' : ''}`}
                    style={{ borderLeft: `5px solid ${getMoodColor(entry.mood)}` }}
                    onClick={() => toggleMoodExpansion(index)}
                  >
                    <div className="mood-summary">
                      {getMoodIcon(entry.mood)}
                      <div className="mood-details">
                        <span className="mood-name">{entry.mood || 'N/A'}</span>
                        <span className="mood-date">
                          {entry.date
                            ? new Date(entry.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'No date'}
                        </span>
                      </div>
                      <div className="mood-rating">
                        <span>{entry.rating !== undefined ? `${entry.rating}/100` : '0/100'}</span>
                      </div>
                    </div>

                    {expandedMood === index && entry.allEmotions && (
                      <div className="mood-expanded-details">
                        <div className="emotion-breakdown">
                          <h4>Emotion Analysis</h4>
                          <div className="emotion-bars">
                            {entry.allEmotions.map((emotion, i) => (
                              <div key={i} className="emotion-bar-container">
                                <div className="emotion-label">
                                  <span>{emotion.label}</span>
                                  <span>{(emotion.score * 100).toFixed(1)}%</span>
                                </div>
                                <div className="emotion-bar-bg">
                                  <div 
                                    className="emotion-bar-fill"
                                    style={{
                                      width: `${emotion.score * 100}%`,
                                      backgroundColor: getMoodColor(emotion.label)
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {entry.text && (
                          <div className="mood-note">
                            <h4>Your Note</h4>
                            <p>{entry.text}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;