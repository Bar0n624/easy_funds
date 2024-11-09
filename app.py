from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import mysql.connector
from mysql.connector import Error
import hashlib
import os
from http_err import *

app = Flask(__name__)

MYSQL_CONFIG = {
    "host": "bar0n.live",
    "port": "3306",
    "user": "fund",
    "password": None,
    "database": "fund",
    "ssl_disabled": True,
}
MYSQL_CONN = None


def mysql_connect():
    try:
        with open("passwd.txt", "r") as f:
            MYSQL_CONFIG["password"] = f.read()
        global MYSQL_CONN
        MYSQL_CONN = mysql.connector.connect(**MYSQL_CONFIG)
        if MYSQL_CONN.is_connected():
            print("Connected to database")
    except Error as e:
        print(f"Could not connect to database: {e}")
        exit(1)


"""Register a user
"""
@app.route("/register", methods=["POST"])
def add_user():
    data = request.get_json()

    if "username" not in data or "password" not in data:
        return jsonify({"error": "Username and password required"}), ERR_INVALID

    user_name = data["username"]
    password = data["password"]

    salt = os.urandom(16).hex()  # 16-byte random salt
    password_hash = hashlib.sha256(
        (password + salt).encode()
    ).hexdigest()  # sha256(password + salt)

    cur = MYSQL_CONN.cursor()
    try:
        cur.execute(
            "INSERT INTO users (user_name, password_hash, salt) VALUES (%s, %s, %s)",
            (user_name, password_hash, salt),
        )
        MYSQL_CONN.commit()
    except Error as e:
        print(e)
        return jsonify({"message": "Error registering user"}), ERR_INVALID
    cur.close()

    return jsonify({"message": "User registered successfully"}), ERR_SUCCESS_NEW


"""User login
"""
@app.route("/login", methods=["POST"])
def verify_user():
    data = request.get_json()

    if "username" not in data or "password" not in data:
        return jsonify({"error": "Username and password required"}), ERR_INVALID

    user_name = data["username"]
    password = data["password"]

    cur = MYSQL_CONN.cursor(dictionary=True)
    cur.execute(
        "SELECT password_hash, salt FROM users where user_name = %s", (user_name,)
    )
    rec = cur.fetchone()
    cur.close()

    if rec:
        salt = rec["salt"]
        expected_hash = rec["password_hash"]

        password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        if password_hash == expected_hash:
            return jsonify({"message": "Login successful"}), ERR_SUCCESS
    return jsonify({"error": "Invalid credentials"}), ERR_UNAUTHORIZED


"""Home page

    * Get the top 10 funds ordered by 1y, 6m, 3m and 1m each.
    * Get the funds being tracked by the user.

    e.g. localhost:5000/home?u_id=1

    Returns a JSON object.
"""
@app.route("/home", methods=["GET"])
def load_home():
    user_id = request.args.get('u_id')
    if not user_id:
        return jsonify({"error": "User ID required"}), ERR_INVALID

    res = {}
    cur = MYSQL_CONN.cursor(dictionary=True)

    def Query(cur, val, lim=5):
        cur.execute(
            f"SELECT fund_company.company_name AS cname, fund_name.fund_name AS fname, ROUND(fund.{val}, 2) AS price FROM fund_name "
            "JOIN fund_company ON fund_name.company_id = fund_company.company_id "
            "JOIN fund ON fund_name.fund_id = fund.fund_id "
            f"ORDER BY fund.{val} DESC LIMIT {lim};"
        )
        rec = cur.fetchmany(size=lim)
        return [[r['cname'], r['fname'], r['price']] for r in rec]

    try:
        # Top 5 funds for one year
        res["one_year"] = Query(cur, "one_year")

        # Top 5 funds for six months
        res["six_month"] = Query(cur, "six_month")

        # Top 5 funds for three months
        res["three_month"] = Query(cur, "three_month")

        # Top 5 funds for one month
        res["one_month"] = Query(cur, "one_month")

        # User tracked funds
        cur.execute(
            "SELECT fund_name.fund_id as fid, fund_name.fund_name as fname, fund.lifetime as lifetime, fund.one_day as one_day FROM fund_name "
            f"JOIN watchlist ON (fund_name.fund_id = watchlist.fund_id AND watchlist.user_id = {user_id}) "
            "JOIN fund ON fund_name.fund_id = fund.fund_id;"
        )
        rec = cur.fetchall()
        res['watchlist'] = [[r['fid'], r['fname'], r['lifename'], r['one_day']] for r in rec]
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL
    cur.close()
    return jsonify(res), ERR_SUCCESS


"""List all funds
"""
@app.route("/search", methods=["GET"])
def search():
    cur = MYSQL_CONN.cursor(dictionary=True)
    cur.execute("SELECT fund_id, fund_name FROM fund_name;")
    rec = cur.fetchall()
    cur.close()
    return jsonify(rec), ERR_SUCCESS


"""List all companies
"""
@app.route("/list_companies", methods=["GET"])
def list_companies():
    cur = MYSQL_CONN.cursor(dictionary=True)
    cur.execute("SELECT company_id, company_name FROM fund_company;")
    rec = cur.fetchall()
    cur.close()
    return jsonify(rec), ERR_SUCCESS


"""List all categories
"""
@app.route("/list_categories", methods=["GET"])
def list_categories():
    cur = MYSQL_CONN.cursor(dictionary=True)
    cur.execute("SELECT category_id, category_name FROM fund_category;")
    rec = cur.fetchall()
    cur.close()
    return jsonify(rec), ERR_SUCCESS


@app.route("/category_top", methods=["GET"])
def category_top():
    category_id = request.args.get("category_id")
    if not category_id:
        return jsonify({"error": "Category ID required"}), ERR_INVALID
    res = {}
    cur = MYSQL_CONN.cursor(dictionary=True)
    try:
        cur.execute(
            "SELECT * from fund where category_id = %s ORDER BY fund_category_rank DESC LIMIT 5;"
        )
        rec = cur.fetchall()
        return jsonify(rec), ERR_SUCCESS
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL


"""List all funds of a category
"""
@app.route("/fund_category", methods=["GET"])
def fund_category():
    category_id = request.args.get("category_id")
    if not category_id:
        return jsonify({"error": "Category ID required"}), ERR_INVALID
    res = {}
    cur = MYSQL_CONN.cursor(dictionary=True)
    try:
        cur.execute(
            "SELECT fund_name.fund_id, fund_name.fund_name, fund_category.category_name from fund_name "
            "JOIN fund_category ON fund_name.category_id = fund_category.category_id "
            "WHERE fund_category.category_id = %s;",
            (category_id,),
        )
        rec = cur.fetchall()
        return jsonify(rec), ERR_SUCCESS
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL


"""List all funds of a company
"""
@app.route("/fund_company", methods=["GET"])
def fund_company():
    company_id = request.args.get("company_id")
    if not company_id:
        return jsonify({"error": "Company ID required"}), ERR_INVALID
    res = {}
    cur = MYSQL_CONN.cursor(dictionary=True)
    try:
        cur.execute(
            "SELECT fund_name.fund_id, fund_name.fund_name, fund_company.company_name from fund_name "
            "JOIN fund_company ON fund_name.company_id = fund_company.company_id "
            "WHERE fund_company.company_id = %s;",
            (company_id,),
        )
        rec = cur.fetchall()
        return jsonify(rec), ERR_SUCCESS
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL


"""Fund information

    * Get fundamentals and other fund info for the given `fund_id`.
    * Get a maximum of 5 other funds in the same category.
    * Get a maximum of 5 other funds by the same company.

    e.g. localhost:5000/fund?f_id=1

    Returns a JSON object.
"""
@app.route("/fund", methods=["GET"])
def load_fund():
    fund_id = request.args.get('f_id')
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
            (fund_id,),
        )
        rec = cur.fetchone()
        if not rec:
            return jsonify({}), ERR_SUCCESS
        res["info"] = rec

        # Get the company ID and category ID of the fund
        cur.execute(
            "SELECT company_id, category_id FROM fund_name WHERE fund_id = %s;",
            (fund_id,),
        )
        ids = cur.fetchone()  # We are sure that this returns a non-empty record

        # Get max 5 other funds from the same company with highest one year returns
        cur.execute(
            "SELECT fund_name.fund_id AS fid, fund_name.fund_name AS fname, ROUND(fund.one_year, 2) AS one_year "
            "FROM fund_name JOIN fund ON fund_name.fund_id = fund.fund_id "
            "WHERE fund_name.company_id = %s AND fund_name.fund_id != %s "
            "ORDER BY fund.one_year DESC LIMIT 5;",
            (ids["company_id"], fund_id),
        )
        rec = cur.fetchall()
        res["same_company"] = [[r["fid"], r["fname"], r["one_year"]] for r in rec]

        # Get max 5 other funds from the same category with highest one year returns
        cur.execute(
            "SELECT fund_name.fund_id AS fid, fund_name.fund_name AS fname, ROUND(fund.one_year, 2) AS one_year "
            "FROM fund_name JOIN fund ON fund_name.fund_id = fund.fund_id "
            "WHERE fund_name.category_id = %s AND fund_name.fund_id != %s "
            "ORDER BY fund.one_year DESC LIMIT 5;",
            (ids["category_id"], fund_id),
        )
        rec = cur.fetchall()
        res["same_category"] = [[r["fid"], r["fname"], r["one_year"]] for r in rec]
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL
    cur.close()
    return jsonify(res), ERR_SUCCESS


"""Graph data

    * Returns the fund value for the lifetime of the fund,
      for the fund corresponding to the given `fund_id`.

    e.g. localhost:5000/fund/graph_data?f_id=1

    Returns a JSON object.
"""
@app.route("/fund/graph_data", methods=["GET"])
def load_fund_graph_data():
    fund_id = request.args.get('f_id')
    if not fund_id:
        return jsonify({"error": "Fund ID required"}), ERR_INVALID

    res = {}
    cur = MYSQL_CONN.cursor(dictionary=True)

    try:
        cur.execute(
            "SELECT UNIQUE date, price FROM fund_value WHERE fund_id = %s "
            "ORDER BY date DESC;",
            (fund_id,),
        )
        rec = cur.fetchall()
        res["history"] = [[r["date"].strftime("%Y-%m-%d"), r["price"]] for r in rec]
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL
    cur.close()
    return jsonify(res), ERR_SUCCESS

"""Search by fund name

    * Search results contain partial matches.

    e.g. localhost:5000/search/fund?q=example%20fund

    Returns a JSON object.
"""
@app.route('/search/fund', methods=['GET'])
def load_search_fund():
    search = request.args.get('q')
    if not search:
        return jsonify({"error": "Empty search query"}), ERR_INVALID

    res = {}
    cur = MYSQL_CONN.cursor(dictionary=True)

    search_fmt = f"%{'%'.join(search.split())}%"  # "example fund" -> "%Example%Fund%"

    try:
        cur.execute(
            "SELECT DISTINCT fund_name.fund_id, fund_name.fund_name "
            "FROM fund_name "
            "JOIN fund ON fund_name.fund_id = fund.fund_id "
            "WHERE fund_name.fund_name LIKE %s "
            "ORDER BY fund.one_year DESC;",
            (search_fmt,)
        )
        rec = cur.fetchall()
        res['results'] = [[r['fund_id'], r['fund_name']] for r in rec]
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL
    cur.close()
    return jsonify(res), ERR_SUCCESS

"""Fund companies

    e.g. localhost:5000/all/company

    Returns a JSON object.
"""
@app.route('/all/company', methods=['GET'])
def load_all_company():
    res = {}
    cur = MYSQL_CONN.cursor(dictionary=True)

    try:
        cur.execute(
            "SELECT DISTINCT company_id AS c_id, company_name as c_name FROM fund_company;"
        )
        rec = cur.fetchall()
        res['results'] = [[r['c_id'], r['c_name']] for r in rec]
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error" : "Could not process query"}), ERR_INTERNAL_ALL
    cur.close()
    return jsonify(res), ERR_SUCCESS

"""Fund categories

    e.g. localhost:5000/all/category

    Returns a JSON object.
"""
@app.route('/all/category', methods=['GET'])
def load_all_category():
    res = {}
    cur = MYSQL_CONN.cursor(dictionary=True)

    try:
        cur.execute(
            "SELECT DISTINCT category_id AS c_id, category_name as c_name FROM fund_category;"
        )
        rec = cur.fetchall()
        res['results'] = [[r['c_id'], r['c_name']] for r in rec]
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error" : "Could not process query"}), ERR_INTERNAL_ALL
    cur.close()
    return jsonify(res), ERR_SUCCESS

"""Search by fund company

    * Returns the funds for the corresponding `company_id`.
    * The user is not supposed to search for a company directly,
      but instead select a company from a given list.
    * Use `load_all_company` to get a list of all companies.

    e.g. localhost:5000/search/company?c_id=1

    Returns a JSON object.
"""
@app.route('/search/company', methods=['GET'])
def load_search_company():
    c_id = request.args.get('c_id')
    if not c_id:
        return jsonify({"error": "Empty search query"}), ERR_INVALID

    res = {}
    cur = MYSQL_CONN.cursor(dictionary=True)

    try:
        cur.execute("SELECT UNIQUE company_name from fund_company WHERE company_id = %s;", (c_id, ))
        rec = cur.fetchone()
        if not rec:
            return jsonify({}), ERR_SUCCESS

        res['company_name'] = rec['company_name']

        cur.execute(
            "SELECT DISTINCT fund_name.fund_id AS fid, fund_name.fund_name AS fname, ROUND(fund.one_year, 2) as one_year "
            "FROM fund_name "
            "JOIN fund_company ON fund_name.company_id = fund_company.company_id "
            "JOIN fund ON fund_name.fund_id = fund.fund_id "
            "WHERE fund_company.company_id = %s "
            "ORDER BY fund.one_year DESC;",
            (c_id, )
        )
        rec = cur.fetchall()
        res['results'] = [[r['fid'], r['fname'], r['one_year']] for r in rec]
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL
    cur.close()
    return jsonify(res), ERR_SUCCESS

"""Search by fund category

    * Returns the funds for the corresponding `category_id`.
    * The user is not supposed to search for a category directly,
      but instead select a category from a given list.
    * Use `load_all_category` to get a list of all categories.

    e.g. localhost:5000/search/category?c_id=1

    Returns a JSON object.
"""
@app.route('/search/category', methods=['GET'])
def load_search_category():
    c_id = request.args.get('c_id')
    if not c_id:
        return jsonify({"error": "Empty search query"}), ERR_INVALID

    res = {}
    cur = MYSQL_CONN.cursor(dictionary=True)

    try:
        cur.execute("SELECT UNIQUE category_name from fund_category WHERE category_id = %s;", (c_id, ))
        rec = cur.fetchone()
        if not rec:
            return jsonify({}), ERR_SUCCESS

        res['category_name'] = rec['category_name']

        cur.execute(
            "SELECT DISTINCT fund_name.fund_id AS fid, fund_name.fund_name AS fname, ROUND(fund.one_year, 2) as one_year "
            "FROM fund_name "
            "JOIN fund_category ON fund_name.category_id = fund_category.category_id "
            "JOIN fund ON fund_name.fund_id = fund.fund_id "
            "WHERE fund_category.category_id = %s "
            "ORDER BY fund.one_year DESC;",
            (c_id, )
        )
        rec = cur.fetchall()
        res['results'] = [[r['fid'], r['fname'], r['one_year']] for r in rec]
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL
    cur.close()
    return jsonify(res), ERR_SUCCESS

"""Add to watchlist
"""
@app.route("/watchlist", methods=["POST"])
def add_watchlist():
    data = request.get_json()
    if "user_id" not in data or "fund_id" not in data:
        return jsonify({"error": "User ID and Fund ID required"}), ERR_INVALID
    user_id = data["user_id"]
    fund_id = data["fund_id"]
    cur = MYSQL_CONN.cursor()
    try:
        cur.execute(
            "INSERT INTO watchlist (user_id, fund_id) VALUES (%s, %s)",
            (user_id, fund_id),
        )
        MYSQL_CONN.commit()
    except Error as e:
        print(e)
        return jsonify({"message": "Error adding to watchlist"}), ERR_INVALID
    cur.close()
    return jsonify({"message": "Added to watchlist"}), ERR_SUCCESS_NEW


if __name__ == "__main__":
    mysql_connect()
    app.run(host="localhost", port=5000)
