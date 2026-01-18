import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

const RESPONSES = {
  'what is codds': 'CODDS is an advanced AI detection system that identifies artificially generated content with 95%+ accuracy using deep NLP analysis.',
  'how does it work': 'We analyze 20+ linguistic patterns including vocabulary diversity, sentence structure, AI phrase frequency, and writing style consistency.',
  'features': '✅ Real-time AI detection ✅ Originality scoring (0-100%) ✅ Style drift analysis ✅ Actionable improvement suggestions ✅ Full history tracking',
  'originality score': 'Your originality score reflects how unique your content is. 80%+ is excellent, 50-80% is good, below 50% needs improvement.',
  'ai similarity': 'AI Similarity shows the likelihood your text is AI-generated. Below 30% is human-written, 30-60% is mixed, above 60% appears AI-generated.',
  'style drift': 'Style drift measures how AI-like your writing patterns are. Lower values indicate more natural human writing.',
  'improve originality': 'Try: Use unique vocabulary, vary sentence structure, add personal insights, reduce formal transitions, and write conversationally.',
  'how to be original': '1. Write naturally 2. Use varied sentence lengths 3. Add personal examples 4. Avoid AI phrases like "furthermore" 5. Express genuine opinions',
  'what about copyrighted': 'Our system detects famous quotes, anthems, and copyrighted content. Always paraphrase and cite properly.',
  'can i check my history': 'Yes! Click the "History" tab to see all your previous analyses with dates and scores.',
  'national anthem': 'Well-known content like national anthems will show very low originality scores (5-10%) as they\'re copyrighted and famous.',
  'how to use': '1. Paste your text (10+ characters) 2. Click Analyze 3. Review your scores 4. Read improvement suggestions 5. Save to history',
  'admin access': 'Ask your admin to create an admin account. Admins can view /admin endpoint for user analytics and management.',
  'create account': 'Click "Sign Up" on the login page, enter username/email/password, and start analyzing immediately!',
  'forgot password': 'Contact your administrator to reset your password. Create a new account if needed.',
  'delete account': 'Contact the admin to request account deletion. Your data will be securely removed.',
  'privacy': 'Your analyses are stored securely in our encrypted database. We never share your data with third parties.',
  'plagiarism': 'CODDS detects AI generation, not plagiarism. Use plagiarism checkers for that. We detect AI patterns, not copied content.',
  'accuracy': 'Our AI detection model is 95%+ accurate on diverse text types. Results improve with longer texts (100+ words).',
  'languages': 'CODDS works best in English. Support for other languages is coming soon.',
  'premium features': 'All features are currently available! Bulk analysis and API access coming soon.',
  'support': 'Have questions? Review our documentation, check the Help section, or contact support@codds.ai',
  'hi': 'Hello! 👋 Welcome to CODDS. What would you like to know?',
  'hello': 'Hey there! 👋 I\'m your CODDS AI Assistant. How can I help?',
  'thanks': 'You\'re welcome! Feel free to ask me anything about CODDS. I\'m here to help! 😊',
  'thank you': 'Happy to help! 🎉 Let me know if you have more questions about AI detection or originality scoring.',
  'default': 'That\'s a great question! Ask me about features, how originality scoring works, improvement suggestions, or how to use CODDS.'
};

export default function Chatbot({ messages = [], setMessages = () => {} }) {
  const [chatMessages, setChatMessages] = useState([
    { type: 'bot', text: 'Hi! 👋 I\'m your CODDS AI Assistant. Ask me about AI detection, originality scoring, or how to improve your writing!' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessages = [...chatMessages, { type: 'user', text: input }];
    setChatMessages(newMessages);

    const lowerInput = input.toLowerCase();
    let response = RESPONSES.default;

    // Find matching response
    for (const [key, val] of Object.entries(RESPONSES)) {
      if (lowerInput.includes(key) && key !== 'default') {
        response = val;
        break;
      }
    }

    setTimeout(() => {
      setChatMessages([...newMessages, { type: 'bot', text: response }]);
    }, 300);

    setInput('');
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3 className="chatbot-title">🤖 CODDS Assistant</h3>
      </div>

      <div className="chatbot-messages">
        {chatMessages.map((msg, idx) => (
          <motion.div
            key={idx}
            className={`message ${msg.type}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="message-content">
              {msg.text}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="chatbot-input">
        <input
          type="text"
          className="chat-input"
          placeholder="Ask about originality, AI detection, how to improve..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          className="send-btn"
          onClick={handleSend}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
