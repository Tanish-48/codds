import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Download, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import './BatchAnalyzer.css';

export default function BatchAnalyzer() {
  const [files, setFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const addFiles = (newFiles) => {
    const textFiles = newFiles.filter(f => f.type === 'text/plain' || f.name.endsWith('.txt'));
    const updated = [...files, ...textFiles.map((f, i) => ({ id: Date.now() + i, file: f, status: 'pending' }))];
    setFiles(updated.slice(0, 20)); // Max 20 files
  };

  const handleFileChange = (e) => {
    addFiles(Array.from(e.target.files));
  };

  const removeFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const analyzeAll = async () => {
    if (files.length === 0) {
      alert('Please add files first');
      return;
    }

    setAnalyzing(true);
    const token = localStorage.getItem('token');
    const analysisResults = [];

    for (const item of files) {
      try {
        const text = await item.file.text();
        
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'analyzing' } : f));

        const response = await fetch('http://127.0.0.1:5000/api/analyze/text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ text })
        });

        if (response.ok) {
          const data = await response.json();
          analysisResults.push({
            filename: item.file.name,
            originality: data.originality_score,
            status: 'success'
          });
          setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'completed' } : f));
        } else {
          analysisResults.push({
            filename: item.file.name,
            error: 'Analysis failed',
            status: 'error'
          });
          setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error' } : f));
        }
      } catch (error) {
        analysisResults.push({
          filename: item.file.name,
          error: error.message,
          status: 'error'
        });
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: 'error' } : f));
      }
    }

    setResults(analysisResults);
    setAnalyzing(false);
  };

  const downloadResults = () => {
    const csv = 'Filename,Originality Score,Status\n' + 
      results.map(r => `"${r.filename}",${r.originality || 'N/A'},${r.status}`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-analysis-${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setFiles([]);
    setResults([]);
  };

  return (
    <div className="batch-analyzer">
      <motion.div className="batch-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2>📦 Batch File Analysis</h2>
        <p>Upload up to 20 text files for simultaneous analysis</p>
      </motion.div>

      {results.length === 0 ? (
        <>
          <motion.div 
            className={`batch-upload ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            whileHover={{ borderColor: '#667eea' }}
          >
            <Upload size={40} />
            <h3>Drag files here or click to browse</h3>
            <p>Supported: .txt files (Max 20 files)</p>
            <input 
              type="file" 
              multiple 
              accept=".txt" 
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="batch-file-input"
            />
            <label htmlFor="batch-file-input" className="upload-button">
              Select Files
            </label>
          </motion.div>

          {files.length > 0 && (
            <motion.div className="batch-files" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="files-header">
                <h3>Files to analyze ({files.length}/20)</h3>
                <button className="clear-btn" onClick={clearAll}>Clear All</button>
              </div>
              <div className="files-list">
                {files.map(f => (
                  <motion.div key={f.id} className="file-item" initial={{ x: -20 }} animate={{ x: 0 }}>
                    <span className="file-name">{f.file.name}</span>
                    <span className={`status ${f.status}`}>
                      {f.status === 'pending' && '⏳ Pending'}
                      {f.status === 'analyzing' && '⚙️ Analyzing'}
                      {f.status === 'completed' && '✅ Done'}
                      {f.status === 'error' && '❌ Error'}
                    </span>
                    <button className="remove-btn" onClick={() => removeFile(f.id)}>
                      <X size={18} />
                    </button>
                  </motion.div>
                ))}
              </div>
              <button 
                className="analyze-btn"
                onClick={analyzeAll}
                disabled={analyzing}
              >
                {analyzing ? '⚙️ Analyzing...' : '🚀 Analyze All'}
              </button>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div className="batch-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="results-header">
            <h3>Analysis Results</h3>
            <button className="download-btn" onClick={downloadResults}>
              <Download size={18} /> Download CSV
            </button>
          </div>
          <div className="results-table">
            <div className="table-header">
              <div className="col-filename">Filename</div>
              <div className="col-originality">Originality</div>
              <div className="col-status">Status</div>
            </div>
            {results.map((r, i) => (
              <motion.div key={i} className="table-row" initial={{ x: -20 }} animate={{ x: 0 }}>
                <div className="col-filename">{r.filename}</div>
                <div className="col-originality">
                  {r.originality !== undefined ? (
                    <span className="score">{r.originality.toFixed(1)}%</span>
                  ) : (
                    <span className="error">N/A</span>
                  )}
                </div>
                <div className="col-status">
                  {r.status === 'success' && <CheckCircle size={18} color="#48bb78" />}
                  {r.status === 'error' && <AlertCircle size={18} color="#f56565" />}
                </div>
              </motion.div>
            ))}
          </div>
          <button className="new-batch-btn" onClick={clearAll}>Start New Batch</button>
        </motion.div>
      )}
    </div>
  );
}
