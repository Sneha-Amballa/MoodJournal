// MoodChart.jsx
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

const MoodChart = ({ moodStats }) => {
  const data = Object.entries(moodStats).map(([mood, count]) => ({
    mood,
    count,
  }));

  return (
    <div style={{ width: '100%', height: 300, marginTop: '2rem' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Mood Overview</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mood" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={3} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodChart;
