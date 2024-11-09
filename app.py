from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import mysql.connector
from mysql.connector import Error
import hashlib
import os
from http_err import *

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

"""User login
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

    * Get the top 10 funds ordered by 1y, 6m, 3m and 1m each.
    * Get the funds being tracked by the user.

    Returns a JSON object.
"""
@app.route('/home', methods=['GET'])
def load_home():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"error" : "User ID required"}), ERR_INVALID

    res = {}
    cur = MYSQL_CONN.cursor(dictionary=True)

    def Query(cur, val, lim=5):
        cur.execute(f"SELECT fund_company.company_name, fund_name.fund_name, ROUND(fund.{val}, 2) FROM fund_name "
                    "JOIN fund_company ON fund_name.company_id = fund_company.company_id "
                    "JOIN fund ON fund_name.fund_id = fund.fund_id "
                    f"ORDER BY fund.{val} DESC LIMIT {lim};")

    try:
        # Top 5 funds for one year
        Query(cur, 'one_year')
        rec = cur.fetchmany(size=5)
        res['one_year'] = rec

        # Top 5 funds for six months
        Query(cur, 'six_month')
        rec = cur.fetchmany(size=5)
        res['six_month'] = rec

        # Top 5 funds for three months
        Query(cur, 'three_month')
        rec = cur.fetchmany(size=5)
        res['three_month'] = rec

        # Top 5 funds for one month
        Query(cur, 'one_month')
        rec = cur.fetchmany(size=5)
        res['one_month'] = rec

        # User tracked funds
        cur.execute("SELECT fund_name.fund_name, fund.lifetime, fund.one_day FROM fund_name "
                    f"JOIN watchlist ON (fund_name.fund_id = watchlist.fund_id AND watchlist.user_id = {user_id}) "
                    "JOIN fund ON fund_name.fund_id = fund.fund_id;")
        rec = cur.fetchall()
        res['watchlist'] = rec
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error" : "Could not process query"}), ERR_INTERNAL_ALL
    cur.close()
    return jsonify(res), ERR_SUCCESS

"""Fund information

    * Get fundamentals and other fund info for the given `fund_id`.
    * Get a maximum of 5 other funds in the same category.
    * Get a maximum of 5 other funds by the same company.

    Returns a JSON object.
"""
@app.route('/fund', methods=['GET'])
def load_fund():
    fund_id = request.args.get('fund_id')
    if not fund_id:
        return jsonify({"error": "Fund ID required"}), ERR_INVALID

    res = {}
    cur = MYSQL_CONN.cursor(dictionary=True)

    try:
        # Get fund info
        cur.execute(
            "SELECT fund.one_week, fund.one_month, fund.three_month, fund.six_month, "
            "fund.one_year, fund.lifetime, fund.value, fund.standard_deviation, "
            "fund_company.company_name, fund_category.category_name, fund_name.fund_name "
            "FROM fund "
            "JOIN fund_name ON (fund.fund_id = fund_name.fund_id AND fund.fund_id = %s) "
            "JOIN fund_company ON fund_name.company_id = fund_company.company_id "
            "JOIN fund_category ON fund_category.category_id = fund_name.category_id;",
            (fund_id,)
        )
        rec = cur.fetchone()
        if not rec:
            return jsonify({}), ERR_SUCCESS
        res['info'] = rec

        # Get the company ID and category ID of the fund
        cur.execute(
            "SELECT company_id, category_id FROM fund_name WHERE fund_id = %s;",
            (fund_id,)
        )
        ids = cur.fetchone()  # We are sure that this returns a non-empty record

        # Get max 5 other funds from the same company with highest one year returns
        cur.execute(
            "SELECT fund_name.fund_id AS fid, fund_name.fund_name AS fname, ROUND(fund.one_year, 2) AS one_year "
            "FROM fund_name JOIN fund ON fund_name.fund_id = fund.fund_id "
            "WHERE fund_name.company_id = %s AND fund_name.fund_id != %s "
            "ORDER BY fund.one_year DESC LIMIT 5;",
            (ids['company_id'], fund_id)
        )
        rec = cur.fetchall()
        res['same_company'] = [[r['fid'], r['fname'], r['one_year']] for r in rec]

        # Get max 5 other funds from the same category with highest one year returns
        cur.execute(
            "SELECT fund_name.fund_id AS fid, fund_name.fund_name AS fname, ROUND(fund.one_year, 2) AS one_year "
            "FROM fund_name JOIN fund ON fund_name.fund_id = fund.fund_id "
            "WHERE fund_name.category_id = %s AND fund_name.fund_id != %s "
            "ORDER BY fund.one_year DESC LIMIT 5;",
            (ids['category_id'], fund_id)
        )
        rec = cur.fetchall()
        res['same_category'] = [[r['fid'], r['fname'], r['one_year']] for r in rec]
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL
    cur.close()
    return jsonify(res), ERR_SUCCESS

"""Graph data

    * Returns the fund value for the lifetime of the fund,
      for the fund corresponding to the given `fund_id`.

    Returns a JSON object.
"""
@app.route('/fund/graph_data', methods=['GET'])
def load_fund_graph_data():
    fund_id = request.args.get('fund_id')
    if not fund_id:
        return jsonify({"error" : "Fund ID required"}), ERR_INVALID

    res = {}
    cur = MYSQL_CONN.cursor(dictionary=True)

    try :
        cur.execute(
            "SELECT UNIQUE date, price FROM fund_value WHERE fund_id = %s "
            "ORDER BY date DESC;",
            (fund_id, )
        )
        rec = cur.fetchall()
        res['history'] = [[r['date'].strftime("%Y-%m-%d"), r['price']] for r in rec]
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error" : "Could not process query"}), ERR_INTERNAL_ALL
    cur.close()
    return jsonify(res), ERR_SUCCESS

if __name__ == "__main__":
    mysql_connect()
    app.run(host='localhost', port=5000)
