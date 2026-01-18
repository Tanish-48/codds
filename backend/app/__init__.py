from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'your-secret-key-change-in-production')
    app.config['MONGODB_URI'] = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/codds')
    
    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    jwt = JWTManager(app)
    
    # MongoDB connection
    try:
        app.mongo_client = MongoClient(app.config['MONGODB_URI'])
        app.db = app.mongo_client['codds']
        print("MongoDB connected successfully")
    except Exception as e:
        print(f"MongoDB connection error: {e}")
    
    # Register blueprints
    from app.routes import auth_routes, analyze_routes, admin_routes
    
    app.register_blueprint(auth_routes.bp)
    app.register_blueprint(analyze_routes.bp)
    app.register_blueprint(admin_routes.bp)
    
    return app
