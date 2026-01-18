from flask import current_app
from bson.objectid import ObjectId
import bcrypt
from datetime import datetime

class User:
    @staticmethod
    def create_user(username, email, password, role='user'):
        """Create a new user"""
        db = current_app.db
        
        # Check if user exists
        if db.users.find_one({"$or": [{"username": username}, {"email": email}]}):
            return None, "User already exists"
        
        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        user_data = {
            'username': username,
            'email': email,
            'password': hashed_password,
            'role': role,
            'created_at': datetime.utcnow(),
            'style_profile': {},  # For style fingerprinting
            'analysis_count': 0
        }
        
        result = db.users.insert_one(user_data)
        return str(result.inserted_id), "User created successfully"
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get user by ID"""
        db = current_app.db
        try:
            return db.users.find_one({"_id": ObjectId(user_id)})
        except:
            return None
    
    @staticmethod
    def get_user_by_username(username):
        """Get user by username"""
        db = current_app.db
        return db.users.find_one({"username": username})
    
    @staticmethod
    def verify_password(password, hashed_password):
        """Verify password"""
        # Handle both bytes and string (from MongoDB)
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password)
    
    @staticmethod
    def update_style_profile(user_id, style_data):
        """Update user's style profile"""
        db = current_app.db
        db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"style_profile": style_data}}
        )
    
    @staticmethod
    def increment_analysis_count(user_id):
        """Increment user's analysis count"""
        db = current_app.db
        db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"analysis_count": 1}}
        )
