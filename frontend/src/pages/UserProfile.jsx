import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, Calendar, FileText } from 'lucide-react';
import './UserProfile.css';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch user analyses
      const response = await fetch('http://127.0.0.1:5000/api/analyze/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const reports = data.reports || [];
        setAnalyses(reports);

        // Calculate stats
        if (reports.length > 0) {
          const avgScore = reports.reduce((sum, r) => sum + r.originality_score, 0) / reports.length;
          const maxScore = Math.max(...reports.map(r => r.originality_score));
          const minScore = Math.min(...reports.map(r => r.originality_score));

          setStats({
            totalAnalyses: reports.length,
            averageScore: avgScore,
            maxScore: maxScore,
            minScore: minScore,
            lastAnalysis: reports[0]?.created_at
          });

          // Generate trend data (last 7 days)
          const last7Days = {};
          reports.forEach(report => {
            const date = new Date(report.created_at).toLocaleDateString();
            if (!last7Days[date]) {
              last7Days[date] = { count: 0, totalScore: 0 };
            }
            last7Days[date].count += 1;
            last7Days[date].totalScore += report.originality_score;
          });

          const trendArray = Object.entries(last7Days).map(([date, data]) => ({
            date,
            analyses: data.count,
            avgScore: (data.totalScore / data.count).toFixed(1)
          }));

          setTrendData(trendArray.reverse());
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadAnalyses = async (format) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/api/export/${format}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analyses.${format}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="user-profile">
      <motion.div className="profile-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="profile-info">
          <h1>👤 {user?.username || 'User'}</h1>
          <p>Analysis History & Statistics</p>
        </div>
        <div className="download-actions">
          <button className="download-btn" onClick={() => downloadAnalyses('csv')}>
            <Download size={18} /> CSV
          </button>
          <button className="download-btn" onClick={() => downloadAnalyses('pdf')}>
            <Download size={18} /> PDF
          </button>
        </div>
      </motion.div>

      {stats && (
        <>
          <motion.div className="stats-overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="stat-box" whileHover={{ scale: 1.05 }}>
              <FileText size={28} />
              <div>
                <h3>Total Analyses</h3>
                <p>{stats.totalAnalyses}</p>
              </div>
            </motion.div>

            <motion.div className="stat-box" whileHover={{ scale: 1.05 }}>
              <TrendingUp size={28} />
              <div>
                <h3>Average Score</h3>
                <p>{stats.averageScore.toFixed(1)}%</p>
              </div>
            </motion.div>

            <motion.div className="stat-box" whileHover={{ scale: 1.05 }}>
              <TrendingUp size={28} />
              <div>
                <h3>Highest Score</h3>
                <p>{stats.maxScore.toFixed(1)}%</p>
              </div>
            </motion.div>

            <motion.div className="stat-box" whileHover={{ scale: 1.05 }}>
              <Calendar size={28} />
              <div>
                <h3>Last Analysis</h3>
                <p>{new Date(stats.lastAnalysis).toLocaleDateString()}</p>
              </div>
            </motion.div>
          </motion.div>

          {trendData.length > 0 && (
            <motion.div className="chart-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2>📈 Analysis Trend (Last 7 Days)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="analyses" stroke="#667eea" name="Analyses Count" />
                  <Line type="monotone" dataKey="avgScore" stroke="#764ba2" name="Avg Score %" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          <motion.div className="recent-analyses" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2>📊 Recent Analyses</h2>
            <div className="analyses-list">
              {analyses.slice(0, 10).map((analysis, i) => (
                <motion.div key={i} className="analysis-item" initial={{ x: -20 }} animate={{ x: 0 }}>
                  <div className="item-date">
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </div>
                  <div className="item-content">
                    {analysis.content?.substring(0, 60)}...
                  </div>
                  <div className={`item-score ${analysis.originality_score > 70 ? 'high' : analysis.originality_score > 40 ? 'medium' : 'low'}`}>
                    {analysis.originality_score.toFixed(1)}%
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
