# 🧠 CODDS - Cognitive Originality Drift Detection System

Advanced AI-powered text analysis system that detects AI-generated content, measures originality, and analyzes writing style drift. **Production-ready, fully tested, premium UI.**

## Features

### User Features
- **Authentication**: Secure login and signup with JWT tokens
- **Text Analysis**: Analyze any text for originality score and AI drift
- **Drift Heatmap**: Visual representation of AI-like sections in text
- **Trend Analytics**: Track originality score changes over time
- **Style Fingerprinting**: Unique writing style identification
- **AI Assistant Chatbot**: Sidebar chatbot for general Q&A
- **Inspirational Quotes Slider**: Rotating creativity quotes

### Admin Features
- **User Analytics**: Monitor total users, active users, and engagement metrics
- **System Performance**: View real-time database and system health
- **Drift Trends**: Track AI drift patterns across all users
- **User Management**: View and manage all users
- **Activity Monitoring**: Daily activity charts and statistics

## Technology Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: MongoDB
- **Authentication**: JWT (Flask-JWT-Extended)
- **NLP**: Transformers, scikit-learn, NLTK
- **API**: RESTful API with CORS support

### Frontend
- **Framework**: React 18
- **Styling**: CSS3 with modern animations
- **Charts**: Recharts for data visualization
- **Animation**: Framer Motion
- **HTTP**: Axios
- **Routing**: React Router v6

## Project Structure

```
CODDS/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── user.py          # User model
│   │   │   └── report.py        # Report model
│   │   ├── routes/
│   │   │   ├── auth_routes.py   # Authentication endpoints
│   │   │   ├── analyze_routes.py # Analysis endpoints
│   │   │   └── admin_routes.py  # Admin endpoints
│   │   ├── utils/
│   │   │   └── ai_analyzer.py   # NLP analysis pipeline
│   │   └── __init__.py          # Flask app creation
│   ├── run.py                   # Entry point
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Environment variables template
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── LoginSignup.jsx   # Login/Signup page
    │   │   ├── Dashboard.jsx     # User dashboard
    │   │   └── AdminDashboard.jsx # Admin dashboard
    │   ├── utils/
    │   │   └── api.js            # API client
    │   ├── App.jsx               # Main app component
    │   └── index.js              # Entry point
    ├── public/
    │   └── index.html            # HTML template
    ├── package.json              # Dependencies
    └── .env                      # Environment variables
```

## Setup & Installation

### Prerequisites
- Python 3.8+
- Node.js 14+
- MongoDB (local or cloud)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your MongoDB URI and secrets
   ```

5. **Run the server**
   ```bash
   python run.py
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   App runs on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout user

### Analysis
- `POST /api/analyze/text` - Analyze text for originality
- `GET /api/analyze/history` - Get user's analysis history
- `GET /api/analyze/trend` - Get originality trends
- `GET /api/analyze/report/<id>` - Get specific report

### Admin
- `GET /api/admin/analytics` - Get system analytics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/system-health` - Get system health

## Usage

### For Users
1. Sign up with username, email, and password
2. Log in to dashboard
3. Paste text in the analysis area
4. Click "Analyze Text" to get results
5. View originality score, AI similarity, and drift heatmap
6. Check historical analysis in the History tab
7. Track trends in the Insights tab
8. Use the AI Assistant chatbot for questions

### For Admins
1. Log in with admin account
2. Access admin dashboard automatically
3. View user statistics and analytics
4. Monitor system health and database status
5. Check daily activity trends
6. Review top active users

## Configuration

### MongoDB Setup
- Default: `mongodb://localhost:27017/codds`
- Cloud: Use MongoDB Atlas connection string

### JWT Configuration
- Change `JWT_SECRET` in `.env` for production
- Tokens expire after a set period

### CORS Settings
- Backend allows requests from `http://localhost:3000` by default
- Configure in `app/__init__.py` for production

## Features in Detail

### AI Analysis Pipeline
- **TF-IDF Vectorization**: Compares text against AI-generated references
- **Style Analysis**: Detects formal language and repetitive patterns
- **Pattern Detection**: Identifies AI-specific phrases and structures
- **Heatmap Generation**: Section-by-section AI likelihood scoring
- **Style Fingerprinting**: Creates unique writing profile per user

### Originality Scoring Algorithm
- 40% AI Similarity Factor
- 30% Style Drift Factor
- 30% Pattern Detection Factor
- Final score: 0-100%

## Performance Optimization

- **Caching**: API responses cached client-side
- **Lazy Loading**: Dashboard components load on demand
- **Code Splitting**: React components split for faster loading
- **Database Indexing**: Indexed fields for fast queries

## Security

- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: Stateless authentication with tokens
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Controlled cross-origin requests
- **SQL Injection Protection**: MongoDB query validation

## Deployment

### Backend (Heroku Example)
```bash
# Add Procfile
echo "web: gunicorn app:app" > Procfile

# Deploy
git push heroku main
```

### Frontend (Vercel Example)
```bash
npm run build
vercel --prod
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally: `mongod`
- Or check cloud connection string in `.env`

### Port Already in Use
- Backend: Change port in `run.py`
- Frontend: Set PORT environment variable

### CORS Errors
- Check backend CORS configuration
- Ensure frontend URL matches backend settings

### Missing Dependencies
- Backend: `pip install -r requirements.txt`
- Frontend: `npm install`

## Future Enhancements

- Blockchain integration for immutable originality records
- Multi-language support (Arabic, Spanish, French, etc.)
- Advanced ML models (GPT-based classification)
- Real-time plagiarism detection
- Integration with academic institutions
- Mobile app (React Native)
- Browser extension for quick analysis

## License

MIT License - Feel free to use this project

## Support

For issues and questions:
1. Check documentation
2. Review GitHub issues
3. Contact support team

---

**CODDS v1.0** - Making originality detection intelligent and accessible
