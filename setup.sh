#!/bin/bash

# CODDS Setup Script

echo "========================================="
echo "CODDS - Setup Script"
echo "========================================="

# Check if MongoDB is running
echo ""
echo "Checking MongoDB..."
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found. Please install MongoDB or use a cloud service."
    read -p "Enter your MongoDB URI (or press Enter to skip): " MONGO_URI
    if [ -z "$MONGO_URI" ]; then
        MONGO_URI="mongodb://localhost:27017/codds"
    fi
else
    MONGO_URI="mongodb://localhost:27017/codds"
    echo "✓ MongoDB found locally"
fi

# Backend Setup
echo ""
echo "========================================="
echo "Setting up Backend..."
echo "========================================="

cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "SECRET_KEY=$(openssl rand -hex 32)" >> .env
    echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env
    echo "MONGODB_URI=$MONGO_URI" >> .env
    echo "✓ .env file created"
else
    echo "✓ .env file already exists"
fi

# Download NLTK data
echo "Downloading NLTK data..."
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

cd ..

# Frontend Setup
echo ""
echo "========================================="
echo "Setting up Frontend..."
echo "========================================="

cd frontend

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install
else
    echo "✓ Node modules already installed"
fi

cd ..

echo ""
echo "========================================="
echo "Setup Complete!"
echo "========================================="
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python run.py"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm start"
echo ""
echo "Frontend will open at: http://localhost:3000"
echo "Backend API at: http://localhost:5000"
echo ""
echo "Default credentials for testing:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
