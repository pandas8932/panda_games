from flask import Blueprint, request, jsonify
import bcrypt
import jwt
import os
from models.user import User
from middlewares.auth import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        phone = data.get('phone')
        password = data.get('password')
        
        # Validate required fields
        if not all([username, email, phone, password]):
            return jsonify({'message': 'All fields are required'}), 400
        
        # Check for duplicates
        if User.check_duplicates(email, username, phone):
            return jsonify({'message': 'Email, username, or phone already exists'}), 400
        
        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create new user
        new_user = User(
            username=username,
            email=email,
            phone=phone,
            password=hashed_password
        )
        
        # Save user to database
        if new_user.save():
            return jsonify({'message': 'User registered successfully'}), 201
        else:
            return jsonify({'message': 'Registration failed'}), 500
            
    except Exception as e:
        return jsonify({'message': 'Registration failed', 'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        identifier = data.get('identifier')  # email or username
        password = data.get('password')
        
        if not identifier or not password:
            return jsonify({'message': 'Identifier and password are required'}), 400
        
        # Find user by email or username
        user = User.find_by_email(identifier)
        if not user:
            user = User.find_by_username(identifier)
        
        if not user:
            return jsonify({'message': 'User not found'}), 400
        
        # Check password
        if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Generate JWT token
        token = jwt.encode(
            {
                'id': str(user._id),
                'username': user.username
            },
            os.getenv('JWT_SECRET'),
            algorithm='HS256'
        )
        
        return jsonify({
            'token': token,
            'user': {
                'id': str(user._id),
                'username': user.username,
                'coins': user.coins
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Login failed', 'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_user_profile(current_user):
    """Get current user profile"""
    try:
        return jsonify({
            'username': current_user.username,
            'coins': current_user.coins
        }), 200
    except Exception as e:
        return jsonify({'error': 'Server error'}), 500
