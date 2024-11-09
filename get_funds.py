import requests
import mysql.connector
from dateutil.relativedelta import relativedelta
from datetime import datetime
from collections import defaultdict
import json

url = "https://portal.amfiindia.com/DownloadNAVHistoryReport_Po.aspx?frmdt=%s&todt=%s"


def one_month_later_or_latest(date_str):
    initial_date = datetime.strptime(date_str, "%d-%b-%Y")
    one_month_later = initial_date + relativedelta(months=1)
    today = datetime.today()
    return one_month_later if one_month_later <= today else today


def request_url(url, date):
    url = url % (date, one_month_later_or_latest(date))
    response = requests.get(url)
    return response.text


def parse(response):
    category, company = None, None
    parsed_data = []
    lines = response.strip().splitlines()
    lines = [line.strip() for line in lines if line.strip() != ""]

    i = 0
    while i < len(lines):
        line = lines[i]

        if len(line.split(";")) == 1:
            if i + 1 < len(lines) and len(lines[i + 1].split(";")) == 1:
                category = line
                company = lines[i + 1]
                i += 2
            else:
                company = line
                i += 1
        else:
            parts = line.split(";")
            if len(parts) == 8:
                (
                    scheme_code,
                    scheme_name,
                    isin_div,
                    isin_reinv,
                    nav,
                    repurchase,
                    sale,
                    date,
                ) = parts
                parsed_data.append(
                    {
                        "category": category,
                        "company": company,
                        "name": scheme_name,
                        "value": nav,
                        "date": date,
                    }
                )
            i += 1

    return parsed_data


def insert_data(data):
    with open(".passwd.txt", "r") as file:
        passwd = file.read().strip()
    connection = mysql.connector.connect(
        host="bar0n.live", user="fund", password=passwd
    )
    for line in data:
        category, company, name, value, date = (
            line["category"],
            line["company"],
            line["name"],
            line["value"],
            line["date"],
        )
