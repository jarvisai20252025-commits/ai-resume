import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
from typing import Dict, List, Any
import json

class NLPAnalyzer:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            # Fallback if spacy model not installed
            self.nlp = None
        
        self.job_keywords = self._load_job_keywords()
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
    
    def _load_job_keywords(self) -> Dict[str, List[str]]:
        # Common job keywords by category
        return {
            'technical': [
                'python', 'javascript', 'java', 'react', 'node.js', 'sql', 'aws', 
                'docker', 'kubernetes', 'git', 'api', 'database', 'machine learning',
                'data analysis', 'agile', 'scrum', 'ci/cd', 'devops'
            ],
            'soft_skills': [
                'leadership', 'communication', 'teamwork', 'problem solving',
                'project management', 'analytical', 'creative', 'adaptable',
                'collaborative', 'detail-oriented', 'time management'
            ],
            'business': [
                'strategy', 'planning', 'budgeting', 'forecasting', 'analysis',
                'reporting', 'stakeholder management', 'process improvement',
                'customer service', 'sales', 'marketing', 'operations'
            ]
        }
    
    def analyze_resume(self, parsed_data: Dict[str, Any]) -> Dict[str, Any]:
        text = parsed_data.get('raw_text', '')
        
        analysis = {
            'keywords': self._extract_keywords(text),
            'skills_match': self._match_skills(parsed_data.get('skills', [])),
            'keyword_density': self._calculate_keyword_density(text),
            'missing_keywords': self._find_missing_keywords(text),
            'readability': self._assess_readability(text),
            'section_completeness': self._check_section_completeness(parsed_data)
        }
        
        return analysis
    
    def _extract_keywords(self, text: str) -> List[Dict[str, Any]]:
        # Clean text
        text = re.sub(r'[^\w\s]', ' ', text.lower())
        
        # Use TF-IDF for keyword extraction
        try:
            tfidf_matrix = self.vectorizer.fit_transform([text])
            feature_names = self.vectorizer.get_feature_names_out()
            tfidf_scores = tfidf_matrix.toarray()[0]
            
            # Get top keywords
            keyword_scores = list(zip(feature_names, tfidf_scores))
            keyword_scores.sort(key=lambda x: x[1], reverse=True)
            
            return [
                {'keyword': kw, 'score': float(score)} 
                for kw, score in keyword_scores[:20] if score > 0
            ]
        except:
            # Fallback to simple word frequency
            words = text.split()
            word_freq = {}
            for word in words:
                if len(word) > 3:
                    word_freq[word] = word_freq.get(word, 0) + 1
            
            return [
                {'keyword': word, 'score': freq} 
                for word, freq in sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:20]
            ]
    
    def _match_skills(self, resume_skills: List[str]) -> Dict[str, Any]:
        resume_skills_lower = [skill.lower() for skill in resume_skills]
        matches = {'technical': [], 'soft_skills': [], 'business': []}
        
        for category, keywords in self.job_keywords.items():
            for keyword in keywords:
                if any(keyword.lower() in skill for skill in resume_skills_lower):
                    matches[category].append(keyword)
        
        return {
            'matched_skills': matches,
            'total_matches': sum(len(skills) for skills in matches.values()),
            'match_percentage': self._calculate_match_percentage(matches)
        }
    
    def _calculate_keyword_density(self, text: str) -> Dict[str, float]:
        words = text.lower().split()
        total_words = len(words)
        
        if total_words == 0:
            return {}
        
        density = {}
        for category, keywords in self.job_keywords.items():
            category_count = 0
            for keyword in keywords:
                category_count += sum(1 for word in words if keyword.lower() in word)
            density[category] = (category_count / total_words) * 100
        
        return density
    
    def _find_missing_keywords(self, text: str) -> Dict[str, List[str]]:
        text_lower = text.lower()
        missing = {'technical': [], 'soft_skills': [], 'business': []}
        
        for category, keywords in self.job_keywords.items():
            for keyword in keywords:
                if keyword.lower() not in text_lower:
                    missing[category].append(keyword)
        
        return missing
    
    def _assess_readability(self, text: str) -> Dict[str, Any]:
        sentences = text.split('.')
        words = text.split()
        
        avg_sentence_length = len(words) / len(sentences) if sentences else 0
        
        return {
            'avg_sentence_length': avg_sentence_length,
            'total_words': len(words),
            'readability_score': min(100, max(0, 100 - (avg_sentence_length - 15) * 2))
        }
    
    def _check_section_completeness(self, parsed_data: Dict[str, Any]) -> Dict[str, bool]:
        return {
            'has_contact': bool(parsed_data.get('contact', {}).get('email')),
            'has_summary': bool(parsed_data.get('summary')),
            'has_experience': bool(parsed_data.get('experience')),
            'has_education': bool(parsed_data.get('education')),
            'has_skills': bool(parsed_data.get('skills'))
        }
    
    def _calculate_match_percentage(self, matches: Dict[str, List[str]]) -> float:
        total_possible = sum(len(keywords) for keywords in self.job_keywords.values())
        total_matched = sum(len(skills) for skills in matches.values())
        return (total_matched / total_possible) * 100 if total_possible > 0 else 0