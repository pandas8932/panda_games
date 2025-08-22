from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Import routes
from routes.auth import auth_bp
from routes.games import games_bp

# Load environment variables
load_dotenv()

def create_app():
    """Create and configure Flask application"""
    app = Flask(__name__)
    
    # Configure CORS
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(games_bp, url_prefix='/api')
    
    # Root route
    @app.route('/')
    def home():
        return jsonify({'message': 'Flask API is running...'})
    
    # Health check route
    @app.route('/health')
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'Flask API is running'})
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
