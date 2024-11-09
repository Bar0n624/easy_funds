from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import mysql.connector
from mysql.connector import Error
import hashlib
import os

ERR_SUCCESS = 200
ERR_SUCCESS_NEW = 201
ERR_INVALID = 400
ERR_UNAUTHORIZED = 401
ERR_NOT_FOUND = 404

app = Flask(__name__)

MYSQL_CONFIG = {
    'host' : 'bar0n.live',
    'port' : '3306',
    'user' : 'fund',
    'password' : None,
    'database' : 'fund',
    'ssl_disabled' : True
}
MYSQL_CONN = None

def mysql_connect():
    try:
        with open('passwd.txt', 'r') as f:
            MYSQL_CONFIG['password'] = f.read()
        global MYSQL_CONN
        MYSQL_CONN = mysql.connector.connect(**MYSQL_CONFIG)
        if MYSQL_CONN.is_connected():
            print("Connected to database")
    except Error as e:
        print(f"Could not connect to database: {e}")
        exit(1)

"""Register a user
"""
@app.route('/register', methods=['POST'])
def add_user():
    data = request.get_json()

    if 'username' not in data or 'password' not in data:
        return jsonify({"error": "Username and password required"}), ERR_INVALID

    user_name = data['username']
    password = data['password']

    salt = os.urandom(16).hex() # 16-byte random salt
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest() # sha256(password + salt)

    cur = MYSQL_CONN.cursor()
    try:
        cur.execute("INSERT INTO users (user_name, password_hash, salt) VALUES (%s, %s, %s)", (user_name, password_hash, salt))
        MYSQL_CONN.commit()
    except Error as e:
        print(e)
        return jsonify({"message" : "Error registering user"}), ERR_INVALID
    cur.close()

    return jsonify({"message": "User registered successfully"}), ERR_SUCCESS_NEW

"""User login.
"""
@app.route('/login', methods=['POST'])
def verify_user():
    data = request.get_json()

    if 'username' not in data or 'password' not in data:
        return jsonify({"error": "Username and password required"}), ERR_INVALID

    user_name = data['username']
    password = data['password']

    cur = MYSQL_CONN.cursor(dictionary=True)
    cur.execute("SELECT password_hash, salt FROM users where user_name = %s", (user_name, ))
    rec = cur.fetchone()
    cur.close()

    if rec:
        salt = rec['salt']
        expected_hash = rec['password_hash']

        password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        if password_hash == expected_hash:
            return jsonify({"message" : "Login successful"}), ERR_SUCCESS
    return jsonify({"error" : "Invalid credentials"}), ERR_UNAUTHORIZED

"""Home page

    Display the top 10 funds for the day.
"""
@app.route('/home', methods=['GET'])
def load_home():
    pass


if __name__ == "__main__":
    mysql_connect()
    app.run(host='localhost', port=5000)
