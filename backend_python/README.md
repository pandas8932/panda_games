# Flask Backend for Panda Games

A Python Flask backend with MongoDB integration, JWT authentication, and RESTful API endpoints.

## Features

- **Flask Framework**: Modern Python web framework
- **MongoDB Integration**: Using PyMongo for database operations
- **JWT Authentication**: Secure token-based authentication
- **CORS Support**: Cross-origin resource sharing enabled
- **Password Hashing**: Secure password storage with bcrypt
- **RESTful API**: Clean and consistent API design

## Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Configuration**:
   - Copy `env.example` to `.env`
   - Update the following variables:
     - `MONGO_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure secret key for JWT tokens
     - `PORT`: Server port (default: 5000)

3. **Database Setup**:
   - Ensure MongoDB is running
   - The application will automatically connect to the database

## Running the Application

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication Routes

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (requires authentication)

### Example Usage

#### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "phone": "1234567890",
    "password": "password123"
  }'
```

#### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "password123"
  }'
```

#### Get User Profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Project Structure

```
backend_python/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── env.example           # Environment variables template
├── config/
│   └── database.py       # MongoDB connection
├── models/
│   └── user.py          # User model and database operations
├── middlewares/
│   └── auth.py          # JWT authentication middleware
└── routes/
    └── auth.py          # Authentication routes
```

## Adding New Routes

1. Create a new route file in the `routes/` directory
2. Use Flask Blueprint for organization
3. Register the blueprint in `app.py`
4. Add authentication middleware where needed

Example:
```python
# routes/games.py
from flask import Blueprint, request, jsonify
from middlewares.auth import token_required

games_bp = Blueprint('games', __name__)

@games_bp.route('/games', methods=['GET'])
@token_required
def get_games(current_user):
    return jsonify({'games': []})
```

Then register in `app.py`:
```python
from routes.games import games_bp
app.register_blueprint(games_bp, url_prefix='/api/games')
```
