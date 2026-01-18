import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Copy, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import './APIKeys.css';

export default function APIKeys() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [visibleKeys, setVisibleKeys] = useState({});

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/api/keys', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.keys || []);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAPIKey = async () => {
    if (!keyName.trim()) {
      alert('Please enter a key name');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/api/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: keyName })
      });

      if (response.ok) {
        const data = await response.json();
        setApiKeys([...apiKeys, data.key]);
        setKeyName('');
        setShowForm(false);
      }
    } catch (error) {
      alert('Error creating API key');
    }
  };

  const deleteAPIKey = async (keyId) => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:5000/api/keys/${keyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setApiKeys(apiKeys.filter(k => k._id !== keyId));
      }
    } catch (error) {
      alert('Error deleting API key');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  if (loading) {
    return <div className="loading">Loading API keys...</div>;
  }

  return (
    <div className="api-keys-container">
      <motion.div className="keys-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div>
          <h1>🔑 API Keys</h1>
          <p>Manage API keys for third-party integrations</p>
        </div>
        <button className="create-key-btn" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} /> Create New Key
        </button>
      </motion.div>

      {showForm && (
        <motion.div className="create-key-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <input
            type="text"
            placeholder="Key name (e.g., 'Mobile App', 'Desktop Client')"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            className="form-input"
          />
          <div className="form-actions">
            <button className="btn-create" onClick={createAPIKey}>Create</button>
            <button className="btn-cancel" onClick={() => { setShowForm(false); setKeyName(''); }}>Cancel</button>
          </div>
        </motion.div>
      )}

      <div className="keys-list">
        {apiKeys.length === 0 ? (
          <div className="empty-state">
            <h3>No API keys yet</h3>
            <p>Create your first API key to integrate with external applications</p>
          </div>
        ) : (
          apiKeys.map((key, index) => (
            <motion.div key={key._id} className="key-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="key-info">
                <h3>{key.name}</h3>
                <p className="created-date">Created: {new Date(key.created_at).toLocaleDateString()}</p>
                
                <div className="key-value">
                  <code>
                    {visibleKeys[key._id] ? key.key : key.key.substring(0, 10) + '...' + key.key.substring(key.key.length - 4)}
                  </code>
                  <button className="icon-btn" onClick={() => toggleKeyVisibility(key._id)}>
                    {visibleKeys[key._id] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button className="icon-btn" onClick={() => copyToClipboard(key.key)}>
                    <Copy size={16} />
                  </button>
                </div>

                <div className="key-usage">
                  <span>Usage: {key.usage_count || 0} requests</span>
                  <span>Last used: {key.last_used ? new Date(key.last_used).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>
              
              <button className="delete-btn" onClick={() => deleteAPIKey(key._id)}>
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))
        )}
      </div>

      <motion.div className="usage-guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2>📚 How to use API Keys</h2>
        <pre className="code-block">
{`# Include in Authorization header:
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  http://api.example.com/analyze

# Or as query parameter:
http://api.example.com/analyze?key=YOUR_API_KEY`}
        </pre>
      </motion.div>
    </div>
  );
}
