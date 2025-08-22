#!/usr/bin/env python3
"""
Flask application runner script
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def check_environment():
    """Check if required environment variables are set"""
    required_vars = ['MONGO_URI', 'JWT_SECRET']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing required environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease create a .env file based on env.example")
        return False
    
    return True

def main():
    """Main function to run the Flask application"""
    print("🚀 Starting Flask Backend for Panda Games...")
    
    # Check environment variables
    if not check_environment():
        sys.exit(1)
    
    try:
        # Import and run the Flask app
        from app import create_app
        
        app = create_app()
        port = int(os.getenv('PORT', 5000))
        
        print(f"✅ Flask app created successfully")
        print(f"🌐 Server will start on http://localhost:{port}")
        print(f"📊 Health check: http://localhost:{port}/health")
        print("\nPress Ctrl+C to stop the server")
        
        app.run(host='0.0.0.0', port=port, debug=True)
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Make sure all dependencies are installed: pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting Flask app: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
