from typing import Dict, Any, List

class ScoringEngine:
    def __init__(self):
        self.weights = {
            'contact_info': 0.15,
            'summary': 0.10,
            'experience': 0.25,
            'education': 0.15,
            'skills': 0.20,
            'keyword_density': 0.10,
            'formatting': 0.05
        }
    
    def score_resume(self, parsed_data: Dict[str, Any], analysis: Dict[str, Any]) -> Dict[str, Any]:
        scores = {
            'contact_info': self._score_contact_info(parsed_data.get('contact', {})),
            'summary': self._score_summary(parsed_data.get('summary', '')),
            'experience': self._score_experience(parsed_data.get('experience', [])),
            'education': self._score_education(parsed_data.get('education', [])),
            'skills': self._score_skills(parsed_data.get('skills', []), analysis),
            'keyword_density': self._score_keyword_density(analysis.get('keyword_density', {})),
            'formatting': self._score_formatting(parsed_data.get('raw_text', ''))
        }
        
        # Calculate weighted total score
        total_score = sum(
            scores[section] * self.weights[section] 
            for section in scores
        )
        
        # Generate recommendations
        recommendations = self._generate_recommendations(scores, analysis)
        
        # Identify critical issues
        critical_issues = self._identify_critical_issues(scores, parsed_data, total_score)
        
        return {
            'total_score': round(total_score, 1),
            'section_scores': scores,
            'grade': self._get_grade(total_score),
            'recommendations': recommendations,
            'critical_issues': critical_issues,
            'ats_compatibility': self._assess_ats_compatibility(scores)
        }
    
    def _score_contact_info(self, contact: Dict[str, str]) -> float:
        score = 0
        if contact.get('name'):
            score += 40
        if contact.get('email'):
            score += 30
        if contact.get('phone'):
            score += 30
        return min(100, score)
    
    def _score_summary(self, summary: str) -> float:
        if not summary:
            return 0
        
        word_count = len(summary.split())
        if word_count < 20:
            return 30
        elif word_count < 50:
            return 70
        elif word_count < 100:
            return 100
        else:
            return 85  # Too long
    
    def _score_experience(self, experience: List[Dict[str, str]]) -> float:
        if not experience:
            return 0
        
        score = min(len(experience) * 25, 75)  # Up to 3 jobs for 75 points
        
        # Check for detailed descriptions
        detailed_jobs = sum(1 for job in experience if len(job.get('description', '').split()) > 20)
        score += min(detailed_jobs * 8, 25)  # Up to 25 points for detailed descriptions
        
        return min(100, score)
    
    def _score_education(self, education: List[Dict[str, str]]) -> float:
        if not education:
            return 50  # Not always required
        
        return min(len(education) * 50, 100)
    
    def _score_skills(self, skills: List[str], analysis: Dict[str, Any]) -> float:
        if not skills:
            return 0
        
        # Base score for having skills
        score = min(len(skills) * 5, 50)
        
        # Bonus for skill matches
        skill_matches = analysis.get('skills_match', {})
        match_bonus = min(skill_matches.get('total_matches', 0) * 3, 50)
        
        return min(100, score + match_bonus)
    
    def _score_keyword_density(self, keyword_density: Dict[str, float]) -> float:
        if not keyword_density:
            return 50
        
        # Optimal density is 2-5% for each category
        total_density = sum(keyword_density.values())
        
        if total_density < 2:
            return 30
        elif total_density < 8:
            return 100
        elif total_density < 12:
            return 80
        else:
            return 60  # Too keyword-heavy
    
    def _score_formatting(self, text: str) -> float:
        score = 100
        
        # Check for common formatting issues
        if len(text.split('\n')) < 5:
            score -= 20  # Too few line breaks
        
        if text.count('  ') > len(text) / 50:
            score -= 15  # Too many double spaces
        
        if not any(char.isupper() for char in text):
            score -= 25  # No uppercase letters
        
        return max(0, score)
    
    def _generate_recommendations(self, scores: Dict[str, float], analysis: Dict[str, Any]) -> List[str]:
        recommendations = []
        
        if scores['contact_info'] < 80:
            recommendations.append("Add complete contact information including name, email, and phone number")
        
        if scores['summary'] < 70:
            recommendations.append("Write a compelling professional summary (30-80 words)")
        
        if scores['experience'] < 70:
            recommendations.append("Add more detailed work experience with specific achievements")
        
        if scores['skills'] < 70:
            recommendations.append("Include more relevant technical and soft skills")
        
        if scores['keyword_density'] < 70:
            missing_keywords = analysis.get('missing_keywords', {})
            if missing_keywords:
                top_missing = []
                for category, keywords in missing_keywords.items():
                    top_missing.extend(keywords[:3])
                recommendations.append(f"Consider adding these keywords: {', '.join(top_missing[:5])}")
        
        return recommendations
    
    def _identify_critical_issues(self, scores: Dict[str, float], parsed_data: Dict[str, Any], total_score: float) -> List[str]:
        issues = []
        
        contact = parsed_data.get('contact', {})
        if not contact.get('email'):
            issues.append("Missing email address")
        
        if not parsed_data.get('experience'):
            issues.append("No work experience listed")
        
        if total_score < 50:
            issues.append("Overall resume score is below average")
        
        return issues
    
    def _assess_ats_compatibility(self, scores: Dict[str, float]) -> Dict[str, Any]:
        ats_score = (
            scores['contact_info'] * 0.3 +
            scores['keyword_density'] * 0.4 +
            scores['formatting'] * 0.3
        )
        
        return {
            'score': round(ats_score, 1),
            'level': 'High' if ats_score >= 80 else 'Medium' if ats_score >= 60 else 'Low',
            'issues': self._get_ats_issues(scores)
        }
    
    def _get_ats_issues(self, scores: Dict[str, float]) -> List[str]:
        issues = []
        
        if scores['contact_info'] < 80:
            issues.append("Incomplete contact information may cause ATS parsing issues")
        
        if scores['keyword_density'] < 60:
            issues.append("Low keyword density may reduce ATS ranking")
        
        if scores['formatting'] < 70:
            issues.append("Formatting issues may affect ATS readability")
        
        return issues
    
    def _get_grade(self, score: float) -> str:
        if score >= 90:
            return 'A+'
        elif score >= 85:
            return 'A'
        elif score >= 80:
            return 'B+'
        elif score >= 75:
            return 'B'
        elif score >= 70:
            return 'C+'
        elif score >= 65:
            return 'C'
        elif score >= 60:
            return 'D+'
        elif score >= 55:
            return 'D'
        else:
            return 'F'