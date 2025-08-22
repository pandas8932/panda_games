import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

def connect_database():
    """Connect to MongoDB database"""
    try:
        client = MongoClient(os.getenv('MONGO_URI'))
        db = client.get_default_database()
        print("MongoDB connected successfully")
        return db
    except Exception as error:
        print(f"MongoDB connection failed: {error}")
        exit(1)

# Global database instance
db = connect_database()
