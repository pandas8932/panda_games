#!/usr/bin/env python3
"""
Simple test script to verify Flask API endpoints
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_health_check():
    """Test health check endpoint"""
    print("Testing health check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_register():
    """Test user registration"""
    print("Testing user registration...")
    data = {
        "username": "testuser",
        "email": "test@example.com",
        "phone": "1234567890",
        "password": "password123"
    }
    response = requests.post(f"{BASE_URL}/api/auth/register", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()
    return response.status_code == 201

def test_login():
    """Test user login"""
    print("Testing user login...")
    data = {
        "identifier": "test@example.com",
        "password": "password123"
    }
    response = requests.post(f"{BASE_URL}/api/auth/login", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()
    
    if response.status_code == 200:
        return response.json().get('token')
    return None

def test_get_profile(token):
    """Test getting user profile"""
    if not token:
        print("No token available, skipping profile test")
        return
    
    print("Testing get user profile...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_create_game(token):
    """Test creating a game"""
    if not token:
        print("No token available, skipping game creation test")
        return
    
    print("Testing create game...")
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "game_type": "dice",
        "bet_amount": 100
    }
    response = requests.post(f"{BASE_URL}/api/games", json=data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def main():
    """Run all tests"""
    print("=== Flask API Test Suite ===\n")
    
    # Test health check
    test_health_check()
    
    # Test registration
    if test_register():
        # Test login
        token = test_login()
        
        # Test authenticated endpoints
        test_get_profile(token)
        test_create_game(token)
    else:
        print("Registration failed, skipping other tests")
    
    print("=== Test Suite Complete ===")

if __name__ == "__main__":
    main()
