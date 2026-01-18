import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Chatbot from '../components/Chatbot';
import DarkModeToggle from '../components/DarkModeToggle';
import './Dashboard.css';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('analyze');
  const [analysisText, setAnalysisText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisList, setAnalysisList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load user info
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      window.location.href = '/login';
    }

    // Load analysis history
    fetchHistory();
  }, []);

  const handleAnalyze = async () => {
    if (!analysisText.trim() || analysisText.length < 10) {
      alert('Please enter at least 10 characters');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://127.0.0.1:5000/api/analyze/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: analysisText })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analysis failed');
      }

      const data = await response.json();
      console.log('Analysis result:', data);

      setAnalysisResult(data);
      setAnalysisText('');
      fetchHistory();
    } catch (error) {
      console.error('Error:', error);
      alert('Error analyzing text: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('http://127.0.0.1:5000/api/analyze/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();

      const formattedReports = data.reports.map(report => ({
        id: report._id,
        date: new Date(report.created_at).toLocaleDateString(),
        score: report.originality_score,
        text: report.content ? report.content.substring(0, 100) : 'Analysis'
      }));

      setAnalysisList(formattedReports);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <motion.div
        className={`sidebar ${!sidebarOpen ? 'collapsed' : ''}`}
        initial={{ x: -300 }}
        animate={{ x: 0 }}
      >
        <div className="sidebar-header">
          <h1 className="sidebar-title">⚡ CODDS</h1>
          <button
            className="toggle-menu"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display: 'none' }}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="menu-items">
          <button
            className={`menu-item ${activeTab === 'analyze' ? 'active' : ''}`}
            onClick={() => setActiveTab('analyze')}
          >
            📊 Analyze
          </button>
          <button
            className={`menu-item ${activeTab === 'batch' ? 'active' : ''}`}
            onClick={() => navigate('/batch')}
          >
            📁 Batch Upload
          </button>
          <button
            className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => navigate('/profile')}
          >
            👤 Profile & Stats
          </button>
          <button
            className={`menu-item ${activeTab === 'keys' ? 'active' : ''}`}
            onClick={() => navigate('/keys')}
          >
            🔑 API Keys
          </button>
          <button
            className={`menu-item ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📈 History
          </button>
          <button
            className={`menu-item ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            💡 Insights
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          Logout
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <h1 className="header-title">AI Originality Detection System</h1>
          <div className="header-controls">
            <DarkModeToggle />
            <button
              className="toggle-menu"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        <div className="content-wrapper">
          <div className="analysis-section">
            {/* Tabs */}
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'analyze' ? 'active' : ''}`}
                onClick={() => setActiveTab('analyze')}
              >
                Analyze Text
              </button>
              <button
                className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                History
              </button>
              <button
                className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
                onClick={() => setActiveTab('insights')}
              >
                Insights
              </button>
            </div>

            {/* Analyze Tab */}
            {activeTab === 'analyze' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="input-group">
                  <label>Enter your text to analyze</label>
                  <textarea
                    value={analysisText}
                    onChange={(e) => setAnalysisText(e.target.value)}
                    placeholder="Paste your text here... (minimum 10 characters)"
                    className="textarea"
                  />
                </div>

                <button
                  className="button button-analyze"
                  onClick={handleAnalyze}
                  disabled={loading}
                >
                  {loading ? '⏳ Analyzing...' : '🔍 Analyze Text'}
                </button>

                {analysisResult && (
                  <motion.div
                    className="results-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {/* Score Cards */}
                    <div className="result-card">
                      <div className="score-display">
                        <div className="score-label">Originality Score</div>
                        <div className="score-value">
                          {analysisResult.originality_score?.toFixed(1)}%
                        </div>
                        <div className="progress-bar">
                          <motion.div
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${analysisResult.originality_score}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                        <div className="score-description">
                          {analysisResult.originality_score > 70 ? 'Highly Original' : analysisResult.originality_score > 40 ? 'Moderately Original' : 'Low Originality'}
                        </div>
                      </div>
                    </div>

                    <div className="result-card">
                      <div className="score-display">
                        <div className="score-label">AI Similarity</div>
                        <div className="score-value">
                          {analysisResult.ai_similarity?.toFixed(1)}%
                        </div>
                        <div className="progress-bar">
                          <motion.div
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${analysisResult.ai_similarity}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                        <div className="score-description">
                          {analysisResult.ai_similarity > 60 ? 'Likely AI Generated' : analysisResult.ai_similarity > 30 ? 'Possibly AI Content' : 'Human Written'}
                        </div>
                      </div>
                    </div>

                    {/* Suggestions Section */}
                    {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
                      <div className="suggestions-section">
                        <label className="suggestions-label">💡 How to Improve Originality</label>
                        <div className="suggestions-list">
                          {analysisResult.suggestions.map((suggestion, idx) => (
                            <motion.div
                              key={idx}
                              className="suggestion-item"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                            >
                              <span className="suggestion-text">{suggestion}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <motion.div
                className="history-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {analysisList.length > 0 ? (
                  analysisList.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      className="history-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <div className="history-item-text">
                        <strong>{item.date}</strong> - {item.text}
                      </div>
                      <div className="history-item-score">{item.score.toFixed(1)}%</div>
                    </motion.div>
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <p>No analysis history yet</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Insights Tab */}
            {activeTab === 'insights' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="insights-container">
                  <div className="insights-card">
                    <h3>📈 Your Analysis Stats</h3>
                    <p>Total Analyses: {analysisList.length}</p>
                    <p>Average Originality: {analysisList.length > 0 ? (analysisList.reduce((sum, item) => sum + item.score, 0) / analysisList.length).toFixed(1) : 0}%</p>
                  </div>
                  
                  <div className="quotes-section">
                    <h3>💡 Inspiration Quotes</h3>
                    <div className="quotes-list">
                      <motion.div className="quote-card" whileHover={{ scale: 1.02 }}>
                        <p>"The ability to write is not inherent, it is acquired."</p>
                        <span>— William Zinsser</span>
                      </motion.div>
                      <motion.div className="quote-card" whileHover={{ scale: 1.02 }}>
                        <p>"Good writing is clear thinking made visible."</p>
                        <span>— Bill Wheeler</span>
                      </motion.div>
                      <motion.div className="quote-card" whileHover={{ scale: 1.02 }}>
                        <p>"The first draft is just you telling yourself the story."</p>
                        <span>— Terry Pratchett</span>
                      </motion.div>
                      <motion.div className="quote-card" whileHover={{ scale: 1.02 }}>
                        <p>"Authenticity is the daily practice of letting go of who we think we're supposed to be."</p>
                        <span>— Brené Brown</span>
                      </motion.div>
                      <motion.div className="quote-card" whileHover={{ scale: 1.02 }}>
                        <p>"In writing, the point is not to express yourself; it's to express something."</p>
                        <span>— David McCullough</span>
                      </motion.div>
                      <motion.div className="quote-card" whileHover={{ scale: 1.02 }}>
                        <p>"Your voice is the most important tool in your writing toolkit."</p>
                        <span>— James Patterson</span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Chatbot */}
          <Chatbot />
        </div>
      </div>
    </div>
  );
}
