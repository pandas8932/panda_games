from datetime import datetime
from bson import ObjectId
from config.database import db

class User:
    def __init__(self, username, email, phone, password, coins=1000, _id=None, created_at=None, updated_at=None):
        self._id = _id
        self.username = username
        self.email = email
        self.phone = phone
        self.password = password
        self.coins = coins
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
    
    def to_dict(self):
        """Convert user object to dictionary"""
        user_dict = {
            'username': self.username,
            'email': self.email,
            'phone': self.phone,
            'password': self.password,
            'coins': self.coins,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
        if self._id:
            user_dict['_id'] = self._id
        return user_dict
    
    @classmethod
    def from_dict(cls, data):
        """Create user object from dictionary"""
        return cls(
            _id=data.get('_id'),
            username=data.get('username'),
            email=data.get('email'),
            phone=data.get('phone'),
            password=data.get('password'),
            coins=data.get('coins', 1000),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at')
        )
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        user_data = db.users.find_one({'email': email})
        return User.from_dict(user_data) if user_data else None
    
    @staticmethod
    def find_by_username(username):
        """Find user by username"""
        user_data = db.users.find_one({'username': username})
        return User.from_dict(user_data) if user_data else None
    
    @staticmethod
    def find_by_phone(phone):
        """Find user by phone"""
        user_data = db.users.find_one({'phone': phone})
        return User.from_dict(user_data) if user_data else None
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        try:
            user_data = db.users.find_one({'_id': ObjectId(user_id)})
            return User.from_dict(user_data) if user_data else None
        except:
            return None
    
    def save(self):
        """Save user to database"""
        if self._id:
            # Update existing user
            self.updated_at = datetime.utcnow()
            result = db.users.update_one(
                {'_id': self._id},
                {'$set': self.to_dict()}
            )
            return result.modified_count > 0
        else:
            # Insert new user
            user_dict = self.to_dict()
            del user_dict['_id']  # Remove _id for new insertion
            result = db.users.insert_one(user_dict)
            self._id = result.inserted_id
            return True
    
    @staticmethod
    def check_duplicates(email, username, phone):
        """Check if email, username, or phone already exists"""
        existing_user = db.users.find_one({
            '$or': [
                {'email': email},
                {'username': username},
                {'phone': phone}
            ]
        })
        return existing_user is not None
