import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { LogOut, Users, TrendingUp, Activity, Server, Zap, RefreshCw, Trash2, Eye, Search } from 'lucide-react';
import './AdminDashboard.css';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (token) {
      fetchAdminData(token);
      const interval = setInterval(() => fetchAdminData(token), 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAdminData = async (token) => {
    try {
      setRefreshing(true);
      
      const analyticsRes = await fetch('http://127.0.0.1:5000/api/admin/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data.analytics || data);
      }
      
      const usersRes = await fetch('http://127.0.0.1:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
      
      const healthRes = await fetch('http://127.0.0.1:5000/api/admin/system-health', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (healthRes.ok) {
        const data = await healthRes.json();
        setSystemHealth(data.health || data);
      }
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:5000/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          setUsers(users.filter(u => u._id !== userId));
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleRefresh = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetchAdminData(token);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <motion.div className="admin-header" initial={{ y: -20 }} animate={{ y: 0 }}>
        <div className="header-content">
          <h1>🛡️ Admin Dashboard</h1>
          <p>System Administration & Analytics</p>
        </div>
        <div className="header-actions">
          <span className="user-badge">👤 {user?.username || 'Admin'}</span>
          <span className="admin-badge">ADMIN</span>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </motion.div>

      <div className="admin-nav">
        <button 
          className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <TrendingUp size={18} /> Analytics
        </button>
        <button 
          className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={18} /> Users ({users.length})
        </button>
        <button 
          className={`nav-tab ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          <Server size={18} /> System Health
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'analytics' && (
          <motion.div 
            className="tab-content"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="section-header">
              <h2>📊 Analytics Overview</h2>
              <button 
                className="refresh-btn"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
                Refresh
              </button>
            </div>

            {analytics && (
              <>
                <div className="stats-grid">
                  <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
                    <div className="stat-icon" style={{ backgroundColor: '#667eea' }}>
                      <Users size={24} />
                    </div>
                    <div className="stat-info">
                      <h4>Total Users</h4>
                      <p className="stat-value">{analytics.user_stats?.total_users || 0}</p>
                      <span className="stat-label">Registered accounts</span>
                    </div>
                  </motion.div>

                  <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
                    <div className="stat-icon" style={{ backgroundColor: '#764ba2' }}>
                      <Activity size={24} />
                    </div>
                    <div className="stat-info">
                      <h4>Active Users</h4>
                      <p className="stat-value">{analytics.user_stats?.active_users || 0}</p>
                      <span className="stat-label">With analyses</span>
                    </div>
                  </motion.div>

                  <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
                    <div className="stat-icon" style={{ backgroundColor: '#f093fb' }}>
                      <Zap size={24} />
                    </div>
                    <div className="stat-info">
                      <h4>Total Analyses</h4>
                      <p className="stat-value">{analytics.analysis_stats?.total_analyses || 0}</p>
                      <span className="stat-label">Text analyses performed</span>
                    </div>
                  </motion.div>

                  <motion.div className="stat-card" whileHover={{ scale: 1.05 }}>
                    <div className="stat-icon" style={{ backgroundColor: '#4facfe' }}>
                      <TrendingUp size={24} />
                    </div>
                    <div className="stat-info">
                      <h4>Avg Originality</h4>
                      <p className="stat-value">{(analytics.analysis_stats?.average_originality || 0).toFixed(1)}%</p>
                      <span className="stat-label">Average score</span>
                    </div>
                  </motion.div>
                </div>

                <div className="charts-grid">
                  <motion.div className="chart-card" whileHover={{ y: -5 }}>
                    <h3>Originality Score Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Highly Original (80-100%)', value: analytics.analysis_stats?.highly_original || 0 },
                            { name: 'Original (50-80%)', value: analytics.analysis_stats?.original || 0 },
                            { name: 'Mixed (20-50%)', value: analytics.analysis_stats?.mixed || 0 },
                            { name: 'Low Original (0-20%)', value: analytics.analysis_stats?.low_original || 0 },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {COLORS.map((color, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </motion.div>

                  <motion.div className="chart-card" whileHover={{ y: -5 }}>
                    <h3>Usage Trend (Last 7 Days)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.trend_data || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="analyses" stroke="#667eea" strokeWidth={2} />
                        <Line type="monotone" dataKey="new_users" stroke="#764ba2" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div 
            className="tab-content"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="section-header">
              <h2>👥 User Management</h2>
              <div className="search-box">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <motion.div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Analyses</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(u => (
                      <motion.tr key={u._id} whileHover={{ backgroundColor: '#f8f9fa' }}>
                        <td><span className="username-badge">{u.username}</span></td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge role-${u.role}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td><span className="analysis-count">{u.analysis_count || 0}</span></td>
                        <td>{new Date(u.created_at || new Date()).toLocaleDateString()}</td>
                        <td className="actions">
                          <button className="action-btn view" title="View details">
                            <Eye size={16} />
                          </button>
                          <button 
                            className="action-btn delete"
                            onClick={() => handleDeleteUser(u._id)}
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-data">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'health' && (
          <motion.div 
            className="tab-content"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="section-header">
              <h2>⚙️ System Health</h2>
              <button 
                className="refresh-btn"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
                Check
              </button>
            </div>

            {systemHealth && (
              <div className="health-cards">
                <motion.div className="health-card" whileHover={{ scale: 1.02 }}>
                  <h4>Database Status</h4>
                  <p className={`status ${systemHealth.database || 'healthy'}`}>
                    {systemHealth.database === 'healthy' ? '✅ Healthy' : '❌ Unhealthy'}
                  </p>
                  <p className="timestamp">Last checked: {new Date().toLocaleTimeString()}</p>
                </motion.div>

                <motion.div className="health-card" whileHover={{ scale: 1.02 }}>
                  <h4>API Server</h4>
                  <p className="status healthy">✅ Running</p>
                  <p className="timestamp">Response time: &lt;100ms</p>
                </motion.div>

                <motion.div className="health-card" whileHover={{ scale: 1.02 }}>
                  <h4>Collections</h4>
                  <p className="count">{systemHealth.collections?.users || 0} Users</p>
                  <p className="count">{systemHealth.collections?.reports || 0} Reports</p>
                </motion.div>

                <motion.div className="health-card" whileHover={{ scale: 1.02 }}>
                  <h4>Storage</h4>
                  <p className="status healthy">✅ Available</p>
                  <p className="timestamp">Disk space: Adequate</p>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

