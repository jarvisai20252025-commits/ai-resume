import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Upload, FileText, BarChart3, Download, Sparkles } from 'lucide-react';
import './App.css';
import ResumeUpload from './components/ResumeUpload';
import ResumeBuilder from './components/ResumeBuilder';
import AnalysisResults from './components/AnalysisResults';
import VersionHistory from './components/VersionHistory';

// API URL configuration
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8000/api';

// Make API_URL available globally
(window as any).API_URL = API_URL;

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const tabs = [
    { id: 'upload', label: 'Upload Resume', icon: Upload, color: '#06b6d4' },
    { id: 'builder', label: 'Resume Builder', icon: FileText, color: '#10b981' },
    { id: 'analysis', label: 'Analysis', icon: BarChart3, color: '#6366f1' },
    { id: 'versions', label: 'Versions', icon: Download, color: '#8b5cf6' }
  ];

  return (
    <div className="app">
      <header className="app-header">
        <motion.div 
          className="header-content"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="logo-section"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Sparkles className="logo-icon" size={24} />
            <h1>AI Resume Builder & Analyzer</h1>
          </motion.div>
          <motion.button 
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              key={darkMode ? 'sun' : 'moon'}
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.div>
          </motion.button>
        </motion.div>
      </header>

      <nav className="app-nav">
        <motion.div 
          className="nav-tabs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  y: -2,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                whileTap={{ scale: 0.98 }}
                style={{
                  '--tab-color': tab.color
                } as React.CSSProperties}
              >
                <motion.div
                  className="tab-icon"
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Icon size={18} />
                </motion.div>
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    className="active-indicator"
                    layoutId="activeTab"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </nav>

      <main className="app-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ 
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="tab-content"
          >
            {activeTab === 'upload' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <ResumeUpload 
                  onAnalysisComplete={(data) => {
                    setAnalysisData(data);
                    setTimeout(() => setActiveTab('analysis'), 300);
                  }}
                />
              </motion.div>
            )}
            {activeTab === 'builder' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <ResumeBuilder 
                  onAnalysisComplete={(data) => {
                    setAnalysisData(data);
                    setTimeout(() => setActiveTab('analysis'), 300);
                  }}
                />
              </motion.div>
            )}
            {activeTab === 'analysis' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <AnalysisResults data={analysisData} />
              </motion.div>
            )}
            {activeTab === 'versions' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <VersionHistory />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
        
        <motion.div
          className="floating-element floating-element-1"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="floating-element floating-element-2"
          animate={{
            y: [0, 15, 0],
            rotate: [0, -3, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </main>
    </div>
  );
}

export default App;