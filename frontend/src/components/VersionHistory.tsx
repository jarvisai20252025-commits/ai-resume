import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Download, Eye } from 'lucide-react';
import axios from 'axios';

interface Version {
  id: string;
  timestamp: string;
  parsed_data: any;
  analysis: any;
  score: any;
}

const VersionHistory: React.FC = () => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/resume-versions');
      setVersions(response.data);
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportVersion = async (versionId: string) => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/export-resume/${versionId}`,
        {},
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume_${versionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export version:', error);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--success-color)';
    if (score >= 60) return 'var(--warning-color)';
    return 'var(--error-color)';
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading version history...</p>
      </div>
    );
  }

  return (
    <div className="version-history">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Resume Version History</h2>
        <p className="text-secondary">
          Track and manage different versions of your resume with their analysis results.
        </p>

        {versions.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} />
            <h3>No Resume Versions Yet</h3>
            <p>Upload or create a resume to start tracking versions.</p>
          </div>
        ) : (
          <div className="versions-container">
            <div className="versions-list">
              {versions.map((version, index) => (
                <motion.div
                  key={version.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`version-card ${selectedVersion?.id === version.id ? 'selected' : ''}`}
                  onClick={() => setSelectedVersion(version)}
                >
                  <div className="version-header">
                    <div className="version-info">
                      <h3>Version {versions.length - index}</h3>
                      <p className="version-date">{formatDate(version.timestamp)}</p>
                    </div>
                    <div className="version-score">
                      <div 
                        className="score-badge"
                        style={{ backgroundColor: getScoreColor(version.score.total_score) }}
                      >
                        {version.score.total_score}
                      </div>
                      <span className="score-grade">{version.score.grade}</span>
                    </div>
                  </div>

                  <div className="version-summary">
                    <div className="summary-item">
                      <span>ATS Score:</span>
                      <span>{version.score.ats_compatibility.score}</span>
                    </div>
                    <div className="summary-item">
                      <span>Skills Match:</span>
                      <span>{Math.round(version.analysis.skills_match.match_percentage)}%</span>
                    </div>
                    <div className="summary-item">
                      <span>Keywords:</span>
                      <span>{version.analysis.keywords.length}</span>
                    </div>
                  </div>

                  <div className="version-actions">
                    <button
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVersion(version);
                      }}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportVersion(version.id);
                      }}
                      title="Export PDF"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {selectedVersion && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="version-details"
              >
                <div className="details-header">
                  <h3>Version Details</h3>
                  <button
                    className="btn btn-primary"
                    onClick={() => exportVersion(selectedVersion.id)}
                  >
                    <Download size={16} />
                    Export This Version
                  </button>
                </div>

                <div className="details-content">
                  <div className="detail-section">
                    <h4>Contact Information</h4>
                    <div className="contact-info">
                      <p><strong>Name:</strong> {selectedVersion.parsed_data.contact?.name || 'N/A'}</p>
                      <p><strong>Email:</strong> {selectedVersion.parsed_data.contact?.email || 'N/A'}</p>
                      <p><strong>Phone:</strong> {selectedVersion.parsed_data.contact?.phone || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Professional Summary</h4>
                    <div className="summary-text">
                      {selectedVersion.parsed_data.summary || 'No summary provided'}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Experience</h4>
                    <div className="experience-list">
                      {selectedVersion.parsed_data.experience?.length > 0 ? (
                        selectedVersion.parsed_data.experience.map((exp: any, index: number) => (
                          <div key={index} className="experience-item">
                            <h5>{exp.title || 'Position'}</h5>
                            <p className="company">{exp.company || 'Company'}</p>
                            <p className="description">{exp.description || 'No description'}</p>
                          </div>
                        ))
                      ) : (
                        <p>No experience listed</p>
                      )}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Skills</h4>
                    <div className="skills-list">
                      {selectedVersion.parsed_data.skills?.length > 0 ? (
                        selectedVersion.parsed_data.skills.map((skill: string, index: number) => (
                          <span key={index} className="skill-tag">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p>No skills listed</p>
                      )}
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Analysis Summary</h4>
                    <div className="analysis-summary">
                      <div className="analysis-item">
                        <span>Total Score:</span>
                        <span style={{ color: getScoreColor(selectedVersion.score.total_score) }}>
                          {selectedVersion.score.total_score} ({selectedVersion.score.grade})
                        </span>
                      </div>
                      <div className="analysis-item">
                        <span>ATS Compatibility:</span>
                        <span>{selectedVersion.score.ats_compatibility.level}</span>
                      </div>
                      <div className="analysis-item">
                        <span>Critical Issues:</span>
                        <span>{selectedVersion.score.critical_issues.length}</span>
                      </div>
                      <div className="analysis-item">
                        <span>Recommendations:</span>
                        <span>{selectedVersion.score.recommendations.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>

      <style>{`
        .version-history {
          max-width: 1200px;
          margin: 0 auto;
        }

        .version-history h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .text-secondary {
          color: var(--text-secondary);
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          color: var(--text-secondary);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color);
          border-top: 3px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          color: var(--text-secondary);
          text-align: center;
        }

        .empty-state h3 {
          margin: 1rem 0 0.5rem;
          color: var(--text-primary);
        }

        .versions-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .versions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .version-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: 1.5rem;
          cursor: pointer;
          transition: var(--transition);
        }

        .version-card:hover {
          border-color: var(--primary-color);
          box-shadow: var(--shadow);
        }

        .version-card.selected {
          border-color: var(--primary-color);
          background: var(--bg-primary);
        }

        .version-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .version-info h3 {
          margin: 0 0 0.25rem;
          color: var(--text-primary);
        }

        .version-date {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin: 0;
        }

        .version-score {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .score-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .score-grade {
          font-weight: 600;
          color: var(--text-primary);
        }

        .version-summary {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .summary-item span:first-child {
          color: var(--text-secondary);
        }

        .summary-item span:last-child {
          color: var(--text-primary);
          font-weight: 500;
        }

        .version-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .action-btn {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: 0.5rem;
          cursor: pointer;
          transition: var(--transition);
          color: var(--text-primary);
        }

        .action-btn:hover {
          background: var(--primary-color);
          color: white;
        }

        .version-details {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          padding: 2rem;
          max-height: 80vh;
          overflow-y: auto;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .details-header h3 {
          margin: 0;
          color: var(--text-primary);
        }

        .details-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .detail-section h4 {
          margin: 0 0 1rem;
          color: var(--text-primary);
          font-size: 1.1rem;
        }

        .contact-info p,
        .summary-text,
        .experience-list p,
        .analysis-summary {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .experience-item {
          background: var(--bg-secondary);
          padding: 1rem;
          border-radius: var(--border-radius);
          margin-bottom: 1rem;
        }

        .experience-item h5 {
          margin: 0 0 0.25rem;
          color: var(--text-primary);
        }

        .company {
          font-weight: 500;
          color: var(--primary-color);
          margin: 0 0 0.5rem;
        }

        .description {
          margin: 0;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag {
          padding: 0.25rem 0.75rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .analysis-summary {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .analysis-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border-color);
        }

        .analysis-item span:first-child {
          font-weight: 500;
          color: var(--text-primary);
        }

        .analysis-item span:last-child {
          color: var(--text-secondary);
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .versions-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default VersionHistory;