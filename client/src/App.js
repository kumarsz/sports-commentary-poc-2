import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import MatchList from './components/MatchList';
import LiveMatch from './components/LiveMatch';

function App() {
  const [language, setLanguage] = useState('en');

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">🎙️ CricketAI</h1>
            <p className="app-subtitle">AI-Powered Live Cricket Commentary</p>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="language-selector"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="te">తెలుగు (Telugu)</option>
            </select>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<MatchList language={language} />} />
            <Route path="/match/:id" element={<LiveMatch language={language} />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>PoC Version 0.1.0 | All data is mocked for demonstration</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
