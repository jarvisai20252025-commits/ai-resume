import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Eye, Settings, CheckCircle, FileText } from 'lucide-react';

interface ExportPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: any;
  onExport: (options: any) => void;
  isExporting: boolean;
}

const ExportPreview: React.FC<ExportPreviewProps> = ({
  isOpen,
  onClose,
  resumeData,
  onExport,
  isExporting
}) => {
  const [exportOptions, setExportOptions] = useState({
    includePhoto: false,
    colorScheme: 'professional',
    fontSize: 'medium',
    spacing: 'standard',
    includeKeywords: true,
    optimizeATS: true
  });

  const handleExport = () => {
    onExport(exportOptions);
  };

  if (!isOpen) return null;

  const { parsed_data } = resumeData;
  const contact = parsed_data?.contact || {};

  return (
    <AnimatePresence>
      <motion.div
        className="export-preview-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="export-preview-modal"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div className="header-content">
              <FileText size={24} className="header-icon" />
              <div>
                <h2>Export Professional Resume</h2>
                <p>Preview and customize your resume export</p>
              </div>
            </div>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            <div className="preview-section">
              <h3><Eye size={18} /> Resume Preview</h3>
              <div className="resume-preview">
                <div className="preview-header">
                  <h1 className="preview-name">{contact.name || 'Your Name'}</h1>
                  <div className="preview-contact">
                    {contact.email && <span>{contact.email}</span>}
                    {contact.phone && <span>{contact.phone}</span>}
                  </div>
                </div>

                {parsed_data?.summary && (
                  <div className="preview-section-block">
                    <h4>PROFESSIONAL SUMMARY</h4>
                    <p>{parsed_data.summary}</p>
                  </div>
                )}

                {parsed_data?.experience?.length > 0 && (
                  <div className="preview-section-block">
                    <h4>PROFESSIONAL EXPERIENCE</h4>
                    {parsed_data.experience.slice(0, 2).map((job: any, index: number) => (
                      <div key={index} className="preview-job">
                        <h5>{job.title}</h5>
                        <p>{job.description?.substring(0, 150)}...</p>
                      </div>
                    ))}
                  </div>
                )}

                {parsed_data?.skills?.length > 0 && (
                  <div className="preview-section-block">
                    <h4>CORE COMPETENCIES</h4>
                    <div className="preview-skills">
                      {parsed_data.skills.slice(0, 8).map((skill: string, index: number) => (
                        <span key={index} className="preview-skill">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="options-section">
              <h3><Settings size={18} /> Export Options</h3>
              
              <div className="option-group">
                <label className="option-label">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeKeywords}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      includeKeywords: e.target.checked
                    }))}
                  />
                  <span className="checkmark"></span>
                  Include optimized keywords
                </label>
                <p className="option-description">Enhance your resume with industry-relevant keywords</p>
              </div>

              <div className="option-group">
                <label className="option-label">
                  <input
                    type="checkbox"
                    checked={exportOptions.optimizeATS}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      optimizeATS: e.target.checked
                    }))}
                  />
                  <span className="checkmark"></span>
                  ATS-friendly formatting
                </label>
                <p className="option-description">Optimize layout for Applicant Tracking Systems</p>
              </div>

              <div className="option-group">
                <label className="select-label">Color Scheme</label>
                <select
                  value={exportOptions.colorScheme}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    colorScheme: e.target.value
                  }))}
                  className="option-select"
                >
                  <option value="professional">Professional Blue</option>
                  <option value="classic">Classic Black</option>
                  <option value="modern">Modern Gray</option>
                </select>
              </div>

              <div className="option-group">
                <label className="select-label">Font Size</label>
                <select
                  value={exportOptions.fontSize}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    fontSize: e.target.value
                  }))}
                  className="option-select"
                >
                  <option value="small">Small (10pt)</option>
                  <option value="medium">Medium (11pt)</option>
                  <option value="large">Large (12pt)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <motion.button
              className={`btn btn-primary ${isExporting ? 'loading' : ''}`}
              onClick={handleExport}
              disabled={isExporting}
              whileHover={!isExporting ? { scale: 1.02 } : {}}
              whileTap={!isExporting ? { scale: 0.98 } : {}}
            >
              {isExporting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Download size={16} />
                  </motion.div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Export Resume
                </>
              )}
            </motion.button>
          </div>

          <style>{`
            .export-preview-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.7);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
              padding: 2rem;
            }

            .export-preview-modal {
              background: var(--bg-primary);
              border-radius: var(--border-radius-lg);
              border: 1px solid var(--border-color);
              max-width: 1000px;
              width: 100%;
              max-height: 90vh;
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }

            .modal-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 2rem;
              border-bottom: 1px solid var(--border-color);
              background: var(--bg-secondary);
            }

            .header-content {
              display: flex;
              align-items: center;
              gap: 1rem;
            }

            .header-icon {
              color: var(--primary-color);
            }

            .modal-header h2 {
              margin: 0;
              color: var(--text-primary);
              font-size: 1.5rem;
              font-weight: 700;
            }

            .modal-header p {
              margin: 0;
              color: var(--text-secondary);
              font-size: 0.9rem;
            }

            .close-btn {
              background: none;
              border: none;
              color: var(--text-secondary);
              cursor: pointer;
              padding: 0.5rem;
              border-radius: var(--border-radius);
              transition: var(--transition);
            }

            .close-btn:hover {
              background: var(--bg-tertiary);
              color: var(--text-primary);
            }

            .modal-body {
              display: grid;
              grid-template-columns: 1fr 350px;
              gap: 2rem;
              padding: 2rem;
              overflow-y: auto;
              flex: 1;
            }

            .preview-section h3,
            .options-section h3 {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              margin-bottom: 1.5rem;
              color: var(--text-primary);
              font-size: 1.1rem;
              font-weight: 600;
            }

            .resume-preview {
              background: white;
              color: #333;
              padding: 2rem;
              border-radius: var(--border-radius);
              border: 1px solid var(--border-color);
              font-family: 'Times New Roman', serif;
              line-height: 1.4;
              box-shadow: var(--shadow);
              max-height: 600px;
              overflow-y: auto;
            }

            .preview-header {
              text-align: center;
              margin-bottom: 2rem;
              padding-bottom: 1rem;
              border-bottom: 2px solid #2c3e50;
            }

            .preview-name {
              font-size: 1.8rem;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 0.5rem;
            }

            .preview-contact {
              display: flex;
              justify-content: center;
              gap: 1rem;
              font-size: 0.9rem;
              color: #555;
            }

            .preview-section-block {
              margin-bottom: 1.5rem;
            }

            .preview-section-block h4 {
              font-size: 1rem;
              font-weight: bold;
              color: #2c3e50;
              margin-bottom: 0.75rem;
              padding-bottom: 0.25rem;
              border-bottom: 1px solid #bdc3c7;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .preview-job {
              margin-bottom: 1rem;
            }

            .preview-job h5 {
              font-weight: bold;
              color: #2980b9;
              margin-bottom: 0.25rem;
            }

            .preview-job p {
              font-size: 0.85rem;
              line-height: 1.4;
              color: #555;
            }

            .preview-skills {
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem;
            }

            .preview-skill {
              background: #ecf0f1;
              color: #2c3e50;
              padding: 0.25rem 0.75rem;
              border-radius: 15px;
              font-size: 0.8rem;
              font-weight: 500;
            }

            .options-section {
              background: var(--bg-secondary);
              padding: 1.5rem;
              border-radius: var(--border-radius);
              border: 1px solid var(--border-color);
              height: fit-content;
            }

            .option-group {
              margin-bottom: 1.5rem;
            }

            .option-label {
              display: flex;
              align-items: center;
              gap: 0.75rem;
              cursor: pointer;
              font-weight: 500;
              color: var(--text-primary);
            }

            .option-label input[type="checkbox"] {
              display: none;
            }

            .checkmark {
              width: 20px;
              height: 20px;
              border: 2px solid var(--border-color);
              border-radius: 4px;
              position: relative;
              transition: var(--transition);
            }

            .option-label input[type="checkbox"]:checked + .checkmark {
              background: var(--primary-color);
              border-color: var(--primary-color);
            }

            .option-label input[type="checkbox"]:checked + .checkmark::after {
              content: '✓';
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              color: white;
              font-size: 12px;
              font-weight: bold;
            }

            .option-description {
              margin-top: 0.5rem;
              font-size: 0.85rem;
              color: var(--text-secondary);
              line-height: 1.4;
            }

            .select-label {
              display: block;
              margin-bottom: 0.5rem;
              font-weight: 500;
              color: var(--text-primary);
            }

            .option-select {
              width: 100%;
              padding: 0.75rem;
              border: 1px solid var(--border-color);
              border-radius: var(--border-radius);
              background: var(--bg-primary);
              color: var(--text-primary);
              font-size: 0.9rem;
            }

            .modal-footer {
              display: flex;
              justify-content: flex-end;
              gap: 1rem;
              padding: 2rem;
              border-top: 1px solid var(--border-color);
              background: var(--bg-secondary);
            }

            @media (max-width: 768px) {
              .export-preview-overlay {
                padding: 1rem;
              }

              .modal-body {
                grid-template-columns: 1fr;
                gap: 1.5rem;
              }

              .preview-contact {
                flex-direction: column;
                gap: 0.25rem;
              }

              .modal-footer {
                flex-direction: column;
              }
            }
          `}</style>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExportPreview;