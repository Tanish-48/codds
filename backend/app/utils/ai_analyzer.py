import re
from collections import Counter

class OriginallityAnalyzer:
    """Advanced AI originality analyzer with consistency"""
    
    # Common AI writing patterns and phrases
    AI_PHRASES = [
        'furthermore', 'moreover', 'in addition', 'consequently', 'therefore',
        'it is worth noting', 'it should be noted', 'in conclusion',
        'the aforementioned', 'the subsequent', 'in light of this',
        'to summarize', 'in essence', 'ultimately', 'nevertheless',
        'as previously mentioned', 'as noted above', 'needless to say',
        'in any case', 'in point of fact', 'it can be argued that',
        'it is evident that', 'it is clear that', 'it is important to note'
    ]
    
    # Copyrighted/Special content detection
    COPYRIGHTED_PATTERNS = [
        r'\b(national anthem|pledge of allegiance|star-spangled banner)\b',
        r'\b(to be or not to be|hamlet|shakespeare)\b',
        r'\b(copyright|©|®|trademark)\b',
        r'\b(all rights reserved|licensed under)\b'
    ]
    
    @staticmethod
    def analyze_text(text):
        """Analyze text for AI originality with consistency"""
        if not text or len(text.strip()) < 10:
            return {
                'originality_score': 0.0,
                'ai_similarity': 100.0,
                'style_drift': 0.0,
                'confidence': 30.0,
                'drift_details': {
                    'ai_phrase_count': 0,
                    'avg_sentence_length': 0.0,
                    'vocabulary_diversity': 0.0,
                    'repetition_ratio': 0.0
                },
                'suggestions': ['Text too short to analyze properly'],
                'style_fingerprint': {
                    'word_count': 0,
                    'sentence_count': 0,
                    'vocabulary_diversity': 0.0,
                    'avg_sentence_length': 0.0,
                    'ai_phrase_count': 0,
                    'unique_word_ratio': 0.0
                }
            }
        
        try:
            # Check for special cases first
            special_case = OriginallityAnalyzer.check_special_cases(text)
            if special_case:
                return special_case
            
            # Get style fingerprint
            style_fingerprint = OriginallityAnalyzer.get_style_fingerprint(text)
            
            # Calculate scores using deterministic methods
            originality_score = OriginallityAnalyzer.calculate_originality(text, style_fingerprint)
            ai_similarity = 100.0 - originality_score
            style_drift = OriginallityAnalyzer.calculate_style_drift(text, style_fingerprint)
            confidence = OriginallityAnalyzer.calculate_confidence(text, originality_score)
            
            # Generate actionable suggestions
            suggestions = OriginallityAnalyzer.generate_suggestions(text, originality_score, style_drift, style_fingerprint)
            
            return {
                'originality_score': float(round(originality_score, 1)),
                'ai_similarity': float(round(ai_similarity, 1)),
                'style_drift': float(round(style_drift, 1)),
                'confidence': float(round(confidence, 1)),
                'drift_details': {
                    'ai_phrase_count': int(style_fingerprint.get('ai_phrase_count', 0)),
                    'avg_sentence_length': float(style_fingerprint.get('avg_sentence_length', 0)),
                    'vocabulary_diversity': float(style_fingerprint.get('vocabulary_diversity', 0)),
                    'repetition_ratio': float(style_fingerprint.get('repetition_ratio', 0))
                },
                'suggestions': suggestions,
                'style_fingerprint': {
                    'word_count': int(style_fingerprint.get('word_count', 0)),
                    'sentence_count': int(style_fingerprint.get('sentence_count', 0)),
                    'vocabulary_diversity': float(style_fingerprint.get('vocabulary_diversity', 0)),
                    'avg_sentence_length': float(style_fingerprint.get('avg_sentence_length', 0)),
                    'ai_phrase_count': int(style_fingerprint.get('ai_phrase_count', 0)),
                    'unique_word_ratio': float(style_fingerprint.get('unique_word_ratio', 0))
                }
            }
        except Exception as e:
            print(f"Analysis error: {e}")
            return {
                'originality_score': 50.0,
                'ai_similarity': 50.0,
                'style_drift': 25.0,
                'confidence': 60.0,
                'drift_details': {},
                'suggestions': ['Unable to analyze text, please try again'],
                'style_fingerprint': {}
            }
    
    @staticmethod
    def check_special_cases(text):
        """Check for copyrighted or special content"""
        text_lower = text.lower()
        
        # Check for copyrighted content
        for pattern in OriginallityAnalyzer.COPYRIGHTED_PATTERNS:
            if re.search(pattern, text_lower, re.IGNORECASE):
                return {
                    'originality_score': 5.0,
                    'ai_similarity': 95.0,
                    'style_drift': 10.0,
                    'confidence': 95.0,
                    'drift_details': {
                        'ai_phrase_count': 0,
                        'avg_sentence_length': 0.0,
                        'vocabulary_diversity': 0.0,
                        'repetition_ratio': 0.0
                    },
                    'suggestions': [
                        '⚠️ This appears to be copyrighted or well-known content',
                        '📝 Paraphrase in your own words to make it original',
                        '📚 Use proper citations for referencing published material'
                    ],
                    'style_fingerprint': {}
                }
        
        return None
    
    @staticmethod
    def calculate_originality(text, fingerprint):
        """Calculate originality score using ENHANCED AI detection"""
        if not text:
            return 0.0
        
        text_lower = text.lower()
        words = text_lower.split()
        word_count = len(words)
        
        # ========== ENHANCED AI DETECTION ALGORITHM (0-100) ==========
        ai_score = 0.0  # Start at 0 = 100% original
        
        # 1. FORMAL STRUCTURE & AI PHRASES (STRONGEST INDICATOR) - HEAVILY WEIGHTED
        ai_phrase_count = fingerprint.get('ai_phrase_count', 0)
        if word_count > 0:
            phrase_density = (ai_phrase_count * 100) / word_count
            ai_score += min(phrase_density * 2.5, 50)  # INCREASED: Max +50 (was 40)
        
        # 2. PASSIVE VOICE (STRONGEST AI INDICATOR)
        passive_patterns = [' was ', ' were ', ' is being ', ' are being ', ' be ', ' been ']
        passive_count = sum(text_lower.count(pattern) for pattern in passive_patterns)
        sentences = len([s for s in re.split(r'[.!?]+', text) if s.strip()])
        if sentences > 0:
            passive_ratio = (passive_count / sentences) * 100
            ai_score += min(passive_ratio * 0.8, 40)  # INCREASED: Max +40 (was 35)
        
        # 3. SENTENCE UNIFORMITY (VERY AI-LIKE)
        sentence_lengths = [len(s.split()) for s in re.split(r'[.!?]+', text) if s.strip()]
        if len(sentence_lengths) > 2:
            variance = OriginallityAnalyzer.calculate_variance(sentence_lengths)
            if variance < 2:
                ai_score += 30  # INCREASED: +30 (was 25)
            elif variance < 4:
                ai_score += 20  # INCREASED: +20 (was 15)
            elif variance < 8:
                ai_score += 10
        
        # 4. VERBOSE/FORMAL LANGUAGE (AI signature)
        verbose_patterns = [
            'it is worth noting', 'it should be noted', 'in conclusion',
            'to summarize', 'in essence', 'in light of the fact',
            'furthermore', 'moreover', 'nevertheless', 'however',
            'it is evident', 'it is clear', 'it is important to note',
            'the aforementioned', 'as previously mentioned', 'as noted above',
            'in any case', 'in point of fact', 'needless to say',
            'as a result', 'consequently', 'therefore', 'thus',
            'in conclusion', 'ultimately', 'essentially', 'notably'
        ]
        verbose_count = sum(1 for pattern in verbose_patterns if pattern in text_lower)
        ai_score += min(verbose_count * 7, 35)  # INCREASED: Max +35 (was 25)
        
        # 5. REPETITIVE WORD USE (AI SIGN - they reuse same words)
        word_freq = Counter(words)
        total_words = len(words)
        if total_words > 20:
            stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'was', 'are', 'be', 'it', 'that', 'this', 'with', 'by', 'as', 'from'}
            content_words = [(w, word_freq[w]) for w in word_freq if w not in stop_words and len(w) > 3]
            if content_words:
                content_words.sort(key=lambda x: x[1], reverse=True)
                # Check top 5 most used content words
                top_repetition_score = 0
                for w, count in content_words[:5]:
                    ratio = (count / total_words) * 100
                    if ratio > 3:  # More than 3% is suspicious
                        top_repetition_score += ratio
                ai_score += min(top_repetition_score * 1.5, 25)
        
        # 6. LACK OF HUMAN MARKERS (CRITICAL - absence = AI)
        
        # Contractions - HUMANS use lots, AI avoids
        contractions = ["don't", "can't", "won't", "isn't", "doesn't", "aren't", "haven't", "hadn't", 
                       "wasn't", "weren't", "i'm", "you're", "it's", "we're", "they're", 
                       "i've", "you've", "we've", "they've", "i'll", "you'll", "we'll", "they'll"]
        contraction_count = sum(text_lower.count(c) for c in contractions)
        if contraction_count == 0 and word_count > 30:
            ai_score += 22  # INCREASED: +22 (was 18) - NO contractions in 30+ words = VERY AI
        elif contraction_count < 1 and word_count > 50:
            ai_score += 18
        
        # Personal pronouns - HUMANS use naturally, AI avoids
        personal_pronouns = [' i ', ' i\'', ' me ', ' my ', ' mine ', ' we ', ' us ', ' our ', ' ours ']
        pronoun_count = sum(text_lower.count(p) for p in personal_pronouns)
        if pronoun_count == 0 and word_count > 50:
            ai_score += 18  # INCREASED: +18 (was 15) - NO personal voice = VERY AI
        elif pronoun_count < 2 and word_count > 100:
            ai_score += 12
        
        # Casual/conversational markers - HUMANS naturally use
        casual_words = ['like', 'just', 'really', 'actually', 'literally', 'honestly', 'you know',
                       'i think', 'i feel', 'kinda', 'sorta', 'lol', 'btw', 'imo', 'tbh', 'ngl']
        casual_count = sum(1 for w in casual_words if w in text_lower)
        if casual_count == 0 and word_count > 40:
            ai_score += 15  # INCREASED: +15 (was 10) - NO casual language = likely AI
        
        # Emotional punctuation - HUMANS use for emphasis
        exclamation_count = text.count('!')
        question_count = text.count('?')
        ellipsis_count = text.count('...')
        emotional_punctuation = exclamation_count + question_count + ellipsis_count
        if emotional_punctuation == 0 and word_count > 60:
            ai_score += 14  # INCREASED: +14 (was 12) - NO emotional markers = AI
        
        # 7. STRUCTURE PERFECTION (AI writes "perfectly")
        # Check for balanced paragraph structure
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        if paragraphs:
            para_lengths = [len(p.split()) for p in paragraphs]
            if len(para_lengths) > 2:
                para_variance = OriginallityAnalyzer.calculate_variance(para_lengths)
                if para_variance < 30:  # Very consistent paragraph lengths
                    ai_score += 10
        
        # 8. TRANSITION WORD OVERUSE (AI overuses connectors)
        transitions = ['however', 'therefore', 'moreover', 'furthermore', 'additionally',
                      'conversely', 'consequently', 'subsequently', 'ultimately', 'notably']
        transition_count = sum(text_lower.count(t) for t in transitions)
        if transition_count > 3:
            ai_score += min(transition_count * 3, 15)
        
        # 9. LACK OF TYPOS/ERRORS (AI writes perfectly, humans make mistakes)
        # This is a subtle indicator - look for perfect capitalization and spacing
        # (This is a heuristic - harder to detect programmatically)
        
        # 10. VOCABULARY PERFECTION
        vocabulary_diversity = fingerprint.get('vocabulary_diversity', 0)
        if vocabulary_diversity > 0.8 and word_count > 100:
            ai_score += 8  # Too-perfect vocabulary
        
        # ============ FINAL CALCULATION ============
        originality_score = 100.0 - min(ai_score, 100.0)
        
        return float(round(originality_score, 1))
    
    @staticmethod
    def calculate_style_drift(text, fingerprint):
        """Calculate style drift - how AI-like the writing is"""
        if not text:
            return 0.0
        
        text_lower = text.lower()
        
        # Count AI indicators
        ai_phrase_count = fingerprint.get('ai_phrase_count', 0)
        ai_count = ai_phrase_count * 2
        
        # Check for passive voice patterns
        passive_patterns = [' was ', ' were ', ' is being ', ' are being']
        passive_count = sum(text_lower.count(pattern) for pattern in passive_patterns)
        ai_count += passive_count
        
        # Check for repetitive structure
        sentences = re.split(r'[.!?]+', text_lower)
        sentences = [s.strip().split() for s in sentences if s.strip()]
        
        if len(sentences) > 2:
            first_words = [s[0] if s else '' for s in sentences]
            first_word_counts = Counter(first_words)
            repetition = max(first_word_counts.values()) / len(first_words) if first_words else 0
            ai_count += repetition * 10
        
        # Normalize
        drift_score = min(100.0, float(ai_count * 1.5))
        return drift_score
    
    @staticmethod
    def calculate_confidence(text, originality_score):
        """Calculate confidence level"""
        word_count = len(text.split())
        
        # More text = higher confidence
        base_confidence = min(95.0, 40.0 + (word_count / 10.0))
        
        # Adjust by originality - extreme scores are less confident
        if originality_score > 90 or originality_score < 10:
            base_confidence -= 15
        elif originality_score > 80 or originality_score < 20:
            base_confidence -= 10
        
        return max(20.0, min(99.0, base_confidence))
    
    @staticmethod
    def generate_suggestions(text, originality_score, style_drift, fingerprint):
        """Generate actionable suggestions based on AI detection score"""
        suggestions = []
        words = text.lower().split()
        word_count = len(words)
        ai_phrase_count = fingerprint.get('ai_phrase_count', 0)
        
        # MAIN GUIDANCE based on originality (inverse of AI score)
        if originality_score < 30:
            # HIGH AI CONTENT - Strong AI signals
            suggestions.extend([
                '🤖 High AI detection: Too many formal patterns detected',
                '📝 Add personal anecdotes and real experience',
                '💬 Use casual language: contractions, conversational phrases',
                '❌ Avoid: "furthermore", "moreover", "in conclusion"'
            ])
        elif originality_score < 50:
            # MODERATE AI CONTENT
            suggestions.extend([
                '⚠️ Moderate AI patterns: Some formal language detected',
                '✍️ Increase conversational tone and personal voice',
                '💡 Add I/we perspective instead of passive voice'
            ])
        elif originality_score < 70:
            # MIXED HUMAN/FORMAL (Good balance)
            suggestions.extend([
                '✅ Good originality: Mostly human-generated detected',
                '📚 Continue with your natural writing style',
                '💪 Slightly increase casual tone for even more originality'
            ])
        elif originality_score < 85:
            # STRONG HUMAN (Excellent)
            suggestions.extend([
                '⭐ Excellent originality: Very authentic voice detected',
                '💬 Natural conversational flow detected',
                '🎯 Strong personal perspective evident'
            ])
        else:
            # VERY STRONG HUMAN (Perfect)
            suggestions.extend([
                '🌟 Outstanding originality: Authentic human voice',
                '✨ Highly personalized and conversational',
                '🏆 Unique writing style and perspective'
            ])
        
        # SPECIFIC ISSUES
        # AI phrase detection
        if ai_phrase_count >= 5:
            suggestions.append('⚠️ Reduce formal transitions (furthermore, moreover, in addition, etc.)')
        
        # Passive voice check
        text_lower = text.lower()
        passive_patterns = [' was ', ' were ', ' is being ', ' are being']
        passive_count = sum(text_lower.count(pattern) for pattern in passive_patterns)
        if passive_count > 3:
            suggestions.append('💭 Replace passive voice with active voice for authenticity')
        
        # No contractions = AI sign
        contractions = ["don't", "can't", "won't", "isn't", "i'm", "you're", "it's", "i've"]
        if sum(text_lower.count(c) for c in contractions) == 0 and originality_score < 75:
            suggestions.append('💬 Add contractions (don\'t, can\'t, I\'m) for natural tone')
        
        # No personal pronouns = AI sign
        personal_pronouns = ['i ', ' i ', ' me ', ' my ', ' we ']
        if sum(text_lower.count(p) for p in personal_pronouns) == 0 and originality_score < 75:
            suggestions.append('👤 Use first-person perspective (I, me, we)')
        
        # Length considerations
        if word_count < 50:
            suggestions.append('📏 Expand text with more details and examples')
        elif word_count > 2000:
            suggestions.append('✂️ Consider breaking into multiple shorter sections')
        
        # Remove duplicates, keep most relevant, limit to 5-6
        suggestions = list(dict.fromkeys(suggestions))[:6]
        
        return suggestions if suggestions else ['✅ Text analysis complete - Continue with your natural writing']
    
    @staticmethod
    def get_style_fingerprint(text):
        """Get detailed style fingerprint"""
        if not text:
            return {}
        
        words = text.split()
        word_count = len(words)
        
        # Sentence analysis
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        sentence_count = len(sentences)
        
        # Word length analysis
        word_lengths = [len(w) for w in words]
        avg_word_length = sum(word_lengths) / len(word_lengths) if word_lengths else 0
        
        # Sentence length analysis
        sentence_lengths = [len(s.split()) for s in sentences]
        avg_sentence_length = sum(sentence_lengths) / len(sentence_lengths) if sentence_lengths else 0
        
        # Vocabulary diversity
        unique_words = len(set(w.lower() for w in words))
        vocabulary_diversity = (unique_words / word_count * 100) if word_count > 0 else 0
        
        # Count AI phrases
        text_lower = text.lower()
        ai_phrase_count = sum(1 for phrase in OriginallityAnalyzer.AI_PHRASES if phrase in text_lower)
        
        # Repetition ratio
        word_counts = Counter(w.lower() for w in words)
        repeated_words = sum(1 for count in word_counts.values() if count > 2)
        repetition_ratio = (repeated_words / unique_words * 100) if unique_words > 0 else 0
        
        return {
            'word_count': word_count,
            'sentence_count': sentence_count,
            'avg_word_length': round(avg_word_length, 1),
            'avg_sentence_length': round(avg_sentence_length, 1),
            'vocabulary_diversity': round(vocabulary_diversity, 1),
            'ai_phrase_count': ai_phrase_count,
            'repetition_ratio': round(repetition_ratio, 1),
            'unique_word_ratio': round(vocabulary_diversity, 1)
        }
    
    @staticmethod
    def calculate_variance(values):
        """Calculate variance of values"""
        if len(values) < 2:
            return 0.0
        avg = sum(values) / len(values)
        variance = sum((x - avg) ** 2 for x in values) / len(values)
        return variance ** 0.5
