import google.generativeai as genai
import os
from dotenv import load_dotenv
from typing import Dict, Any, List

load_dotenv()

class AIGenerator:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
        else:
            self.model = None
    
    async def generate_cover_letter(self, resume_data: Dict[str, Any], job_description: str = "") -> str:
        if not self.model:
            return "Please configure GEMINI_API_KEY to use AI generation features."
        
        try:
            prompt = self._build_cover_letter_prompt(resume_data, job_description)
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            return f"Error generating cover letter: {str(e)}"
    
    async def generate_interview_questions(self, resume_data: Dict[str, Any]) -> List[str]:
        if not self.model:
            return ["Please configure GEMINI_API_KEY to use AI generation features."]
        
        try:
            prompt = self._build_interview_questions_prompt(resume_data)
            response = self.model.generate_content(prompt)
            
            # Parse response into list of questions
            questions = [q.strip() for q in response.text.split('\n') if q.strip() and '?' in q]
            return questions[:10]  # Return top 10 questions
        except Exception as e:
            return [f"Error generating questions: {str(e)}"]
    
    def _build_cover_letter_prompt(self, resume_data: Dict[str, Any], job_description: str) -> str:
        if not resume_data:
            resume_data = {}
        contact = resume_data.get('contact', {})
        experience = resume_data.get('experience', [])
        skills = resume_data.get('skills', [])
        summary = resume_data.get('summary', '')
        
        prompt = f"""
        Write a professional cover letter based on the following resume information:
        
        Name: {contact.get('name', 'Applicant')}
        Summary: {summary}
        
        Key Experience:
        """
        
        for exp in experience[:3]:  # Top 3 experiences
            prompt += f"- {exp.get('title', 'Position')}: {exp.get('description', '')[:200]}...\n"
        
        prompt += f"\nKey Skills: {', '.join(skills[:10])}\n"
        
        if job_description:
            prompt += f"\nJob Description: {job_description[:500]}...\n"
        
        prompt += """
        
        Requirements:
        1. Keep it professional and concise (3-4 paragraphs)
        2. Highlight relevant experience and skills
        3. Show enthusiasm for the role
        4. Include a strong opening and closing
        5. Make it ATS-friendly
        """
        
        return prompt
    
    def _build_interview_questions_prompt(self, resume_data: Dict[str, Any]) -> str:
        if not resume_data:
            resume_data = {}
        experience = resume_data.get('experience', [])
        skills = resume_data.get('skills', [])
        education = resume_data.get('education', [])
        
        prompt = f"""
        Generate 10 relevant interview questions based on this resume profile:
        
        Experience:
        """
        
        for exp in experience:
            prompt += f"- {exp.get('title', 'Position')}\n"
        
        prompt += f"\nSkills: {', '.join(skills)}\n"
        
        if education:
            prompt += f"Education: {education[0].get('degree', 'Degree')}\n"
        
        prompt += """
        
        Generate questions that:
        1. Test technical skills mentioned
        2. Explore work experience and achievements
        3. Assess problem-solving abilities
        4. Evaluate cultural fit
        5. Include both behavioral and technical questions
        
        Format each question on a new line starting with a number.
        """
        
        return prompt