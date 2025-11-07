import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Loader, CheckCircle, AlertCircle, Zap, Brain, Target } from 'lucide-react';
import axios from 'axios';

interface ResumeUploadProps {
  onAnalysisComplete: (data: any) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onAnalysisComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://localhost:8000/api/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onAnalysisComplete(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload and analyze resume');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: uploading
  });

  return (
    <div className="resume-upload">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="gradient-text">Upload Your Resume</h2>
        <p className="text-secondary">
          Upload your resume in PDF or DOCX format for AI-powered analysis and optimization.
        </p>

        <div
          {...getRootProps()}
          className={`upload-zone ${isDragActive ? 'drag-active' : ''}`}
        >
          <input {...getInputProps()} />
          
          <AnimatePresence mode="wait">
            {uploading ? (
              <motion.div 
                key="uploading"
                className="upload-content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Zap size={48} className="upload-spinner" />
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Analyzing Resume...
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Please wait while we process your resume
                </motion.p>
                <motion.div 
                  className="upload-progress"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="idle"
                className="upload-content"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                {isDragActive ? (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="upload-active-state"
                  >
                    <motion.div
                      animate={{ y: [-5, 5, -5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Upload size={48} className="upload-icon-active" />
                    </motion.div>
                    <h3>Drop your resume here</h3>
                  </motion.div>
                ) : (
                  <motion.div className="upload-idle-state">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <FileText size={48} className="upload-icon" />
                    </motion.div>
                    <h3>Drag & drop your resume here</h3>
                    <p>or click to browse files</p>
                    <motion.div 
                      className="supported-formats"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <CheckCircle size={16} />
                      <span>Supported formats: PDF, DOCX</span>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="error-message"
              transition={{ duration: 0.3 }}
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          className="upload-features"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="gradient-text">What happens next?</h3>
          <div className="feature-list">
            {[
              { icon: FileText, title: 'Resume Parsing', desc: 'Extract and structure your resume content', color: '#06b6d4' },
              { icon: Brain, title: 'AI Analysis', desc: 'Analyze keywords, skills, and ATS compatibility', color: '#6366f1' },
              { icon: Target, title: 'Scoring & Recommendations', desc: 'Get detailed feedback and improvement suggestions', color: '#10b981' }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={feature.title}
                  className="feature-item hover-lift"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div 
                    className="feature-icon-wrapper"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Icon size={24} style={{ color: feature.color }} />
                  </motion.div>
                  <div>
                    <h4>{feature.title}</h4>
                    <p>{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      <style>{`
        .resume-upload {
          max-width: 900px;
          margin: 0 auto;
        }

        .resume-upload h2 {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
          font-weight: 800;
          text-align: center;
        }

        .text-secondary {
          color: var(--text-secondary);
          margin-bottom: 3rem;
          font-size: 1.2rem;
          text-align: center;
          line-height: 1.6;
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          color: var(--text-secondary);
        }

        .upload-content h3 {
          font-size: 1.5rem;
          color: var(--text-primary);
          font-weight: 700;
        }

        .upload-content p {
          font-size: 1.1rem;
          opacity: 0.8;
        }

        .upload-icon {
          color: var(--primary-color);
          filter: drop-shadow(0 4px 8px rgba(99, 102, 241, 0.2));
        }

        .upload-icon-active {
          color: var(--success-color);
          filter: drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3));
        }

        .upload-spinner {
          color: var(--primary-color);
          filter: drop-shadow(0 4px 8px rgba(99, 102, 241, 0.3));
        }

        .upload-progress {
          height: 4px;
          background: var(--gradient-primary);
          border-radius: 2px;
          margin-top: 1rem;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
        }

        .supported-formats {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-lg);
          font-size: 0.95rem;
          font-weight: 500;
          box-shadow: var(--shadow-sm);
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1.5rem;
          padding: 1.25rem;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--border-radius-lg);
          color: var(--error-color);
          font-weight: 500;
        }

        .upload-features {
          margin-top: 4rem;
        }

        .upload-features h3 {
          margin-bottom: 2rem;
          color: var(--text-primary);
          font-size: 1.75rem;
          font-weight: 700;
          text-align: center;
        }

        .feature-list {
          display: grid;
          gap: 2rem;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        }

        .feature-item {
          display: flex;
          gap: 1.25rem;
          padding: 2rem;
          background: var(--bg-secondary);
          border-radius: var(--border-radius-lg);
          border: 1px solid var(--border-color);
          position: relative;
          overflow: hidden;
        }

        .feature-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--gradient-primary);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .feature-item:hover::before {
          transform: scaleX(1);
        }

        .feature-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: var(--bg-primary);
          border-radius: var(--border-radius);
          flex-shrink: 0;
          box-shadow: var(--shadow-sm);
        }

        .feature-item h4 {
          margin-bottom: 0.75rem;
          color: var(--text-primary);
          font-size: 1.1rem;
          font-weight: 600;
        }

        .feature-item p {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .resume-upload h2 {
            font-size: 2rem;
          }
          
          .text-secondary {
            font-size: 1.1rem;
          }
          
          .upload-content h3 {
            font-size: 1.25rem;
          }
          
          .feature-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ResumeUpload;