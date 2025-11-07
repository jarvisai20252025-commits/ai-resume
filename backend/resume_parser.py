import fitz  # PyMuPDF
from docx import Document
import re
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

class ResumeParser:
    def __init__(self):
        self.sections = ['contact', 'summary', 'experience', 'education', 'skills']
    
    def parse_resume(self, file_path: str) -> Dict[str, Any]:
        if file_path.endswith('.pdf'):
            return self._parse_pdf(file_path)
        elif file_path.endswith('.docx'):
            return self._parse_docx(file_path)
        else:
            raise ValueError("Unsupported file format")
    
    def _parse_pdf(self, file_path: str) -> Dict[str, Any]:
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return self._extract_sections(text)
    
    def _parse_docx(self, file_path: str) -> Dict[str, Any]:
        doc = Document(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return self._extract_sections(text)
    
    def _extract_sections(self, text: str) -> Dict[str, Any]:
        sections = {
            'contact': self._extract_contact(text),
            'summary': self._extract_summary(text),
            'experience': self._extract_experience(text),
            'education': self._extract_education(text),
            'skills': self._extract_skills(text),
            'raw_text': text
        }
        # Clean up extracted data
        sections = self._clean_sections(sections)
        return sections
    
    def _clean_sections(self, sections: Dict[str, Any]) -> Dict[str, Any]:
        """Clean and format extracted sections for better presentation"""
        # Clean contact info
        if sections.get('contact'):
            contact = sections['contact']
            if contact.get('name'):
                contact['name'] = contact['name'].title()
        
        # Clean summary
        if sections.get('summary'):
            summary = sections['summary']
            # Remove extra whitespace and format properly
            summary = ' '.join(summary.split())
            sections['summary'] = summary
        
        # Clean experience entries
        if sections.get('experience'):
            cleaned_exp = []
            for job in sections['experience']:
                if job.get('title') and len(job['title'].strip()) > 3:
                    job['title'] = job['title'].strip()
                    job['description'] = job.get('description', '').strip()
                    cleaned_exp.append(job)
            sections['experience'] = cleaned_exp
        
        # Clean education entries
        if sections.get('education'):
            cleaned_edu = []
            for edu in sections['education']:
                if edu.get('degree') and len(edu['degree'].strip()) > 3:
                    edu['degree'] = edu['degree'].strip()
                    edu['details'] = edu.get('details', '').strip()
                    cleaned_edu.append(edu)
            sections['education'] = cleaned_edu
        
        # Clean skills
        if sections.get('skills'):
            skills = sections['skills']
            cleaned_skills = []
            for skill in skills:
                skill = skill.strip()
                if len(skill) > 1 and skill not in cleaned_skills:
                    cleaned_skills.append(skill)
            sections['skills'] = cleaned_skills[:15]  # Limit to top 15 skills
        
        return sections
    
    def _extract_contact(self, text: str) -> Dict[str, str]:
        contact = {}
        
        # Email
        email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
        contact['email'] = email_match.group() if email_match else ""
        
        # Phone
        phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
        contact['phone'] = phone_match.group() if phone_match else ""
        
        # Name (first line typically)
        lines = text.split('\n')
        contact['name'] = lines[0].strip() if lines else ""
        
        return contact
    
    def _extract_summary(self, text: str) -> str:
        summary_patterns = [
            r'(?i)summary[:\s]+(.*?)(?=\n\s*\n|\nexperience|\neducation|\nskills)',
            r'(?i)objective[:\s]+(.*?)(?=\n\s*\n|\nexperience|\neducation|\nskills)',
            r'(?i)profile[:\s]+(.*?)(?=\n\s*\n|\nexperience|\neducation|\nskills)'
        ]
        
        for pattern in summary_patterns:
            match = re.search(pattern, text, re.DOTALL)
            if match:
                return match.group(1).strip()
        return ""
    
    def _extract_experience(self, text: str) -> List[Dict[str, str]]:
        experience_section = re.search(
            r'(?i)experience[:\s]+(.*?)(?=\neducation|\nskills|\ncertifications|$)',
            text, re.DOTALL
        )
        
        if not experience_section:
            return []
        
        exp_text = experience_section.group(1)
        # Simple extraction - can be enhanced
        jobs = []
        job_blocks = re.split(r'\n(?=[A-Z])', exp_text)
        
        for block in job_blocks:
            if len(block.strip()) > 20:  # Filter out short lines
                jobs.append({
                    'title': block.split('\n')[0].strip(),
                    'description': block.strip()
                })
        
        return jobs
    
    def _extract_education(self, text: str) -> List[Dict[str, str]]:
        education_section = re.search(
            r'(?i)education[:\s]+(.*?)(?=\nexperience|\nskills|\ncertifications|$)',
            text, re.DOTALL
        )
        
        if not education_section:
            return []
        
        edu_text = education_section.group(1)
        education = []
        edu_blocks = re.split(r'\n(?=[A-Z])', edu_text)
        
        for block in edu_blocks:
            if len(block.strip()) > 10:
                education.append({
                    'degree': block.split('\n')[0].strip(),
                    'details': block.strip()
                })
        
        return education
    
    def _extract_skills(self, text: str) -> List[str]:
        skills_section = re.search(
            r'(?i)skills[:\s]+(.*?)(?=\nexperience|\neducation|\ncertifications|$)',
            text, re.DOTALL
        )
        
        if not skills_section:
            return []
        
        skills_text = skills_section.group(1)
        # Extract skills separated by commas, newlines, or bullets
        skills = re.split(r'[,\n•·\-\*]', skills_text)
        return [skill.strip() for skill in skills if skill.strip()]
    
    def export_optimized_resume(self, version_data: Dict[str, Any], 
                              optimizations: Dict[str, Any], output_path: str):
        """Export a professionally formatted resume with optimizations"""
        doc = SimpleDocTemplate(
            output_path, 
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch
        )
        
        # Custom styles based on options
        styles = getSampleStyleSheet()
        
        # Color scheme mapping
        color_schemes = {
            'professional': colors.HexColor('#2c3e50'),
            'classic': colors.black,
            'modern': colors.HexColor('#34495e')
        }
        
        # Font size mapping
        font_sizes = {
            'small': {'base': 9, 'header': 22, 'section': 12, 'job': 10},
            'medium': {'base': 10, 'header': 24, 'section': 14, 'job': 12},
            'large': {'base': 11, 'header': 26, 'section': 16, 'job': 13}
        }
        
        scheme_color = color_schemes.get(optimizations.get('format_style', 'professional'), colors.HexColor('#2c3e50'))
        font_config = font_sizes.get(optimizations.get('font_size', 'medium'), font_sizes['medium'])
        
        # Professional header style
        header_style = ParagraphStyle(
            'CustomHeader',
            parent=styles['Title'],
            fontSize=font_config['header'],
            spaceAfter=8,
            textColor=scheme_color,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        # Contact info style
        contact_style = ParagraphStyle(
            'ContactStyle',
            parent=styles['Normal'],
            fontSize=font_config['base'] + 1,
            alignment=TA_CENTER,
            spaceAfter=24,
            fontName='Helvetica'
        )
        
        # Section header style
        section_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontSize=font_config['section'],
            textColor=scheme_color,
            spaceBefore=18,
            spaceAfter=10,
            borderWidth=0,
            leftIndent=0,
            fontName='Helvetica-Bold',
            keepWithNext=1
        )
        
        # Add underline to section headers
        section_underline_style = ParagraphStyle(
            'SectionUnderline',
            parent=section_style,
            borderWidth=1,
            borderColor=scheme_color,
            borderPadding=2,
            spaceAfter=12
        )
        
        # Job title style
        job_title_style = ParagraphStyle(
            'JobTitle',
            parent=styles['Heading3'],
            fontSize=font_config['job'],
            textColor=scheme_color,
            spaceBefore=10,
            spaceAfter=6,
            fontName='Helvetica-Bold',
            keepWithNext=1
        )
        
        # Content style
        content_style = ParagraphStyle(
            'ContentStyle',
            parent=styles['Normal'],
            fontSize=font_config['base'],
            leading=font_config['base'] + 4,
            spaceAfter=8,
            fontName='Helvetica',
            alignment=TA_LEFT
        )
        
        # Bullet point style
        bullet_style = ParagraphStyle(
            'BulletStyle',
            parent=content_style,
            leftIndent=20,
            bulletIndent=10,
            spaceAfter=4
        )
        
        story = []
        parsed_data = version_data['parsed_data']
        
        # Header Section
        contact = parsed_data.get('contact', {})
        if contact.get('name'):
            story.append(Paragraph(contact['name'], header_style))
        
        # Contact information in a clean format
        contact_parts = []
        if contact.get('email'):
            contact_parts.append(contact['email'])
        if contact.get('phone'):
            contact_parts.append(contact['phone'])
        
        if contact_parts:
            contact_info = ' • '.join(contact_parts)
            story.append(Paragraph(contact_info, contact_style))
        
        # Professional Summary with keyword optimization
        summary = parsed_data.get('summary') or optimizations.get('enhanced_summary')
        if summary:
            story.append(Paragraph('PROFESSIONAL SUMMARY', section_underline_style))
            
            # Enhance summary with keywords if requested
            if optimizations.get('include_keywords') and optimizations.get('top_keywords'):
                enhanced_summary = self._enhance_text_with_keywords(summary, optimizations.get('top_keywords', []))
                story.append(Paragraph(enhanced_summary, content_style))
            else:
                story.append(Paragraph(summary, content_style))
        
        # Professional Experience with enhanced formatting
        experience = parsed_data.get('experience', [])
        if experience:
            story.append(Paragraph('PROFESSIONAL EXPERIENCE', section_underline_style))
            for job in experience:
                if job.get('title'):
                    story.append(Paragraph(job['title'], job_title_style))
                if job.get('description'):
                    # Format job description with bullet points
                    desc = job['description']
                    if optimizations.get('include_keywords'):
                        desc = self._enhance_text_with_keywords(desc, optimizations.get('top_keywords', []))
                    
                    # Split into bullet points if contains multiple sentences
                    sentences = desc.split('. ')
                    if len(sentences) > 1:
                        for sentence in sentences:
                            if sentence.strip():
                                bullet_text = f"• {sentence.strip()}"
                                if not bullet_text.endswith('.'):
                                    bullet_text += '.'
                                story.append(Paragraph(bullet_text, bullet_style))
                    else:
                        story.append(Paragraph(desc, content_style))
                    
                    story.append(Spacer(1, 6))
        
        # Education with clean formatting
        education = parsed_data.get('education', [])
        if education:
            story.append(Paragraph('EDUCATION', section_underline_style))
            for edu in education:
                if edu.get('degree'):
                    story.append(Paragraph(edu['degree'], job_title_style))
                if edu.get('details'):
                    details = edu['details'].replace('\n', ' | ')
                    story.append(Paragraph(details, content_style))
                story.append(Spacer(1, 4))
        
        # Skills with professional formatting
        skills = parsed_data.get('skills', [])
        if skills and len(skills) > 0:
            story.append(Paragraph('CORE COMPETENCIES', section_underline_style))
            
            # Add missing keywords if optimization is enabled
            all_skills = list(skills)
            if optimizations.get('include_keywords') and optimizations.get('missing_keywords'):
                for category, keywords in optimizations.get('missing_keywords', {}).items():
                    if isinstance(keywords, list):
                        all_skills.extend(keywords[:3])  # Add top 3 missing keywords per category
            
            # Remove duplicates and limit to reasonable number
            unique_skills = list(dict.fromkeys([skill.strip() for skill in all_skills if skill.strip()]))
            limited_skills = unique_skills[:20]  # Limit to 20 skills
            
            # Format skills in a clean layout
            skills_text = ' • '.join(limited_skills)
            story.append(Paragraph(skills_text, content_style))
        
        # Add footer with ATS optimization note if enabled
        if optimizations.get('optimize_ats'):
            story.append(Spacer(1, 20))
            footer_style = ParagraphStyle(
                'FooterStyle',
                parent=styles['Normal'],
                fontSize=8,
                textColor=colors.grey,
                alignment=TA_CENTER
            )
            story.append(Paragraph('This resume has been optimized for Applicant Tracking Systems (ATS)', footer_style))
        
        # Build the document
        doc.build(story)
    
    def _enhance_text_with_keywords(self, text: str, keywords: List[Dict]) -> str:
        """Enhance text by naturally incorporating relevant keywords"""
        if not keywords or not text:
            return text
        
        enhanced_text = text
        text_lower = text.lower()
        
        # Add high-value keywords that aren't already present
        for kw_data in keywords[:5]:  # Top 5 keywords only
            keyword = kw_data.get('keyword', '') if isinstance(kw_data, dict) else str(kw_data)
            if keyword and keyword.lower() not in text_lower:
                # Try to naturally incorporate the keyword
                if 'experience' in text_lower or 'skilled' in text_lower:
                    enhanced_text = enhanced_text.replace('experience', f'experience in {keyword}')
                    break
        
        return enhanced_text