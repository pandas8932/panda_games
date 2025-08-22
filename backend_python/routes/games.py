from flask import Blueprint, request, jsonify
from middlewares.auth import token_required
from config.database import db
from datetime import datetime

games_bp = Blueprint('games', __name__)

@games_bp.route('/games', methods=['GET'])
@token_required
def get_games(current_user):
    """Get all games for the current user"""
    try:
        # Get games from database (example)
        games = list(db.games.find({'user_id': str(current_user._id)}))
        
        # Convert ObjectId to string for JSON serialization
        for game in games:
            game['_id'] = str(game['_id'])
            game['user_id'] = str(game['user_id'])
        
        return jsonify({'games': games}), 200
    except Exception as e:
        return jsonify({'message': 'Failed to fetch games', 'error': str(e)}), 500

@games_bp.route('/games', methods=['POST'])
@token_required
def create_game(current_user):
    """Create a new game"""
    try:
        data = request.get_json()
        game_type = data.get('game_type')
        bet_amount = data.get('bet_amount')
        
        if not game_type or not bet_amount:
            return jsonify({'message': 'Game type and bet amount are required'}), 400
        
        # Check if user has enough coins
        if current_user.coins < bet_amount:
            return jsonify({'message': 'Insufficient coins'}), 400
        
        # Create game document
        game_data = {
            'user_id': str(current_user._id),
            'game_type': game_type,
            'bet_amount': bet_amount,
            'status': 'active',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # Insert game into database
        result = db.games.insert_one(game_data)
        game_data['_id'] = str(result.inserted_id)
        
        return jsonify({'message': 'Game created successfully', 'game': game_data}), 201
        
    except Exception as e:
        return jsonify({'message': 'Failed to create game', 'error': str(e)}), 500

@games_bp.route('/games/<game_id>', methods=['GET'])
@token_required
def get_game(current_user, game_id):
    """Get a specific game by ID"""
    try:
        from bson import ObjectId
        
        game = db.games.find_one({
            '_id': ObjectId(game_id),
            'user_id': str(current_user._id)
        })
        
        if not game:
            return jsonify({'message': 'Game not found'}), 404
        
        game['_id'] = str(game['_id'])
        game['user_id'] = str(game['user_id'])
        
        return jsonify({'game': game}), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to fetch game', 'error': str(e)}), 500

@games_bp.route('/games/<game_id>', methods=['PUT'])
@token_required
def update_game(current_user, game_id):
    """Update a game"""
    try:
        from bson import ObjectId
        
        data = request.get_json()
        
        # Update game
        result = db.games.update_one(
            {
                '_id': ObjectId(game_id),
                'user_id': str(current_user._id)
            },
            {
                '$set': {
                    **data,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            return jsonify({'message': 'Game not found'}), 404
        
        return jsonify({'message': 'Game updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': 'Failed to update game', 'error': str(e)}), 500
