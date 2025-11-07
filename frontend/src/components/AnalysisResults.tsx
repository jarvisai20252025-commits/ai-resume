import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, MessageSquare, HelpCircle, TrendingUp, AlertTriangle, CheckCircle, Zap, Award, Target, Brain } from 'lucide-react';
import axios from 'axios';
import ExportPreview from './ExportPreview';

interface AnalysisResultsProps {
  data: any;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [exportingResume, setExportingResume] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showExportPreview, setShowExportPreview] = useState(false);

  if (!data) {
    return (
      <motion.div 
        className="analysis-placeholder"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Brain size={64} className="placeholder-icon" />
        </motion.div>
        <h2>No Analysis Data</h2>
        <p>Please upload a resume or use the resume builder to see analysis results.</p>
      </motion.div>
    );
  }

  const { score, analysis, parsed_data } = data;

  const generateCoverLetter = async () => {
    setGeneratingCoverLetter(true);
    try {
      const response = await axios.post('http://localhost:8000/api/generate-cover-letter', {
        resume_data: parsed_data || {}
      });
      setCoverLetter(response.data.cover_letter);
    } catch (error) {
      console.error('Failed to generate cover letter:', error);
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const generateInterviewQuestions = async () => {
    setGeneratingQuestions(true);
    try {
      const response = await axios.post('http://localhost:8000/api/generate-interview-questions', parsed_data || {});
      setInterviewQuestions(response.data.questions);
    } catch (error) {
      console.error('Failed to generate questions:', error);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const exportResume = async (customOptions: any = null) => {
    setExportingResume(true);
    setExportSuccess(false);
    
    try {
      // Prepare optimizations based on analysis and custom options
      const optimizations = {
        enhanced_summary: analysis?.enhanced_summary || parsed_data?.summary || '',
        format_style: customOptions?.colorScheme || 'professional',
        font_size: customOptions?.fontSize || 'medium',
        spacing: customOptions?.spacing || 'standard',
        include_keywords: customOptions?.includeKeywords ?? true,
        optimize_ats: customOptions?.optimizeATS ?? true,
        missing_keywords: analysis?.missing_keywords || {},
        top_keywords: analysis?.keywords?.slice(0, 10) || []
      };

      const response = await axios.post(
        `http://localhost:8000/api/export-resume/${data.version_id}`,
        optimizations,
        { 
          responseType: 'blob',
          timeout: 30000 // 30 second timeout
        }
      );
      
      // Get filename from response headers or create professional one
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'Professional_Resume.pdf';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      } else if (parsed_data?.contact?.name) {
        const safeName = parsed_data.contact.name.replace(/[^a-zA-Z0-9\s-_]/g, '').trim();
        filename = `${safeName.replace(/\s+/g, '_')}_Professional_Resume.pdf`;
      }
      
      // Create download
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
      
    } catch (error) {
      console.error('Failed to export resume:', error);
      alert('Failed to export resume. Please try again.');
    } finally {
      setExportingResume(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--success-color)';
    if (score >= 60) return 'var(--warning-color)';
    return 'var(--error-color)';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp, color: '#6366f1' },
    { id: 'keywords', label: 'Keywords', icon: Target, color: '#06b6d4' },
    { id: 'recommendations', label: 'Recommendations', icon: AlertTriangle, color: '#f59e0b' },
    { id: 'ai-tools', label: 'AI Tools', icon: Brain, color: '#8b5cf6' }
  ];

  return (
    <div className="analysis-results">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="results-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="header-content">
            <div className="header-text">
              <h2 className="gradient-text">Resume Analysis Results</h2>
              <p>Comprehensive AI-powered analysis of your resume</p>
            </div>
            <motion.button 
              className={`btn btn-primary export-btn ${exportingResume ? 'loading' : ''} ${exportSuccess ? 'success' : ''}`}
              onClick={() => setShowExportPreview(true)}
              disabled={exportingResume}
              whileHover={!exportingResume ? { scale: 1.05 } : {}}
              whileTap={!exportingResume ? { scale: 0.95 } : {}}
            >
              {exportingResume ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Download size={16} />
                  </motion.div>
                  Generating PDF...
                </>
              ) : exportSuccess ? (
                <>
                  <CheckCircle size={16} />
                  Downloaded Successfully!
                </>
              ) : (
                <>
                  <Download size={16} />
                  Export Professional Resume
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        <motion.div 
          className="results-tabs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{ '--tab-color': tab.color } as React.CSSProperties}
              >
                <motion.div
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Icon size={16} />
                </motion.div>
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    className="tab-indicator"
                    layoutId="activeIndicator"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>

        <div className="results-content">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="overview-tab"
              >
                <div className="grid grid-3">
                  {[
                    { value: score.total_score, label: 'Overall Score', grade: score.grade },
                    { value: score.ats_compatibility.score, label: 'ATS Compatibility', grade: score.ats_compatibility.level },
                    { value: Math.round(analysis.skills_match.match_percentage), label: 'Skills Match', grade: 'Industry Relevance', suffix: '%' }
                  ].map((item, index) => (
                    <motion.div 
                      key={item.label}
                      className="score-card hover-lift"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -8 }}
                    >
                      <motion.div 
                        className="score-value"
                        style={{ color: getScoreColor(item.value) }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.3 + index * 0.1 }}
                      >
                        {item.value}{item.suffix || ''}
                      </motion.div>
                      <div className="score-grade">{item.grade}</div>
                      <div className="score-label">{item.label}</div>
                      <motion.div 
                        className="score-ring"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: item.value / 100 }}
                        transition={{ duration: 1.5, delay: 0.5 + index * 0.1 }}
                      />
                    </motion.div>
                  ))}
                </div>

                <motion.div 
                  className="section-scores"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <h3>Section Breakdown</h3>
                  <div className="score-breakdown">
                    {Object.entries(score.section_scores).map(([section, sectionScore], index) => (
                      <motion.div 
                        key={section} 
                        className="score-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                      >
                        <div className="score-label">
                          {section.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div className="progress-bar">
                          <motion.div 
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${sectionScore}%` }}
                            transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                            style={{ 
                              backgroundColor: getScoreColor(sectionScore as number)
                            }}
                          />
                        </div>
                        <div className="score-number">{sectionScore as number}</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'keywords' && (
              <motion.div
                key="keywords"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="keywords-tab"
              >
                <div className="grid grid-2">
                  <motion.div 
                    className="keyword-section"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3><Award size={20} /> Top Keywords Found</h3>
                    <div className="keyword-list">
                      {analysis.keywords.slice(0, 15).map((kw: any, index: number) => (
                        <motion.span 
                          key={index} 
                          className="keyword-tag"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ scale: 1.05, y: -2 }}
                        >
                          {kw.keyword} ({kw.score.toFixed(2)})
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div 
                    className="keyword-section"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <h3><Target size={20} /> Missing Keywords</h3>
                    <div className="missing-keywords">
                      {Object.entries(analysis.missing_keywords).map(([category, keywords], catIndex) => (
                        <motion.div 
                          key={category} 
                          className="keyword-category"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: 0.2 + catIndex * 0.1 }}
                        >
                          <h4>{category.replace('_', ' ').toUpperCase()}</h4>
                          <div className="keyword-list">
                            {(keywords as string[]).slice(0, 8).map((keyword, index) => (
                              <motion.span 
                                key={index} 
                                className="keyword-tag missing"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                                whileHover={{ scale: 1.05, y: -2 }}
                              >
                                {keyword}
                              </motion.span>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                <motion.div 
                  className="keyword-density"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <h3><Zap size={20} /> Keyword Density by Category</h3>
                  <div className="density-chart">
                    {Object.entries(analysis.keyword_density).map(([category, density], index) => (
                      <motion.div 
                        key={category} 
                        className="density-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      >
                        <div className="density-label">{category.replace('_', ' ')}</div>
                        <div className="progress-bar">
                          <motion.div 
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((density as number) * 10, 100)}%` }}
                            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          />
                        </div>
                        <div className="density-value">{(density as number).toFixed(1)}%</div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'recommendations' && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="recommendations-tab"
              >
                {score.critical_issues.length > 0 && (
                  <motion.div 
                    className="critical-issues"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3><AlertTriangle size={20} /> Critical Issues</h3>
                    {score.critical_issues.map((issue: string, index: number) => (
                      <motion.div 
                        key={index} 
                        className="recommendation-item critical-issue"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ x: 4 }}
                      >
                        <AlertTriangle size={20} />
                        <div>
                          <strong>Critical:</strong> {issue}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                <motion.div 
                  className="recommendations"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h3><CheckCircle size={20} /> Improvement Recommendations</h3>
                  {score.recommendations.map((rec: string, index: number) => (
                    <motion.div 
                      key={index} 
                      className="recommendation-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                      whileHover={{ x: 4 }}
                    >
                      <CheckCircle size={20} />
                      <div>{rec}</div>
                    </motion.div>
                  ))}
                </motion.div>

                {score.ats_compatibility.issues.length > 0 && (
                  <motion.div 
                    className="ats-issues"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h3><HelpCircle size={20} /> ATS Compatibility Issues</h3>
                    {score.ats_compatibility.issues.map((issue: string, index: number) => (
                      <motion.div 
                        key={index} 
                        className="recommendation-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                        whileHover={{ x: 4 }}
                      >
                        <HelpCircle size={20} />
                        <div>{issue}</div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'ai-tools' && (
              <motion.div
                key="ai-tools"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="ai-tools-tab"
              >
                <div className="grid grid-2">
                  <motion.div 
                    className="ai-tool-card hover-lift"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="tool-header">
                      <MessageSquare size={24} className="tool-icon" />
                      <h3>Cover Letter Generator</h3>
                    </div>
                    <p>Generate a personalized cover letter based on your resume.</p>
                    <motion.button 
                      className="btn btn-primary"
                      onClick={generateCoverLetter}
                      disabled={generatingCoverLetter}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {generatingCoverLetter ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Zap size={16} />
                          </motion.div>
                          Generating...
                        </>
                      ) : (
                        'Generate Cover Letter'
                      )}
                    </motion.button>
                    
                    <AnimatePresence>
                      {coverLetter && (
                        <motion.div 
                          className="generated-content"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <h4>Generated Cover Letter:</h4>
                          <div className="content-box">
                            {coverLetter}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div 
                    className="ai-tool-card hover-lift"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="tool-header">
                      <HelpCircle size={24} className="tool-icon" />
                      <h3>Interview Questions</h3>
                    </div>
                    <p>Get potential interview questions based on your experience.</p>
                    <motion.button 
                      className="btn btn-primary"
                      onClick={generateInterviewQuestions}
                      disabled={generatingQuestions}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {generatingQuestions ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Zap size={16} />
                          </motion.div>
                          Generating...
                        </>
                      ) : (
                        'Generate Questions'
                      )}
                    </motion.button>
                    
                    <AnimatePresence>
                      {interviewQuestions.length > 0 && (
                        <motion.div 
                          className="generated-content"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <h4>Potential Interview Questions:</h4>
                          <div className="questions-list">
                            {interviewQuestions.map((question, index) => (
                              <motion.div 
                                key={index} 
                                className="question-item"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                              >
                                <strong>Q{index + 1}:</strong> {question}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <ExportPreview
        isOpen={showExportPreview}
        onClose={() => setShowExportPreview(false)}
        resumeData={data}
        onExport={(options) => {
          setShowExportPreview(false);
          exportResume(options);
        }}
        isExporting={exportingResume}
      />

      <style>{`
        .analysis-results {
          max-width: 1200px;
          margin: 0 auto;
        }

        .results-header {
          margin-bottom: 2rem;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-text h2 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          font-weight: 800;
        }

        .header-text p {
          color: var(--text-secondary);
          font-size: 1.1rem;
        }

        .export-btn {
          white-space: nowrap;
          position: relative;
          overflow: hidden;
        }

        .export-btn.loading {
          background: var(--primary-color);
          opacity: 0.8;
          cursor: not-allowed;
        }

        .export-btn.success {
          background: var(--success-color);
          color: white;
        }

        .export-btn.success::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer 0.6s ease-out;
        }

        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .results-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border-color);
          overflow-x: auto;
          padding-bottom: 0;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          border-radius: var(--border-radius) var(--border-radius) 0 0;
          cursor: pointer;
          transition: var(--transition);
          color: var(--text-secondary);
          font-weight: 600;
          position: relative;
          white-space: nowrap;
        }

        .tab-button:hover {
          color: var(--primary-color);
          background: var(--bg-secondary);
        }

        .tab-button.active {
          color: var(--primary-color);
          background: var(--bg-secondary);
        }

        .tab-indicator {
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--tab-color, var(--primary-color));
          border-radius: 2px;
        }

        .results-content {
          min-height: 500px;
        }

        .score-card {
          text-align: center;
          padding: 2.5rem;
          background: var(--bg-secondary);
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border-color);
          position: relative;
          overflow: hidden;
        }

        .score-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--gradient-primary);
        }

        .score-value {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
          line-height: 1;
        }

        .score-grade {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .score-label {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .section-scores {
          margin-top: 3rem;
        }

        .section-scores h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
          color: var(--text-primary);
          font-size: 1.5rem;
          font-weight: 700;
        }

        .score-breakdown {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .score-item {
          display: grid;
          grid-template-columns: 180px 1fr 60px;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
        }

        .score-label {
          font-weight: 600;
          color: var(--text-primary);
        }

        .score-number {
          text-align: right;
          font-weight: 700;
          color: var(--text-primary);
          font-size: 1.1rem;
        }

        .keyword-section {
          background: var(--bg-secondary);
          padding: 2rem;
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border-color);
        }

        .keyword-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
          font-size: 1.25rem;
          font-weight: 700;
        }

        .keyword-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .keyword-tag {
          padding: 0.5rem 1rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 25px;
          font-size: 0.875rem;
          font-weight: 500;
          transition: var(--transition);
          cursor: default;
        }

        .keyword-tag:hover {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .keyword-tag.missing {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          border: 1px dashed var(--border-color);
        }

        .keyword-category {
          margin-bottom: 1.5rem;
        }

        .keyword-category h4 {
          margin-bottom: 0.75rem;
          color: var(--text-primary);
          font-size: 0.95rem;
          font-weight: 600;
        }

        .keyword-density {
          margin-top: 3rem;
        }

        .keyword-density h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
          color: var(--text-primary);
          font-size: 1.5rem;
          font-weight: 700;
        }

        .density-chart {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .density-item {
          display: grid;
          grid-template-columns: 150px 1fr 60px;
          align-items: center;
          gap: 1.5rem;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
        }

        .density-label {
          font-weight: 600;
          color: var(--text-primary);
          text-transform: capitalize;
        }

        .density-value {
          text-align: right;
          font-weight: 700;
          color: var(--text-primary);
        }

        .critical-issues,
        .recommendations,
        .ats-issues {
          margin-bottom: 3rem;
        }

        .critical-issues h3,
        .recommendations h3,
        .ats-issues h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
          font-size: 1.5rem;
          font-weight: 700;
        }

        .recommendation-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-left: 4px solid var(--primary-color);
          border-radius: 0 var(--border-radius-lg) var(--border-radius-lg) 0;
          margin-bottom: 1rem;
          transition: var(--transition);
        }

        .recommendation-item:hover {
          background: var(--bg-primary);
          box-shadow: var(--shadow);
        }

        .critical-issue {
          border-left-color: var(--error-color);
          background: rgba(239, 68, 68, 0.05);
        }

        .ai-tool-card {
          background: var(--bg-secondary);
          padding: 2.5rem;
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .tool-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .tool-icon {
          color: var(--primary-color);
        }

        .ai-tool-card h3 {
          color: var(--text-primary);
          font-size: 1.25rem;
          font-weight: 700;
        }

        .ai-tool-card p {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .generated-content {
          overflow: hidden;
        }

        .generated-content h4 {
          margin-bottom: 1rem;
          color: var(--text-primary);
          font-weight: 600;
        }

        .content-box {
          background: var(--bg-primary);
          padding: 1.5rem;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
          white-space: pre-wrap;
          line-height: 1.6;
          max-height: 300px;
          overflow-y: auto;
        }

        .questions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .question-item {
          background: var(--bg-primary);
          padding: 1rem;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
          line-height: 1.5;
        }

        .analysis-placeholder {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-secondary);
        }

        .placeholder-icon {
          color: var(--primary-color);
          margin-bottom: 1rem;
          opacity: 0.7;
        }

        .analysis-placeholder h2 {
          margin-bottom: 1rem;
          color: var(--text-primary);
          font-size: 1.75rem;
        }

        .analysis-placeholder p {
          font-size: 1.1rem;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            align-items: stretch;
          }

          .results-tabs {
            flex-wrap: wrap;
          }

          .tab-button {
            flex: 1;
            min-width: 0;
            justify-content: center;
          }

          .score-item,
          .density-item {
            grid-template-columns: 1fr;
            gap: 1rem;
            text-align: center;
          }

          .grid-2,
          .grid-3 {
            grid-template-columns: 1fr;
          }

          .recommendation-item {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalysisResults;