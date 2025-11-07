from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import os
from typing import List, Dict, Any
import json
from datetime import datetime

from resume_parser import ResumeParser
from nlp_analyzer import NLPAnalyzer
from scoring_engine import ScoringEngine
from ai_generator import AIGenerator

app = FastAPI(title="AI Resume Builder & Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
parser = ResumeParser()
analyzer = NLPAnalyzer()
scorer = ScoringEngine()
ai_gen = AIGenerator()

# Ensure directories exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("exports", exist_ok=True)
os.makedirs("storage", exist_ok=True)

@app.post("/api/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(('.pdf', '.docx')):
        raise HTTPException(400, "Only PDF and DOCX files supported")
    
    file_path = f"uploads/{file.filename}"
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Parse resume
    parsed_data = parser.parse_resume(file_path)
    
    # Analyze with NLP
    analysis = analyzer.analyze_resume(parsed_data)
    
    # Score resume
    score_data = scorer.score_resume(parsed_data, analysis)
    
    # Save version
    version_id = save_resume_version(parsed_data, analysis, score_data)
    
    return {
        "version_id": version_id,
        "parsed_data": parsed_data,
        "analysis": analysis,
        "score": score_data
    }

@app.post("/api/analyze-text")
async def analyze_text_resume(resume_data: Dict[str, Any]):
    # Analyze text-based resume
    analysis = analyzer.analyze_resume(resume_data)
    score_data = scorer.score_resume(resume_data, analysis)
    
    version_id = save_resume_version(resume_data, analysis, score_data)
    
    return {
        "version_id": version_id,
        "analysis": analysis,
        "score": score_data
    }

@app.post("/api/generate-cover-letter")
async def generate_cover_letter(data: Dict[str, Any]):
    try:
        cover_letter = await ai_gen.generate_cover_letter(
            data.get("resume_data"),
            data.get("job_description", "")
        )
        return {"cover_letter": cover_letter}
    except Exception as e:
        return {"cover_letter": "Unable to generate cover letter at this time. Please try again later."}

@app.get("/api/export-resume/{version_id}")
async def export_resume_get(version_id: str):
    """GET endpoint for direct resume export without optimizations"""
    return await export_resume(version_id)

@app.post("/api/generate-interview-questions")
async def generate_interview_questions(resume_data: Dict[str, Any]):
    questions = await ai_gen.generate_interview_questions(resume_data)
    return {"questions": questions}

@app.get("/api/resume-versions")
async def get_resume_versions():
    versions_file = "storage/versions.json"
    if os.path.exists(versions_file):
        with open(versions_file, 'r') as f:
            return json.load(f)
    return []

@app.post("/api/export-resume/{version_id}")
async def export_resume(version_id: str, optimizations: Dict[str, Any]):
    # Load version data
    versions = load_versions()
    version_data = next((v for v in versions if v["id"] == version_id), None)
    
    if not version_data:
        raise HTTPException(404, "Version not found")
    
    # Apply optimizations and export
    export_path = f"exports/resume_{version_id}.pdf"
    parser.export_optimized_resume(version_data, optimizations, export_path)
    
    return FileResponse(export_path, filename=f"optimized_resume_{version_id}.pdf")

def save_resume_version(parsed_data, analysis, score_data):
    version_id = f"v_{int(datetime.now().timestamp())}"
    
    version_data = {
        "id": version_id,
        "timestamp": datetime.now().isoformat(),
        "parsed_data": parsed_data,
        "analysis": analysis,
        "score": score_data
    }
    
    versions = load_versions()
    versions.append(version_data)
    
    with open("storage/versions.json", 'w') as f:
        json.dump(versions, f, indent=2)
    
    return version_id

def load_versions():
    versions_file = "storage/versions.json"
    if os.path.exists(versions_file):
        with open(versions_file, 'r') as f:
            return json.load(f)
    return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)