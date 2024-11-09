import requests
import mysql.connector
from dateutil.relativedelta import relativedelta
from datetime import datetime
from collections import defaultdict
import json
import sys
import threading
from queue import Queue
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(message)s")
logger = logging.getLogger()

url = "https://portal.amfiindia.com/DownloadNAVHistoryReport_Po.aspx?frmdt=%s&todt=%s"
data_queue = Queue()


def one_month_later_or_latest(date_str):
    initial_date = datetime.strptime(date_str, "%d-%b-%Y")
    one_month_later = initial_date + relativedelta(months=1)
    one_month_later = one_month_later - relativedelta(days=1)
    today = datetime.today()
    result_date = one_month_later if one_month_later <= today else today
    return result_date.strftime("%d-%b-%Y")


def request_url(url, date):
    url = url % (date, one_month_later_or_latest(date))
    response = requests.get(url)
    return response.text


def parse(response):
    category, company = None, None
    parsed_data = []
    lines = response.strip().splitlines()
    lines = [line.strip() for line in lines if line.strip() != ""]
    lines = lines[1:]

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


def batch_insert_data(data):
    with open(".passwd.txt", "r") as file:
        passwd = file.read().strip()

    connection = mysql.connector.connect(
        host="bar0n.live", user="fund", password=passwd, database="fund"
    )
    cursor = connection.cursor(buffered=True)

    category_map = {}
    company_map = {}
    fund_map = {}

    batch_data = []
    for line in data:
        print("Processed: ", data.index(line) + 1, "of", len(data), end="\r")
        category, company, name, value, date = (
            line["category"],
            line["company"],
            line["name"],
            line["value"],
            line["date"],
        )
        name = name.replace("'", "")
        date = datetime.strptime(date.strip(), "%d-%b-%Y")
        date = date.strftime("%Y-%m-%d %H:%M:%S")

        if name not in fund_map:
            try:
                cursor.execute(
                    f"SELECT fund_id FROM fund_name WHERE fund_name = '{name}'"
                )
            except mysql.connector.Error as err:
                logger.error(f"Error checking fund {name}: {err}")
                continue

            if cursor.rowcount <= 0:
                if company not in company_map:
                    cursor.execute(
                        f"SELECT company_id FROM fund_company WHERE company_name = '{company}'"
                    )
                    if cursor.rowcount <= 0:
                        cursor.execute(
                            f"INSERT INTO fund_company (company_name) VALUES ('{company}')"
                        )
                        connection.commit()
                        cursor.execute(
                            f"SELECT company_id FROM fund_company WHERE company_name = '{company}'"
                        )
                    company_id = cursor.fetchone()[0]
                    company_map[company] = company_id
                else:
                    company_id = company_map[company]

                if category not in category_map:
                    cursor.execute(
                        f"SELECT category_id FROM fund_category WHERE category_name = '{category}'"
                    )
                    if cursor.rowcount <= 0:
                        cursor.execute(
                            f"INSERT INTO fund_category (category_name) VALUES ('{category}')"
                        )
                        connection.commit()
                        cursor.execute(
                            f"SELECT category_id FROM fund_category WHERE category_name = '{category}'"
                        )
                    category_id = cursor.fetchone()[0]
                    category_map[category] = category_id
                else:
                    category_id = category_map[category]

                cursor.execute(
                    f"INSERT INTO fund_name (fund_name, company_id, category_id) VALUES ('{name}', '{company_id}', '{category_id}')"
                )
                connection.commit()
                cursor.execute(
                    f"SELECT fund_id FROM fund_name WHERE fund_name = '{name}'"
                )
            fund_id = cursor.fetchone()[0]
            fund_map[name] = fund_id
        else:
            fund_id = fund_map[name]
        batch_data.append((fund_id, value, date))

    try:
        cursor.executemany(
            f"INSERT IGNORE INTO fund_value (fund_id, price, date) VALUES (%s, %s, %s)",
            batch_data,
        )
        print(batch_data)
        connection.commit()
        logger.info(f"Batch insert completed for {len(batch_data)} records.")
    except mysql.connector.Error as err:
        logger.error(f"Error during batch insert: {err}")
    finally:
        cursor.close()
        connection.close()


# def process_month(month):
#     try:
#         response = request_url(url, month)
#         parsed_data = parse(response)
#         logger.info(f"Month {month} processed successfully.")
#         data_queue.put(parsed_data)
#     except Exception as e:
#         logger.error(f"Error processing month {month}: {e}")


# def worker():
#     while True:
#         data = data_queue.get()
#         if data is None:
#             break
#         batch_insert_data(data)
#         data_queue.task_done()


# if __name__ == "__main__":
#     months = sys.argv[1:]

#     threads = []
#     for month in months:
#         t = threading.Thread(target=process_month, args=(month,))
#         threads.append(t)
#         t.start()

#     for t in threads:
#         t.join()

#     num_workers = 4
#     workers = []
#     for _ in range(num_workers):
#         worker_thread = threading.Thread(target=worker)
#         workers.append(worker_thread)
#         worker_thread.start()

#     data_queue.join()

#     for _ in range(num_workers):
#         data_queue.put(None)

#     for worker_thread in workers:
#         worker_thread.join()

#     logger.info("Data processing and insertion complete.")

if __name__ == "__main__":
    months = sys.argv[1:]
    for month in months:
        batch_insert_data(parse(request_url(url, month)))

