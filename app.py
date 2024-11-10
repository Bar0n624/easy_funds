from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
import hashlib
import os
from http_err import *
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def mysql_connect():
    with open(".passwd.txt", "r") as file:
        passwd = file.read().strip()
    return mysql.connector.connect(
        host="bar0n.live", user="fund", password=passwd, database="fund"
    )


# Register a user
@app.route("/register", methods=["POST"])
def add_user():
    data = request.get_json()
    if "username" not in data or "password" not in data:
        return jsonify({"error": "Username and password required"}), ERR_INVALID

    user_name = data["username"]
    password = data["password"]
    salt = os.urandom(16).hex()
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()

    conn = mysql_connect()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO user (user_name, password_hash, salt) VALUES (%s, %s, %s)",
            (user_name, password_hash, salt),
        )
        conn.commit()
        cur.execute("SELECT user_id FROM user WHERE user_name = %s", (user_name,))
        user_id = cur.fetchone()[0]
    except Error as e:
        print(e)
        return jsonify({"message": "Error registering user"}), ERR_INVALID
    finally:
        cur.close()
        conn.close()
    return jsonify(
        {"message": "User registered successfully", "user_id": user_id}
    ), ERR_SUCCESS_NEW


# User login
@app.route("/login", methods=["POST"])
def verify_user():
    data = request.get_json()
    if "username" not in data or "password" not in data:
        return jsonify({"error": "Username and password required"}), ERR_INVALID

    user_name = data["username"]
    password = data["password"]

    conn = mysql_connect()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute(
            "SELECT password_hash, salt, user_id FROM user where user_name = %s",
            (user_name,),
        )
        rec = cur.fetchone()
    except Error as e:
        print(e)
        return jsonify({"error": "Database query error"}), ERR_INTERNAL_ALL
    finally:
        cur.close()
        conn.close()

    if rec:
        salt = rec["salt"]
        expected_hash = rec["password_hash"]
        uid = rec["user_id"]
        password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        if password_hash == expected_hash:
            return jsonify({"message": "Login successful", "user_id": uid}), ERR_SUCCESS
    return jsonify({"error": "Invalid credentials"}), ERR_UNAUTHORIZED


# Home page
@app.route("/home", methods=["GET"])
def load_home():
    user_id = request.args.get("u_id")
    if not user_id or not user_id.isdigit():
        return jsonify({"error": "Valid User ID required"}), ERR_INVALID

    res = {}
    conn = mysql_connect()
    cur = conn.cursor(dictionary=True)

    def Query(cur, val, lim=5):
        query = (
            "SELECT fund_company.company_name AS cname, fund_name.fund_name AS fname, "
            "ROUND(fund.{val}, 2) AS price FROM fund_name "
            "JOIN fund_company ON fund_name.company_id = fund_company.company_id "
            "JOIN fund ON fund_name.fund_id = fund.fund_id "
            f"ORDER BY fund.{val} DESC LIMIT {lim};"
        ).format(val=val)
        cur.execute(query)
        rec = cur.fetchmany(size=lim)
        return [[r["cname"], r["fname"], r["price"]] for r in rec]

    try:
        res["one_year"] = Query(cur, "one_year")
        res["six_month"] = Query(cur, "six_month")
        res["three_month"] = Query(cur, "three_month")
        res["one_month"] = Query(cur, "one_month")

        cur.execute(
            "SELECT fund_name.fund_id as fid, fund_name.fund_name as fname, "
            "fund.lifetime as lifetime, fund.one_day as one_day FROM fund_name "
            "JOIN watchlist ON (fund_name.fund_id = watchlist.fund_id AND watchlist.user_id = %s) "
            "JOIN fund ON fund_name.fund_id = fund.fund_id ORDER BY fund.fund_rank;",
            (user_id,),
        )
        rec = cur.fetchall()
        res["watchlist"] = [
            [r["fid"], r["fname"], r["lifetime"], r["one_day"]] for r in rec
        ]
    except Error as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL
    finally:
        cur.close()
        conn.close()
    return jsonify(res), ERR_SUCCESS


"""Fund information

    * Get fundamentals and other fund info for the given `fund_id`.
    * Get a maximum of 5 other funds in the same category.
    * Get a maximum of 5 other funds by the same company.

    e.g. localhost:5000/fund?f_id=1

    Returns a JSON object.
"""


@app.route("/fund", methods=["GET"])
def load_fund():
    fund_id = request.args.get("f_id")
    if not fund_id:
        return jsonify({"error": "Fund ID required"}), ERR_INVALID

    res = {}
    conn = mysql_connect()
    cur = conn.cursor(dictionary=True)

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
            "ORDER BY fund.fund_rank LIMIT 5;",
            (ids["company_id"], fund_id),
        )
        rec = cur.fetchall()
        res["same_company"] = [[r["fid"], r["fname"], r["one_year"]] for r in rec]

        # Get max 5 other funds from the same category with highest one year returns
        cur.execute(
            "SELECT fund_name.fund_id AS fid, fund_name.fund_name AS fname, ROUND(fund.one_year, 2) AS one_year "
            "FROM fund_name JOIN fund ON fund_name.fund_id = fund.fund_id "
            "WHERE fund_name.category_id = %s AND fund_name.fund_id != %s "
            "ORDER BY fund.fund_category_rank LIMIT 5;",
            (ids["category_id"], fund_id),
        )
        rec = cur.fetchall()
        res["same_category"] = [[r["fid"], r["fname"], r["one_year"]] for r in rec]
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL
    finally:
        cur.close()
        conn.close()
    return jsonify(res), ERR_SUCCESS


"""Graph data

    * Returns the fund value for the lifetime of the fund,
      for the fund corresponding to the given `fund_id`.

    e.g. localhost:5000/fund/graph_data?f_id=1

    Returns a JSON object.
"""


@app.route("/fund/graph_data", methods=["GET"])
def load_fund_graph_data():
    fund_id = request.args.get("f_id")
    if not fund_id:
        return jsonify({"error": "Fund ID required"}), ERR_INVALID

    res = {}
    conn = mysql_connect()
    cur = conn.cursor(dictionary=True)

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
    finally:
        cur.close()
        conn.close()
    return jsonify(res), ERR_SUCCESS


"""Search by fund name

    * Search results contain partial matches.

    e.g. localhost:5000/search/fund?q=example%20fund

    Returns a JSON object.
"""


@app.route("/search/fund", methods=["GET"])
def load_search_fund():
    search = request.args.get("q")
    if not search:
        return jsonify({"error": "Empty search query"}), ERR_INVALID

    res = {}
    conn = mysql_connect()
    cur = conn.cursor(dictionary=True)

    search_fmt = f"%{'%'.join(search.split())}%"  # "example fund" -> "%Example%Fund%"

    try:
        cur.execute(
            "SELECT DISTINCT fund_name.fund_id, fund_name.fund_name "
            "FROM fund_name "
            "JOIN fund ON fund_name.fund_id = fund.fund_id "
            "WHERE fund_name.fund_name LIKE %s "
            "ORDER BY fund.fund_rank;",
            (search_fmt,),
        )
        rec = cur.fetchall()
        res["results"] = [[r["fund_id"], r["fund_name"]] for r in rec]
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL
    finally:
        cur.close()
        conn.close()
    return jsonify(res), ERR_SUCCESS


"""Get all funds

    e.g. localhost:5000/all/fund

    Returns a JSON object.
"""


@app.route("/all/fund", methods=["GET"])
def load_all_fund():
    res = {}
    conn = mysql_connect()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute(
            "SELECT DISTINCT fund_id AS f_id, fund_name as f_name FROM fund_name;"
        )
        rec = cur.fetchall()
        res["results"] = [[r["f_id"], r["f_name"]] for r in rec]
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL
    finally:
        cur.close()
        conn.close()
    return jsonify(res), ERR_SUCCESS


"""Get all fund companies

    e.g. localhost:5000/all/company

    Returns a JSON object.
"""


@app.route("/all/company", methods=["GET"])
def load_all_company():
    res = {}
    conn = mysql_connect()
    cur = conn.cursor(dictionary=True)

    try:
        cur.execute(
            "SELECT DISTINCT company_id AS c_id, company_name as c_name FROM fund_company;"
        )
        rec = cur.fetchall()
        res["results"] = [[r["c_id"], r["c_name"]] for r in rec]
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL
    finally:
        cur.close()
        conn.close()
    return jsonify(res), ERR_SUCCESS


"""Get all fund categories

    e.g. localhost:5000/all/category

    Returns a JSON object.
"""


@app.route("/all/category", methods=["GET"])
def load_all_category():
    res = {}
    conn = mysql_connect()
    cur = conn.cursor(dictionary=True)

    try:
        cur.execute(
            "SELECT DISTINCT category_id AS c_id, category_name as c_name FROM fund_category;"
        )
        rec = cur.fetchall()
        res["results"] = [[r["c_id"], r["c_name"]] for r in rec]
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL
    finally:
        cur.close()
        conn.close()
    return jsonify(res), ERR_SUCCESS


"""Get top fund companies

    e.g. localhost:5000/top/company

    Returns a JSON object.
"""


@app.route("/top/company", methods=["GET"])
def load_top_company():
    res = {}
    conn = mysql_connect()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute(
            "SELECT DISTINCT fund_company.company_id AS c_id, fund_company.company_name AS c_name, fund.one_year as one_year "
            "FROM fund_company "
            "JOIN fund_name ON fund_company.company_id = fund_name.company_id "
            "JOIN fund ON fund_name.fund_id = fund.fund_id "
            "ORDER BY fund.fund_rank limit 5;"
        )
        rec = cur.fetchall()
        res["result"] = [[r["c_id"], r["c_name"], r["one_year"]] for r in rec]
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL
    finally:
        cur.close()
        conn.close()
    return jsonify(rec), ERR_SUCCESS


"""Get top fund categories

    e.g. localhost:5000/top/category

    Returns a JSON object.
"""


@app.route("/top/category", methods=["GET"])
def load_top_category():
    res = {}
    conn = mysql_connect()
    cur = conn.cursor(dictionary=True)

    try:
        cur.execute(
            "SELECT DISTINCT fund_category.category_id AS c_id, fund_category.category_name AS c_name, fund.one_year as one_year "
            "FROM fund_category "
            "JOIN fund_name ON fund_category.category_id = fund_name.category_id "
            "JOIN fund ON fund_name.fund_id = fund.fund_id "
            "ORDER BY fund.fund_category_rank limit 5;"
        )
        rec = cur.fetchall()
        res["result"] = [[r["c_id"], r["c_name"], r["one_year"]] for r in rec]
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL
    finally:
        cur.close()
        conn.close()
    return jsonify(rec), ERR_SUCCESS


"""Search funds by fund company

    * Returns the funds for the corresponding `company_id`.
    * The user is not supposed to search for a company directly,
      but instead select a company from a given list.
    * Use `load_all_company` to get a list of all companies.

    e.g. localhost:5000/search/company?c_id=1

    Returns a JSON object.
"""


@app.route("/search/company", methods=["GET"])
def load_search_company():
    c_id = request.args.get("c_id")
    if not c_id:
        return jsonify({"error": "Empty search query"}), ERR_INVALID

    res = {}
    conn = mysql_connect()
    cur = conn.cursor(dictionary=True)

    try:
        cur.execute(
            "SELECT UNIQUE company_name from fund_company WHERE company_id = %s;",
            (c_id,),
        )
        rec = cur.fetchone()
        if not rec:
            return jsonify({}), ERR_SUCCESS

        res["company_name"] = rec["company_name"]

        cur.execute(
            "SELECT DISTINCT fund_name.fund_id AS fid, fund_name.fund_name AS fname, ROUND(fund.one_year, 2) as one_year "
            "FROM fund_name "
            "JOIN fund_company ON fund_name.company_id = fund_company.company_id "
            "JOIN fund ON fund_name.fund_id = fund.fund_id "
            "WHERE fund_company.company_id = %s "
            "ORDER BY fund.fund_rank;",
            (c_id,),
        )
        rec = cur.fetchall()
        res["results"] = [[r["fid"], r["fname"], r["one_year"]] for r in rec]
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL
    finally:
        cur.close()
        conn.close()
    return jsonify(res), ERR_SUCCESS


"""Search funds by fund category

    * Returns the funds for the corresponding `category_id`.
    * The user is not supposed to search for a category directly,
      but instead select a category from a given list.
    * Use `load_all_category` to get a list of all categories.

    e.g. localhost:5000/search/category?c_id=1

    Returns a JSON object.
"""


@app.route("/search/category", methods=["GET"])
def load_search_category():
    c_id = request.args.get("c_id")
    if not c_id:
        return jsonify({"error": "Empty search query"}), ERR_INVALID

    res = {}
    conn = mysql_connect()
    cur = conn.cursor(dictionary=True)

    try:
        cur.execute(
            "SELECT UNIQUE category_name from fund_category WHERE category_id = %s;",
            (c_id,),
        )
        rec = cur.fetchone()
        if not rec:
            return jsonify({}), ERR_SUCCESS

        res["category_name"] = rec["category_name"]

        cur.execute(
            "SELECT DISTINCT fund_name.fund_id AS fid, fund_name.fund_name AS fname, ROUND(fund.one_year, 2) as one_year "
            "FROM fund_name "
            "JOIN fund_category ON fund_name.category_id = fund_category.category_id "
            "JOIN fund ON fund_name.fund_id = fund.fund_id "
            "WHERE fund_category.category_id = %s "
            "ORDER BY fund.fund_category_rank DESC;",
            (c_id,),
        )
        rec = cur.fetchall()
        res["results"] = [[r["fid"], r["fname"], r["one_year"]] for r in rec]
    except Error as e:
        print(e)
        cur.close()
        return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL
    finally:
        cur.close()
        conn.close()
    return jsonify(res), ERR_SUCCESS


"""Add one item to watchlist
"""


@app.route("/watchlist/addone", methods=["POST"])
def add_watchlist():
    data = request.get_json()
    if "user_id" not in data or "fund_id" not in data:
        return jsonify({"error": "User ID and Fund ID required"}), ERR_INVALID
    user_id = data["user_id"]
    fund_id = data["fund_id"]
    conn = mysql_connect()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO watchlist (user_id, fund_id) VALUES (%s, %s)",
            (user_id, fund_id),
        )
        conn.commit()
    except Error as e:
        print(e)
        return jsonify({"message": "Error adding to watchlist"}), ERR_INVALID
    finally:
        cur.close()
        conn.close()
    return jsonify({"message": "Added to watchlist"}), ERR_SUCCESS_NEW


"""Add many items to watchlist
"""


@app.route("/watchlist/addmany", methods=["POST"])
def add_many_watchlist():
    data = request.get_json()
    if "items" not in data or not isinstance(data["items"], list):
        return jsonify({"error": "Items list is required"}), ERR_INVALID

    items = data[
        "items"
    ]  # This should be a list of dictionaries, each containing 'user_id' and 'fund_id'

    if not all("user_id" in item and "fund_id" in item for item in items):
        return jsonify(
            {"error": "Each item must contain User ID and Fund ID"}
        ), ERR_INVALID
    conn = mysql_connect()
    cur = conn.cursor()
    try:
        query = "INSERT INTO watchlist (user_id, fund_id) VALUES (%s, %s)"
        cur.executemany(query, [(item["user_id"], item["fund_id"]) for item in items])
        conn.commit()
    except Error as e:
        print(e)
        return jsonify({"message": "Error adding items to watchlist"}), ERR_INVALID
    finally:
        cur.close()
        conn.close
    return jsonify({"message": "Added multiple items to watchlist"}), ERR_SUCCESS_NEW


"""Add to portfolio
"""


@app.route("/portfolio/add", methods=["POST"])
def add_portfolio():
    data = request.get_json()
    if (
        "user_id" not in data
        or "fund_id" not in data
        or "bought_on" not in data
        or "bought_for" not in data
        or "invested_amount" not in data
    ):
        return jsonify(
            {
                "error": "User ID, Fund ID, Bought On Date, Bought For amount and Amount invested required"
            }
        ), ERR_INVALID
    user_id = data["user_id"]
    fund_id = data["fund_id"]
    bought_on = data["bought_on"]
    bought_for = data["bought_for"]
    invested_amount = data["invested_amount"]
    sold_on = data.get("sold_on", None)
    sold_for = data.get("sold_for", None)
    return_amount = data.get("return_amount", None)
    conn = mysql_connect()
    cur = conn.cursor()
    try:
        cur.execute(
            """INSERT INTO portfolio (user_id, fund_id, bought_on, bought_for, invested_amount, sold_on, sold_for, return_amount)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                user_id,
                fund_id,
                bought_on,
                bought_for,
                invested_amount,
                sold_on,
                sold_for,
                return_amount,
            ),
        )
        conn.commit()
    except Error as e:
        print(e)
        return jsonify({"message": "Error adding to portfolio"}), ERR_INVALID
    finally:
        cur.close()
        conn.close()
    return jsonify({"message": "Added to portfolio"}), ERR_SUCCESS_NEW


"""Update sell information in portfolio
"""


@app.route("/portfolio/update", methods=["POST"])
def update_portfolio():
    data = request.get_json()
    if "user_id" not in data or "fund_id" not in data or "bought_on" not in data:
        return jsonify(
            {"error": "User ID, Fund ID and Bought On Date required"}
        ), ERR_INVALID
    user_id = data["user_id"]
    fund_id = data["fund_id"]
    bought_on = data["bought_on"]
    sold_on = data.get("sold_on", None)
    sold_for = data.get("sold_for", None)
    return_amount = data.get("return_amount", None)
    conn = mysql_connect()
    cur = conn.cursor()
    try:
        cur.execute(
            """UPDATE portfolio SET sold_on=%s, sold_for=%s, return_amount=%s
               WHERE user_id=%s AND fund_id=%s AND bought_on=%s""",
            (sold_on, sold_for, return_amount, user_id, fund_id, bought_on),
        )
        conn.commit()
    except Error as e:
        print(e)
        return jsonify({"message": "Error updating portfolio"}), ERR_INVALID
    cur.close()
    return jsonify({"message": "Updated portfolio"}), ERR_SUCCESS_NEW


"""List all portfolio items of user
"""


@app.route("/portfolio/list", methods=["POST"])
def list_portfolio():
    data = request.get_json()
    if "user_id" not in data:
        return jsonify({"error": "User ID required"}), ERR_INVALID
    user_id = data["user_id"]
    conn = mysql_connect()
    cur = conn.cursor(dictionary=True)
    res = {}
    try:
        cur.execute(
            """SELECT fund_id as fid, fund_name as fname, bought_on, bought_for, invested_amount, sold_on, sold_for, return_amount, value
                FROM portfolio, fund where portfolio.fund_id = fund.fund_id AND portfolio.user_id = %s
                ORDER BY invested_amount DESC
            """,
            (user_id,),
        )
        rec = cur.fetchall()
        res["results"] = [
            [
                r["fid"],
                r["fname"],
                r["bought_on"],
                r["bought_for"],
                r["invested_amount"],
                r["sold_on"],
                r["sold_for"],
                r["return_amount"],
                r["value"],
            ]
            for r in rec
        ]
    except Error as e:
        print(e)
        return jsonify({"message": "Error fetching portfolio"}), ERR_INVALID
    finally:
        cur.close()
        conn.close()
    return jsonify(res), ERR_SUCCESS


# """List all funds
# """


# @app.route("/search", methods=["GET"])
# def search():
#     cur = MYSQL_CONN.cursor(dictionary=True)
#     cur.execute("SELECT fund_id, fund_name FROM fund_name;")
#     rec = cur.fetchall()
#     cur.close()
#     return jsonify(rec), ERR_SUCCESS


# """List all companies
# """


# @app.route("/list_companies", methods=["GET"])
# def list_companies():
#     cur = MYSQL_CONN.cursor(dictionary=True)
#     cur.execute("SELECT company_id, company_name FROM fund_company;")
#     rec = cur.fetchall()
#     cur.close()
#     return jsonify(rec), ERR_SUCCESS


# """List all categories
# """


# @app.route("/list_categories", methods=["GET"])
# def list_categories():
#     cur = MYSQL_CONN.cursor(dictionary=True)
#     cur.execute("SELECT category_id, category_name FROM fund_category;")
#     rec = cur.fetchall()
#     cur.close()
#     return jsonify(rec), ERR_SUCCESS


# @app.route("/category_top", methods=["GET"])
# def category_top():
#     category_id = request.args.get("category_id")
#     if not category_id:
#         return jsonify({"error": "Category ID required"}), ERR_INVALID
#     res = {}
#     cur = MYSQL_CONN.cursor(dictionary=True)
#     try:
#         cur.execute(
#             "SELECT * from fund where category_id = %s ORDER BY fund_category_rank DESC LIMIT 5;"
#         )
#         rec = cur.fetchall()
#         return jsonify(rec), ERR_SUCCESS
#     except Error as e:
#         print(e)
#         cur.close()
#         return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL


# """List all funds of a category
# """


# @app.route("/fund_category", methods=["GET"])
# def fund_category():
#     category_id = request.args.get("category_id")
#     if not category_id:
#         return jsonify({"error": "Category ID required"}), ERR_INVALID
#     res = {}
#     cur = MYSQL_CONN.cursor(dictionary=True)
#     try:
#         cur.execute(
#             "SELECT fund_name.fund_id, fund_name.fund_name, fund_category.category_name from fund_name "
#             "JOIN fund_category ON fund_name.category_id = fund_category.category_id "
#             "WHERE fund_category.category_id = %s;",
#             (category_id,),
#         )
#         rec = cur.fetchall()
#         return jsonify(rec), ERR_SUCCESS
#     except Error as e:
#         print(e)
#         cur.close()
#         return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL


# """List all funds of a company
# """


# @app.route("/fund_company", methods=["GET"])
# def fund_company():
#     company_id = request.args.get("company_id")
#     if not company_id:
#         return jsonify({"error": "Company ID required"}), ERR_INVALID
#     res = {}
#     cur = MYSQL_CONN.cursor(dictionary=True)
#     try:
#         cur.execute(
#             "SELECT fund_name.fund_id, fund_name.fund_name, fund_company.company_name from fund_name "
#             "JOIN fund_company ON fund_name.company_id = fund_company.company_id "
#             "WHERE fund_company.company_id = %s;",
#             (company_id,),
#         )
#         rec = cur.fetchall()
#         return jsonify(rec), ERR_SUCCESS
#     except Error as e:
#         print(e)
#         cur.close()
#         return jsonify({"error": "Could not process query"}), ERR_INTERNAL_ALL


if __name__ == "__main__":
    mysql_connect()
    app.run(host="localhost", port=5000)
