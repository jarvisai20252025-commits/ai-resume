# AI Resume Builder & Analyzer

A comprehensive web application that helps users create, upload, and analyze resumes using AI-powered tools. The app provides ATS compatibility scoring, keyword optimization, and generates cover letters and interview questions.

## 🚀 Features

### Core Features
- **Resume Upload & Parsing**: Support for PDF and DOCX files with intelligent text extraction
- **Interactive Resume Builder**: Form-based resume creation with real-time validation
- **AI-Powered Analysis**: NLP-based keyword extraction and skills matching
- **ATS Compatibility Scoring**: Comprehensive scoring system for resume optimization
- **Version Control**: Track and manage multiple resume versions with timestamps

### Advanced Features
- **Cover Letter Generator**: AI-generated personalized cover letters using Gemini API
- **Interview Questions**: Generate relevant interview questions based on resume content
- **Dark/Light Theme**: Professional UI with smooth theme transitions
- **Responsive Design**: Mobile-friendly interface with animations
- **Export Functionality**: Download optimized resumes as PDF

## 🛠 Tech Stack

### Backend
- **FastAPI**: Modern Python web framework for APIs
- **spaCy**: Advanced NLP library for text processing
- **PyMuPDF**: PDF parsing and manipulation
- **python-docx**: DOCX file processing
- **scikit-learn**: Machine learning for TF-IDF and similarity analysis
- **Google Generative AI**: Gemini API for content generation
- **ReportLab**: PDF generation for exports

### Frontend
- **React 18**: Modern React with TypeScript
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful icon library
- **React Dropzone**: Drag-and-drop file uploads
- **Axios**: HTTP client for API communication

## 📋 Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **npm or yarn**
- **Gemini API Key** (for AI features)

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Ai resume Builder"
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Add your Gemini API key to .env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Backend Setup
```bash
# Option 1: Use the automated setup script
python3 start_backend.py

# Option 2: Manual setup
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Frontend Setup
```bash
# Option 1: Use the automated setup script
./start_frontend.sh

# Option 2: Manual setup
cd frontend
npm install
npm start
```

## 🌐 Usage

1. **Start the Backend**: Run `python3 start_backend.py` or manually start the FastAPI server
2. **Start the Frontend**: Run `./start_frontend.sh` or manually start the React development server
3. **Access the Application**: Open http://localhost:3000 in your browser
4. **API Documentation**: Available at http://localhost:8000/docs

### Application Workflow

1. **Upload Resume**: Drag and drop PDF/DOCX files or use the file picker
2. **Build Resume**: Use the interactive form builder to create resumes from scratch
3. **Analysis**: View comprehensive analysis including:
   - Overall ATS compatibility score
   - Keyword density analysis
   - Skills matching against industry standards
   - Section-by-section breakdown
   - Improvement recommendations
4. **AI Tools**: Generate cover letters and interview questions
5. **Export**: Download optimized resume as PDF
6. **Version Management**: Track and compare different resume versions

## 📊 Analysis Features

### Scoring System
- **Contact Information** (15%): Completeness of contact details
- **Professional Summary** (10%): Quality and length of summary
- **Work Experience** (25%): Detailed job descriptions and achievements
- **Education** (15%): Educational background completeness
- **Skills** (20%): Relevant skills and industry matching
- **Keyword Density** (10%): Optimization for ATS systems
- **Formatting** (5%): Structure and readability

### NLP Analysis
- **TF-IDF Keyword Extraction**: Identifies most important terms
- **Skills Matching**: Compares against curated job market keywords
- **Readability Assessment**: Analyzes sentence structure and complexity
- **Missing Keywords Detection**: Suggests relevant terms to add

## 🎨 UI Features

### Theme System
- **Light Theme**: Clean, professional appearance (default)
- **Dark Theme**: Eye-friendly dark mode
- **Smooth Transitions**: Animated theme switching
- **Persistent Settings**: Theme preference saved locally

### Animations
- **Page Transitions**: Smooth slide animations between tabs
- **Loading States**: Engaging loading indicators
- **Hover Effects**: Interactive button and card animations
- **Progress Bars**: Animated score visualizations

## 🔌 API Endpoints

### Core Endpoints
- `POST /api/upload-resume`: Upload and analyze resume files
- `POST /api/analyze-text`: Analyze text-based resume data
- `GET /api/resume-versions`: Retrieve version history
- `POST /api/export-resume/{version_id}`: Export optimized resume

### AI Endpoints
- `POST /api/generate-cover-letter`: Generate personalized cover letter
- `POST /api/generate-interview-questions`: Generate relevant interview questions

## 📁 Project Structure

```
Ai resume Builder/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── resume_parser.py     # PDF/DOCX parsing logic
│   ├── nlp_analyzer.py      # NLP analysis engine
│   ├── scoring_engine.py    # ATS scoring system
│   └── ai_generator.py      # AI content generation
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.tsx         # Main application
│   │   └── App.css         # Styling and themes
│   └── public/             # Static assets
├── requirements.txt        # Python dependencies
├── .env.example           # Environment template
├── start_backend.py       # Backend startup script
├── start_frontend.sh      # Frontend startup script
└── README.md             # This file
```

## 🔒 Security & Privacy

- **Local Storage**: All resume data stored locally
- **No Data Persistence**: Files are processed and removed after analysis
- **API Key Security**: Gemini API key stored in environment variables
- **CORS Protection**: Configured for localhost development

## 🚀 Deployment

### Backend Deployment
```bash
# Production server
uvicorn main:app --host 0.0.0.0 --port 8000

# With Gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve static files
npx serve -s build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **spaCy Model Error**: Run `python -m spacy download en_core_web_sm`
2. **Port Already in Use**: Change ports in startup scripts or kill existing processes
3. **CORS Errors**: Ensure backend is running on port 8000 and frontend on port 3000
4. **Gemini API Errors**: Verify API key is correctly set in .env file

### Support

For issues and questions:
1. Check the troubleshooting section above
2. Review API documentation at http://localhost:8000/docs
3. Create an issue in the repository

## 🎯 Future Enhancements

- [ ] Multi-language support
- [ ] Advanced resume templates
- [ ] LinkedIn integration
- [ ] Job matching recommendations
- [ ] Collaborative editing
- [ ] Resume analytics dashboard
- [ ] Mobile app development

---

**Built with ❤️ using FastAPI, React, and AI**