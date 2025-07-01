import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './Homepage';
import LoginSignup from './LoginSignup';
import JournalApp from './JournalApp';
import Dashboard from './Dashboardpage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/auth" element={<LoginSignup />} />
        <Route path="/journal" element={<JournalApp />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
      </Routes>
    </Router>
  );
}

export default App;