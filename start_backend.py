#!/usr/bin/env python3
import subprocess
import sys
import os

def install_requirements():
    """Install Python requirements"""
    print("Installing Python requirements...")
    subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], check=True)

def download_spacy_model():
    """Download spaCy English model"""
    print("Downloading spaCy English model...")
    subprocess.run([sys.executable, "-m", "spacy", "download", "en_core_web_sm"], check=True)

def start_server():
    """Start the FastAPI server"""
    print("Starting FastAPI server...")
    os.chdir("backend")
    subprocess.run([
        sys.executable, "-m", "uvicorn", "main:app", 
        "--reload", "--host", "0.0.0.0", "--port", "8000"
    ])

if __name__ == "__main__":
    try:
        install_requirements()
        download_spacy_model()
        start_server()
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nServer stopped.")