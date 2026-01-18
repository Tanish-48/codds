from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
import re

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

@bp.route('/register', methods=['POST'])
def register():
    """User registration"""
    data = request.get_json()
    
    # Validation
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400
    
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')
    
    if not username or len(username) < 3:
        return jsonify({'success': False, 'message': 'Username must be at least 3 characters'}), 400
    
    if not email or not validate_email(email):
        return jsonify({'success': False, 'message': 'Invalid email format'}), 400
    
    if not password or len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters'}), 400
    
    # Create user
    user_id, message = User.create_user(username, email, password)
    
    if not user_id:
        return jsonify({'success': False, 'message': message}), 400
    
    # Create JWT token
    access_token = create_access_token(identity=user_id)
    
    return jsonify({
        'success': True,
        'message': 'User registered successfully',
        'access_token': access_token,
        'user_id': user_id
    }), 201

@bp.route('/login', methods=['POST'])
def login():
    """User login"""
    data = request.get_json()
    
    if not data:
        return jsonify({'success': False, 'message': 'No data provided'}), 400
    
    username = data.get('username', '').strip()
    password = data.get('password', '')
    
    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password required'}), 400
    
    # Find user
    user = User.get_user_by_username(username)
    
    if not user or not User.verify_password(password, user['password']):
        return jsonify({'success': False, 'message': 'Invalid username or password'}), 401
    
    # Create JWT token
    access_token = create_access_token(identity=str(user['_id']))
    
    return jsonify({
        'success': True,
        'message': 'Login successful',
        'access_token': access_token,
        'user_id': str(user['_id']),
        'username': user['username'],
        'role': user.get('role', 'user'),
        'analysis_count': user.get('analysis_count', 0)
    }), 200

@bp.route('/verify', methods=['GET'])
@jwt_required()
def verify():
    """Verify JWT token"""
    user_id = get_jwt_identity()
    user = User.get_user_by_id(user_id)
    
    if not user:
        return jsonify({'success': False, 'message': 'User not found'}), 404
    
    return jsonify({
        'success': True,
        'user_id': str(user['_id']),
        'username': user['username'],
        'email': user['email'],
        'role': user.get('role', 'user'),
        'analysis_count': user.get('analysis_count', 0)
    }), 200

@bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """User logout (client-side mainly, but for completeness)"""
    return jsonify({'success': True, 'message': 'Logout successful'}), 200
