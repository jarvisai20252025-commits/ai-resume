import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save } from 'lucide-react';
import axios from 'axios';

interface ResumeBuilderProps {
  onAnalysisComplete: (data: any) => void;
}

interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ onAnalysisComplete }) => {
  const [formData, setFormData] = useState({
    contact: {
      name: '',
      email: '',
      phone: '',
      location: ''
    },
    summary: '',
    experience: [] as Experience[],
    education: [] as Education[],
    skills: [] as string[]
  });

  const [newSkill, setNewSkill] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { title: '', company: '', duration: '', description: '' }]
    }));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: '' }]
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);

    try {
      const response = await axios.post('http://localhost:8000/api/analyze-text', formData);
      onAnalysisComplete(response.data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="resume-builder">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2>Build Your Resume</h2>
        <p className="text-secondary">
          Create your resume from scratch using our interactive form builder.
        </p>

        <form onSubmit={handleSubmit} className="resume-form">
          {/* Contact Information */}
          <section className="form-section">
            <h3>Contact Information</h3>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.contact.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, name: e.target.value }
                  }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.contact.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, email: e.target.value }
                  }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.contact.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, phone: e.target.value }
                  }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.contact.location}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, location: e.target.value }
                  }))}
                />
              </div>
            </div>
          </section>

          {/* Professional Summary */}
          <section className="form-section">
            <h3>Professional Summary</h3>
            <div className="form-group">
              <textarea
                className="form-input form-textarea"
                placeholder="Write a compelling professional summary..."
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              />
            </div>
          </section>

          {/* Experience */}
          <section className="form-section">
            <div className="section-header">
              <h3>Work Experience</h3>
              <button type="button" className="btn btn-secondary" onClick={addExperience}>
                <Plus size={16} />
                Add Experience
              </button>
            </div>
            
            {formData.experience.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="experience-item"
              >
                <div className="item-header">
                  <h4>Experience {index + 1}</h4>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => removeExperience(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={exp.title}
                      onChange={(e) => updateExperience(index, 'title', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company</label>
                    <input
                      type="text"
                      className="form-input"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Jan 2020 - Present"
                    value={exp.duration}
                    onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Describe your responsibilities and achievements..."
                    value={exp.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  />
                </div>
              </motion.div>
            ))}
          </section>

          {/* Education */}
          <section className="form-section">
            <div className="section-header">
              <h3>Education</h3>
              <button type="button" className="btn btn-secondary" onClick={addEducation}>
                <Plus size={16} />
                Add Education
              </button>
            </div>
            
            {formData.education.map((edu, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="education-item"
              >
                <div className="item-header">
                  <h4>Education {index + 1}</h4>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => removeEducation(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Degree</label>
                    <input
                      type="text"
                      className="form-input"
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Institution</label>
                    <input
                      type="text"
                      className="form-input"
                      value={edu.institution}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., 2020"
                    value={edu.year}
                    onChange={(e) => updateEducation(index, 'year', e.target.value)}
                  />
                </div>
              </motion.div>
            ))}
          </section>

          {/* Skills */}
          <section className="form-section">
            <h3>Skills</h3>
            <div className="skills-input">
              <input
                type="text"
                className="form-input"
                placeholder="Add a skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <button type="button" className="btn btn-secondary" onClick={addSkill}>
                Add
              </button>
            </div>
            
            <div className="skills-list">
              {formData.skills.map((skill, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="skill-tag"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="skill-remove"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
            </div>
          </section>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Analyze Resume'}
              <Save size={16} />
            </button>
          </div>
        </form>
      </motion.div>

      <style>{`
        .resume-builder {
          max-width: 900px;
          margin: 0 auto;
        }

        .resume-builder h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .text-secondary {
          color: var(--text-secondary);
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }

        .resume-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-section {
          background: var(--bg-secondary);
          padding: 2rem;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
        }

        .form-section h3 {
          margin-bottom: 1.5rem;
          color: var(--text-primary);
          font-size: 1.25rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .experience-item,
        .education-item {
          background: var(--bg-primary);
          padding: 1.5rem;
          border-radius: var(--border-radius);
          border: 1px solid var(--border-color);
          margin-bottom: 1rem;
        }

        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .item-header h4 {
          color: var(--text-primary);
        }

        .btn-icon {
          background: none;
          border: none;
          color: var(--error-color);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: var(--border-radius);
          transition: var(--transition);
        }

        .btn-icon:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .skills-input {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .skills-input .form-input {
          flex: 1;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .skill-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--primary-color);
          color: white;
          border-radius: 20px;
          font-size: 0.875rem;
        }

        .skill-remove {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 1.2rem;
          line-height: 1;
        }

        .form-actions {
          display: flex;
          justify-content: center;
          padding-top: 2rem;
        }
      `}</style>
    </div>
  );
};

export default ResumeBuilder;