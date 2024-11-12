# SQL Schema and Functions

## User Table
```sql
CREATE TABLE user(user_id int primary key auto_increment, user_name varchar(500) NOT NULL UNIQUE, password_hash char(64) NOT NULL, salt char(32) NOT NULL);
```
This query creates the `user` table to store user information, including a unique `user_id`, `user_name`, `password_hash`, and `salt`. This is a **create** operation.

## Fund Related Schema
### Fund Company Table
```sql
CREATE TABLE fund_company(company_id int primary key auto_increment, company_name varchar(500));
```
This query creates the `fund_company` table to store fund company information, including a unique `company_id` and `company_name`. This is a **create** operation.

### Fund Category Table
```sql
CREATE TABLE fund_category(category_id int primary key auto_increment, category_name varchar(500));
```
This query creates the `fund_category` table to store fund category information, including a unique `category_id` and `category_name`. This is a **create** operation.

### Fund Name Table
```sql
CREATE TABLE fund_name(fund_id int primary key auto_increment , company_id int, category_id int, fund_name varchar(500), foreign key(category_id) references fund_category(category_id), foreign key(company_id) references fund_company(company_id));
```
This query creates the `fund_name` table to store fund names, including a unique `fund_id`, `company_id`, `category_id`, and `fund_name`. It also establishes foreign key relationships with the `fund_category` and `fund_company` tables. This is a **create** operation.

### Fund Value Table
```sql
CREATE TABLE fund_value(fund_id int, date datetime, price double, foreign key(fund_id) references fund_name(fund_id));
```
This query creates the `fund_value` table to store the historical prices of funds, including `fund_id`, `date`, and `price`. It establishes a foreign key relationship with the `fund_name` table. This is a **create** operation.

### Fund Table
```sql
CREATE TABLE fund(fund_id int, one_day double, one_week double, one_month double, three_month double, six_month double, one_year double, lifetime double, earliest_date datetime, latest_date datetime, high double, low double, standard_deviation double, value double, fund_rank int, fund_category_rank int, primary key(fund_id), foreign key(fund_id) references fund_name(fund_id));
```
This query creates the `fund` table to store various performance metrics of funds, including `fund_id`, performance metrics over different periods, `earliest_date`, `latest_date`, `high`, `low`, `standard_deviation`, `value`, `fund_rank`, and `fund_category_rank`. It establishes a foreign key relationship with the `fund_name` table. This is a **create** operation.

### Portfolio Table
```sql
CREATE TABLE portfolio(user_id int, fund_id int, bought_on datetime, bought_for double, sold_on datetime, sold_for double, invested_amount double, return_amount double, foreign key(user_id) references user(user_id), foreign key(fund_id) references fund_name(fund_id), primary key(user_id, fund_id, bought_on));
```
This query creates the `portfolio` table to store user portfolio information, including `user_id`, `fund_id`, `bought_on`, `bought_for`, `sold_on`, `sold_for`, `invested_amount`, and `return_amount`. It establishes foreign key relationships with the `user` and `fund_name` tables. This is a **create** operation.

### Watchlist Table
```sql
CREATE TABLE watchlist(user_id int, fund_id int, foreign key(user_id) references user(user_id), foreign key(fund_id) references fund_name(fund_id), primary key(user_id, fund_id));
```
This query creates the `watchlist` table to store user watchlist information, including `user_id` and `fund_id`. It establishes foreign key relationships with the `user` and `fund_name` tables. This is a **create** operation.

### Auth Table
```sql
CREATE TABLE auth (user_id INT(11) NOT NULL, token_hash CHAR(64) NOT NULL PRIMARY KEY, created_on DATE NOT NULL);
```
This query creates the `auth` table to store authentication tokens, including `user_id`, `token_hash`, and `created_on`. This is a **create** operation.

## Functions
### One Day Change
```sql
CREATE FUNCTION one_day_change(f_id INT) RETURNS DOUBLE
BEGIN
    DECLARE change_val DOUBLE;
    DECLARE latest_date DATE;
    DECLARE previous_date DATE;

    SELECT MAX(date) INTO latest_date
    FROM fund_value
    WHERE fund_id = f_id;

    SELECT MAX(date) INTO previous_date
    FROM fund_value
    WHERE fund_id = f_id AND date < latest_date;

    IF previous_date IS NULL THEN
        RETURN NULL;
    END IF;

    SET change_val = (
        SELECT IFNULL((latest.price - previous.price) / IF(previous.price = 0, NULL, previous.price) * 100, NULL)
        FROM fund_value AS latest
        JOIN fund_value AS previous
        ON previous.date = previous_date AND latest.date = latest_date
        AND latest.fund_id = f_id
        AND previous.fund_id = f_id
    );

    RETURN change_val;
END //
```
This function calculates the one-day percentage change in the price of a fund. It retrieves the latest and previous dates and calculates the percentage change. This is a **read** operation.

### One Week Change
```sql
CREATE FUNCTION one_week_change(f_id INT) RETURNS DOUBLE
BEGIN
    DECLARE change_val DOUBLE;
    DECLARE latest_date DATE;
    DECLARE previous_date DATE;

    SELECT MAX(date) INTO latest_date
    FROM fund_value
    WHERE fund_id = f_id;

    SELECT MIN(date) INTO previous_date
    FROM fund_value
    WHERE fund_id = f_id AND date < latest_date AND date >= DATE_SUB(latest_date, INTERVAL 7 DAY)
    LIMIT 1;

    IF previous_date IS NULL THEN
        RETURN NULL;
    END IF;

    SET change_val = (
        SELECT IFNULL((latest.price - previous.price) / IF(previous.price = 0, NULL, previous.price) * 100, NULL)
        FROM fund_value AS latest
        JOIN fund_value AS previous
        ON previous.date = previous_date AND latest.date = latest_date
        AND latest.fund_id = f_id
        AND previous.fund_id = f_id
    );

    RETURN change_val;
END //
```
This function calculates the one-week percentage change in the price of a fund. It retrieves the latest and previous dates within the last week and calculates the percentage change. This is a **read** operation.

### One Month Change
```sql
CREATE FUNCTION one_month_change(f_id INT) RETURNS DOUBLE
BEGIN
    DECLARE change_val DOUBLE;
    DECLARE latest_date DATE;
    DECLARE previous_date DATE;

    SELECT MAX(date) INTO latest_date
    FROM fund_value
    WHERE fund_id = f_id;

    SELECT MIN(date) INTO previous_date
    FROM fund_value
    WHERE fund_id = f_id AND date < latest_date AND date >= DATE_SUB(latest_date, INTERVAL 1 MONTH)
    LIMIT 1;

    IF previous_date IS NULL THEN
        RETURN NULL;
    END IF;

    SET change_val = (
        SELECT IFNULL((latest.price - previous.price) / IF(previous.price = 0, NULL, previous.price) * 100, NULL)
        FROM fund_value AS latest
        JOIN fund_value AS previous
        ON previous.date = previous_date AND latest.date = latest_date
        AND latest.fund_id = f_id
        AND previous.fund_id = f_id
    );

    RETURN change_val;
END //
```
This function calculates the one-month percentage change in the price of a fund. It retrieves the latest and previous dates within the last month and calculates the percentage change. This is a **read** operation.

### Three Month Change
```sql
CREATE FUNCTION three_month_change(f_id INT) RETURNS DOUBLE
BEGIN
    DECLARE change_val DOUBLE;
    DECLARE latest_date DATE;
    DECLARE previous_date DATE;
    
    SELECT MAX(date) INTO latest_date
    FROM fund_value
    WHERE fund_id = f_id;

    SELECT MIN(date) INTO previous_date
    FROM fund_value
    WHERE fund_id = f_id AND date < latest_date AND date >= DATE_SUB(latest_date, INTERVAL 3 MONTH)
    LIMIT 1;

    IF previous_date IS NULL THEN
        RETURN NULL;
    END IF;

    SET change_val = (
        SELECT IFNULL((latest.price - previous.price) / IF(previous.price = 0, NULL, previous.price) * 100, NULL)
        FROM fund_value AS latest
        JOIN fund_value AS previous
        ON previous.date = previous_date AND latest.date = latest_date
        AND latest.fund_id = f_id
        AND previous.fund_id = f_id
    );

    RETURN change_val;
END //
```
This function calculates the three-month percentage change in the price of a fund. It retrieves the latest and previous dates within the last three months and calculates the percentage change. This is a **read** operation.

### Six Month Change
```sql
CREATE FUNCTION six_month_change(f_id INT) RETURNS DOUBLE
BEGIN
    DECLARE change_val DOUBLE;
    DECLARE latest_date DATE;
    DECLARE previous_date DATE;

    SELECT MAX(date) INTO latest_date
    FROM fund_value
    WHERE fund_id = f_id;

    SELECT MIN(date) INTO previous_date
    FROM fund_value
    WHERE fund_id = f_id AND date < latest_date AND date >= DATE_SUB(latest_date, INTERVAL 6 MONTH)
    LIMIT 1;

    IF previous_date IS NULL THEN
        RETURN NULL;
    END IF;

    SET change_val = (
        SELECT IFNULL((latest.price - previous.price) / IF(previous.price = 0, NULL, previous.price) * 100, NULL)
        FROM fund_value AS latest
        JOIN fund_value AS previous
        ON previous.date = previous_date AND latest.date = latest_date
        AND latest.fund_id = f_id
        AND previous.fund_id = f_id
    );

    RETURN change_val;
END //
```
This function calculates the six-month percentage change in the price of a fund. It retrieves the latest and previous dates within the last six months and calculates the percentage change. This is a **read** operation.

### One Year Change
```sql
CREATE FUNCTION one_year_change(f_id INT) RETURNS DOUBLE
BEGIN
    DECLARE change_val DOUBLE;
    DECLARE latest_date DATE;
    DECLARE previous_date DATE;

    SELECT MAX(date) INTO latest_date
    FROM fund_value
    WHERE fund_id = f_id;

    SELECT MIN(date) INTO previous_date
    FROM fund_value
    WHERE fund_id = f_id AND date < latest_date AND date >= DATE_SUB(latest_date, INTERVAL 1 YEAR)
    LIMIT 1;

    IF previous_date IS NULL THEN
        RETURN NULL;
    END IF;

    SET change_val = (
        SELECT IFNULL((latest.price - previous.price) / IF(previous.price = 0, NULL, previous.price) * 100, NULL)
        FROM fund_value AS latest
        JOIN fund_value AS previous
        ON previous.date = previous_date AND latest.date = latest_date
        AND latest.fund_id = f_id
        AND previous.fund_id = f_id
    );

    RETURN change_val;
END //
```
This function calculates the one-year percentage change in the price of a fund. It retrieves the latest and previous dates within the last year and calculates the percentage change. This is a **read** operation.

### Lifetime Change
```sql
CREATE FUNCTION lifetime_change(f_id INT) RETURNS DOUBLE
BEGIN
    DECLARE change_val DOUBLE;
    DECLARE latest_date DATE;
    DECLARE earliest_date DATE;
    DECLARE latest_price DOUBLE;
    DECLARE earliest_price DOUBLE;

    SELECT MAX(date) INTO latest_date
    FROM fund_value
    WHERE fund_id = f_id;

    SELECT MIN(date) INTO earliest_date
    FROM fund_value
    WHERE fund_id = f_id;

    IF latest_date IS NULL OR earliest_date IS NULL THEN
        RETURN NULL;
    END IF;

    SELECT price INTO latest_price
    FROM fund_value
    WHERE fund_id = f_id AND date = latest_date
    LIMIT 1;

    SELECT price INTO earliest_price
    FROM fund_value
    WHERE fund_id = f_id AND date = earliest_date
    LIMIT 1;

    IF latest_price IS NULL OR earliest_price IS NULL THEN
        RETURN NULL;
    END IF;

    SET change_val = IFNULL((latest_price - earliest_price) / IF(earliest_price = 0, NULL, earliest_price) * 100, NULL);

    RETURN change_val;
END //
```
This function calculates the lifetime percentage change in the price of a fund. It retrieves the earliest and latest dates and calculates the percentage change. This is a **read** operation.

### Fund Standard Deviation
```sql
CREATE FUNCTION fund_std_dev(f_id INT) RETURNS DOUBLE
BEGIN
    DECLARE stddev DOUBLE;
    SET stddev = (
        SELECT STDDEV(price)
        FROM fund_value
        WHERE fund_id = f_id
    );
    RETURN IFNULL(stddev, 0);
END //
```
This function calculates the standard deviation of the prices of a fund. It retrieves the standard deviation of the prices from the `fund_value` table. This is a **read** operation.

## Triggers
### Update Fund After Insert
```sql
CREATE TRIGGER update_fund_after_insert
AFTER INSERT ON fund_value
FOR EACH ROW
BEGIN
    DECLARE max_value DOUBLE;
    DECLARE min_value DOUBLE;
    DECLARE earliest_dt DATETIME;
    DECLARE latest_dt DATETIME;

    SET max_value = (SELECT MAX(price) FROM fund_value WHERE fund_id = NEW.fund_id);
    SET min_value = (SELECT MIN(price) FROM fund_value WHERE fund_id = NEW.fund_id);
    
    SET earliest_dt = (SELECT MIN(date) FROM fund_value WHERE fund_id = NEW.fund_id);
    SET latest_dt = (SELECT MAX(date) FROM fund_value WHERE fund_id = NEW.fund_id);
    
    IF NOT EXISTS (SELECT 1 FROM fund WHERE fund_id = NEW.fund_id) THEN
        INSERT INTO fund (
            fund_id,
            one_day,
            one_week,
            one_month,
            three_month,
            six_month,
            one_year,
            lifetime,
            earliest_date,
            latest_date,
            high,
            low,
            standard_deviation,
            value
        )
        VALUES (
            NEW.fund_id,
            one_day_change(NEW.fund_id),  
            one_week_change(NEW.fund_id),  
            one_month_change(NEW.fund_id),  
            three_month_change(NEW.fund_id),  
            six_month_change(NEW.fund_id),  
            one_year_change(NEW.fund_id),  
            lifetime_change(NEW.fund_id), 
            earliest_dt,
            latest_dt,
            max_value,
            min_value,
            fund_std_dev(NEW.fund_id), 
            NEW.price
        );

    ELSE
        UPDATE fund
        SET 
            one_day = one_day_change(NEW.fund_id),
            one_week = one_week_change(NEW.fund_id),
            one_month = one_month_change(NEW.fund_id),
            three_month = three_month_change(NEW.fund_id),
            six_month = six_month_change(NEW.fund_id),
            one_year = one_year_change(NEW.fund_id),
            lifetime = lifetime_change(NEW.fund_id),
            earliest_date = earliest_dt,
            latest_date = latest_dt,
            high = max_value,
            low = min_value,
            standard_deviation = fund_std_dev(NEW.fund_id),
            value = NEW.price
        WHERE fund_id = NEW.fund_id;
    END IF;
END //
```
This trigger updates the `fund` table after a new record is inserted into the `fund_value` table. It calculates various performance metrics and updates the `fund` table accordingly. This is an **update** operation.

## Procedures
### Calculate Fund Rank
```sql
CREATE PROCEDURE calculate_fund_rank()
BEGIN
    SET @rank := 0;
    UPDATE fund
    SET fund_rank = NULL; 
    
    UPDATE fund
    SET fund_rank = (@rank := @rank + 1)
    ORDER BY one_year DESC, six_month DESC, three_month DESC, one_month DESC, one_week DESC, one_day DESC;
END //
```
This procedure calculates the rank of funds based on their performance metrics and updates the `fund_rank` column in the `fund` table. This is an **update** operation.

### Calculate Fund Category Rank
```sql
CREATE PROCEDURE calculate_fund_category_rank()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE cat_id INT;

    DECLARE cur CURSOR FOR SELECT DISTINCT category_id FROM fund_name;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    category_loop: LOOP
        FETCH cur INTO cat_id;
        
        IF done THEN
            LEAVE category_loop;
        END IF;
        
        CREATE TEMPORARY TABLE fund_ranks AS
        SELECT f.fund_id,
               ROW_NUMBER() OVER (
                   ORDER BY f.one_year DESC, f.six_month DESC, f.three_month DESC, 
                            f.one_month DESC, f.one_week DESC, f.one_day DESC
               ) AS rank
        FROM fund AS f
        JOIN fund_name AS fn ON f.fund_id = fn.fund_id
        WHERE fn.category_id = cat_id;

        UPDATE fund AS f
        JOIN fund_ranks AS fr ON f.fund_id = fr.fund_id
        SET f.fund_category_rank = fr.rank;

        DROP TEMPORARY TABLE fund_ranks;

    END LOOP;

    CLOSE cur;
END //
```
This procedure calculates the rank of funds within each category based on their performance metrics and updates the `fund_category_rank` column in the `fund` table. This is an **update** operation.

### Update All Fund Prices
```sql
CREATE PROCEDURE update_all_fund_prices()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE current_fund_id INT;
    DECLARE latest_price DOUBLE;

    DECLARE cur CURSOR FOR SELECT fund_id FROM fund;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;

    fund_loop: LOOP
        FETCH cur INTO current_fund_id;
        
        IF done THEN
            LEAVE fund_loop;
        END IF;

        SELECT price INTO latest_price
        FROM fund_value
        WHERE fund_id = current_fund_id
        ORDER BY date DESC
        LIMIT 1;

        IF latest_price IS NOT NULL THEN
            UPDATE fund
            SET value = latest_price
            WHERE fund_id = current_fund_id;
        END IF;
    END LOOP;

    CLOSE cur;
END;
```
This procedure updates the `value` column in the `fund` table with the latest price for each fund. This is an **update** operation.

# SQL Queries in `app.py`

## User Registration
```sql
INSERT INTO user (user_name, password_hash, salt) VALUES (%s, %s, %s)
```
This query inserts a new user into the `user` table with the provided `user_name`, `password_hash`, and `salt`. This is a **create** operation.

## User Login
```sql
SELECT password_hash, salt, user_id FROM user WHERE user_name = %s
```
This query retrieves the `password_hash`, `salt`, and `user_id` for a given `user_name` from the `user` table. This is a **read** operation.

## Generate Authentication Token
```sql
DELETE FROM auth WHERE user_id = %s
```
This query deletes any existing authentication tokens for the given `user_id` from the `auth` table. This is a **delete** operation.

```sql
INSERT INTO auth (user_id, token_hash, created_on) VALUES (%s, %s, CURDATE())
```
This query inserts a new authentication token into the `auth` table with the provided `user_id`, `token_hash`, and the current date. This is a **create** operation.

## Home Page Data
```sql
SELECT fund_company.company_name AS cname, fund_name.fund_name AS fname, fund.fund_id AS fid, ROUND(fund.{val}, 2) AS price FROM fund_name JOIN fund_company ON fund_name.company_id = fund_company.company_id JOIN fund ON fund_name.fund_id = fund.fund_id ORDER BY fund.{val} DESC LIMIT {lim}
```
This query retrieves the top funds based on different time periods (one year, six months, three months, one month) from the `fund`, `fund_name`, and `fund_company` tables. This is a **read** operation.

## Fund Information
```sql
SELECT fund.one_week, fund.one_month, fund.three_month, fund.six_month, fund.one_year, fund.lifetime, fund.value, fund.standard_deviation, fund_company.company_name, fund_category.category_name, fund_name.fund_name, fund.fund_id FROM fund JOIN fund_name ON (fund.fund_id = fund_name.fund_id AND fund.fund_id = %s) JOIN fund_company ON fund_name.company_id = fund_company.company_id JOIN fund_category ON fund_category.category_id = fund_name.category_id
```
This query retrieves detailed information about a specific fund from the `fund`, `fund_name`, `fund_company`, and `fund_category` tables. This is a **read** operation.

```sql
SELECT company_id, category_id FROM fund_name WHERE fund_id = %s
```
This query retrieves the `company_id` and `category_id` for a given `fund_id` from the `fund_name` table. This is a **read** operation.

```sql
SELECT fund_name.fund_id AS fid, fund_name.fund_name AS fname, ROUND(fund.one_year, 2) AS one_year FROM fund_name JOIN fund ON fund_name.fund_id = fund.fund_id WHERE fund_name.company_id = %s AND fund_name.fund_id != %s ORDER BY fund.fund_rank LIMIT 5
```
This query retrieves up to 5 other funds from the same company with the highest one-year returns from the `fund_name` and `fund` tables. This is a **read** operation.

```sql
SELECT fund_name.fund_id AS fid, fund_name.fund_name AS fname, ROUND(fund.one_year, 2) AS one_year FROM fund_name JOIN fund ON fund_name.fund_id = fund.fund_id WHERE fund_name.category_id = %s AND fund_name.fund_id != %s ORDER BY fund.fund_category_rank LIMIT 5
```
This query retrieves up to 5 other funds from the same category with the highest one-year returns from the `fund_name` and `fund` tables. This is a **read** operation.

## Fund Graph Data
```sql
SELECT UNIQUE date, price FROM fund_value WHERE fund_id = %s ORDER BY date DESC
```
This query retrieves the historical price data for a specific fund from the `fund_value` table. This is a **read** operation.

## Search by Fund Name
```sql
SELECT DISTINCT fund_name.fund_id, fund_name.fund_name, fund.one_year FROM fund_name JOIN fund ON fund_name.fund_id = fund.fund_id WHERE fund_name.fund_name LIKE %s ORDER BY fund.fund_rank limit 15
```
This query retrieves funds that partially match the search query from the `fund_name` and `fund` tables. This is a **read** operation.

## Get All Funds
```sql
SELECT DISTINCT fund_id AS f_id, fund_name as f_name FROM fund_name
```
This query retrieves all funds from the `fund_name` table. This is a **read** operation.

## Get All Fund Companies
```sql
SELECT DISTINCT company_id AS c_id, company_name as c_name FROM fund_company
```
This query retrieves all fund companies from the `fund_company` table. This is a **read** operation.

## Get All Fund Categories
```sql
SELECT DISTINCT category_id AS c_id, category_name as c_name FROM fund_category
```
This query retrieves all fund categories from the `fund_category` table. This is a **read** operation.

## Search Funds by Company
```sql
SELECT UNIQUE company_name from fund_company WHERE company_id = %s
```
This query retrieves the name of a company based on its `company_id` from the `fund_company` table. This is a **read** operation.

```sql
SELECT DISTINCT fund_name.fund_id AS fid, fund_name.fund_name AS fname, ROUND(fund.one_year, 2) as one_year FROM fund_name JOIN fund_company ON fund_name.company_id = fund_company.company_id JOIN fund ON fund_name.fund_id = fund.fund_id WHERE fund_company.company_id = %s ORDER BY fund.fund_rank
```
This query retrieves funds from a specific company from the `fund_name`, `fund_company`, and `fund` tables. This is a **read** operation.

## Search Funds by Category
```sql
SELECT UNIQUE category_name from fund_category WHERE category_id = %s
```
This query retrieves the name of a category based on its `category_id` from the `fund_category` table. This is a **read** operation.

```sql
SELECT DISTINCT fund_name.fund_id AS fid, fund_name.fund_name AS fname, ROUND(fund.one_year, 2) as one_year FROM fund_name JOIN fund_category ON fund_name.category_id = fund_category.category_id JOIN fund ON fund_name.fund_id = fund.fund_id WHERE fund_category.category_id = %s ORDER BY fund.fund_category_rank
```
This query retrieves funds from a specific category from the `fund_name`, `fund_category`, and `fund` tables. This is a **read** operation.

## Watchlist Operations
### List Watchlist Items
```sql
SELECT fund_name.fund_id AS fid, fund_name.fund_name AS fname, ROUND(fund.one_year, 2) AS one_year, ROUND(fund.one_day, 2) AS one_day FROM fund_name JOIN fund ON fund_name.fund_id = fund.fund_id JOIN watchlist ON watchlist.fund_id = fund_name.fund_id WHERE watchlist.user_id = %s ORDER BY fund.fund_rank
```
This query retrieves the watchlist items for a specific user from the `fund_name`, `fund`, and `watchlist` tables. This is a **read** operation.

### Add One Item to Watchlist
```sql
INSERT INTO watchlist (user_id, fund_id) VALUES (%s, %s)
```
This query inserts a new item into the `watchlist` table with the provided `user_id` and `fund_id`. This is a **create** operation.

### Add Many Items to Watchlist
```sql
INSERT INTO watchlist (user_id, fund_id) VALUES (%s, %s)
```
This query inserts multiple items into the `watchlist` table with the provided `user_id` and `fund_id`. This is a **create** operation.

### Delete One Item from Watchlist
```sql
DELETE FROM watchlist WHERE user_id = %s AND fund_id = %s
```
This query deletes a specific item from the `watchlist` table based on the provided `user_id` and `fund_id`. This is a **delete** operation.

## Portfolio Operations
### Add to Portfolio
```sql
INSERT INTO portfolio (user_id, fund_id, bought_on, bought_for, invested_amount, sold_on, sold_for, return_amount) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
```
This query inserts a new item into the `portfolio` table with the provided details. This is a **create** operation.

### Update Portfolio
```sql
UPDATE portfolio SET sold_on=%s, sold_for=%s, return_amount=%s WHERE user_id=%s AND fund_id=%s AND bought_on=%s
```
This query updates the sell information for a specific item in the `portfolio` table based on the provided `user_id`, `fund_id`, and `bought_on` date. This is an **update** operation.

### List Portfolio Items
```sql
SELECT portfolio.fund_id as fid, fund_name.fund_name as fname, bought_on, bought_for, invested_amount, sold_on, sold_for, return_amount, fund.value FROM portfolio, fund, fund_name where portfolio.fund_id = fund.fund_id AND portfolio.user_id = %s AND portfolio.fund_id = fund_name.fund_id ORDER BY invested_amount DESC
```
This query retrieves the portfolio items for a specific user from the `portfolio`, `fund`, and `fund_name` tables. This is a **read** operation.

### Delete an Item from Portfolio
```sql
DELETE FROM portfolio WHERE user_id = %s AND fund_id = %s AND bought_on = %s
```
This query deletes a specific item from the `portfolio` table based on the provided `user_id`, `fund_id`, and `bought_on` date. This is a **delete** operation.

## Top Funds
```sql
SELECT fund_company.company_name AS cname, fund_name.fund_name AS fname, fund.fund_id AS fid, fund.one_year as one_year FROM fund_name JOIN fund_company ON fund_name.company_id = fund_company.company_id JOIN fund ON fund_name.fund_id = fund.fund_id ORDER BY fund.fund_rank
```
This query retrieves the top funds based on their rank from the `fund_name`, `fund_company`, and `fund` tables. This is a **read** operation.

## Fund Price on a Given Date
```sql
SELECT price FROM fund_value WHERE fund_id = %s AND date <= %s ORDER BY date DESC LIMIT 1
```
This query retrieves the price of a fund on or before a given date from the `fund_value` table. This is a **read** operation.

# API Documentation for `app.py`

## User Registration
### Endpoint
`/register`
### Method
`POST`
### Query Values
- `user_name`: The username of the new user.
- `password`: The password of the new user.
### Return Values
- `status`: Success or failure message.
- `user_id`: The ID of the newly created user (on success).

## User Login
### Endpoint
`/login`
### Method
`POST`
### Query Values
- `user_name`: The username of the user.
- `password`: The password of the user.
### Return Values
- `status`: Success or failure message.
- `token`: Authentication token (on success).

## Generate Authentication Token
### Endpoint
`/auth/token`
### Method
`POST`
### Query Values
- `user_id`: The ID of the user.
### Return Values
- `status`: Success or failure message.
- `token`: New authentication token (on success).

## Home Page Data
### Endpoint
`/home`
### Method
`GET`
### Query Values
- `val`: The value to sort by (e.g., one_year, six_month).
- `lim`: The limit of records to return.
### Return Values
- `funds`: List of top funds with company name, fund name, fund ID, and price.

## Fund Information
### Endpoint
`/fund/<fund_id>`
### Method
`GET`
### Query Values
- `fund_id`: The ID of the fund.
### Return Values
- `fund_info`: Detailed information about the fund including performance metrics, company name, category name, and fund name.

## Fund Graph Data
### Endpoint
`/fund/<fund_id>/graph`
### Method
`GET`
### Query Values
- `fund_id`: The ID of the fund.
### Return Values
- `graph_data`: Historical price data for the fund.

## Search by Fund Name
### Endpoint
`/search`
### Method
`GET`
### Query Values
- `query`: The search query for the fund name.
### Return Values
- `results`: List of funds that match the search query.

## Get All Funds
### Endpoint
`/funds`
### Method
`GET`
### Query Values
None
### Return Values
- `funds`: List of all funds.

## Get All Fund Companies
### Endpoint
`/companies`
### Method
`GET`
### Query Values
None
### Return Values
- `companies`: List of all fund companies.

## Get All Fund Categories
### Endpoint
`/categories`
### Method
`GET`
### Query Values
None
### Return Values
- `categories`: List of all fund categories.

## Search Funds by Company
### Endpoint
`/company/<company_id>/funds`
### Method
`GET`
### Query Values
- `company_id`: The ID of the company.
### Return Values
- `funds`: List of funds from the specified company.

## Search Funds by Category
### Endpoint
`/category/<category_id>/funds`
### Method
`GET`
### Query Values
- `category_id`: The ID of the category.
### Return Values
- `funds`: List of funds from the specified category.

## Watchlist Operations
### List Watchlist Items
#### Endpoint
`/watchlist`
#### Method
`GET`
#### Query Values
- `user_id`: The ID of the user.
#### Return Values
- `watchlist`: List of watchlist items for the user.

### Add One Item to Watchlist
#### Endpoint
`/watchlist`
#### Method
`POST`
#### Query Values
- `user_id`: The ID of the user.
- `fund_id`: The ID of the fund.
#### Return Values
- `status`: Success or failure message.

### Delete One Item from Watchlist
#### Endpoint
`/watchlist`
#### Method
`DELETE`
#### Query Values
- `user_id`: The ID of the user.
- `fund_id`: The ID of the fund.
#### Return Values
- `status`: Success or failure message.

## Portfolio Operations
### Add to Portfolio
#### Endpoint
`/portfolio`
#### Method
`POST`
#### Query Values
- `user_id`: The ID of the user.
- `fund_id`: The ID of the fund.
- `bought_on`: The date the fund was bought.
- `bought_for`: The price the fund was bought for.
- `invested_amount`: The amount invested.
#### Return Values
- `status`: Success or failure message.

### Update Portfolio
#### Endpoint
`/portfolio`
#### Method
`PUT`
#### Query Values
- `user_id`: The ID of the user.
- `fund_id`: The ID of the fund.
- `bought_on`: The date the fund was bought.
- `sold_on`: The date the fund was sold.
- `sold_for`: The price the fund was sold for.
- `return_amount`: The return amount.
#### Return Values
- `status`: Success or failure message.

### List Portfolio Items
#### Endpoint
`/portfolio`
#### Method
`GET`
#### Query Values
- `user_id`: The ID of the user.
#### Return Values
- `portfolio`: List of portfolio items for the user.

### Delete an Item from Portfolio
#### Endpoint
`/portfolio`
#### Method
`DELETE`
#### Query Values
- `user_id`: The ID of the user.
- `fund_id`: The ID of the fund.
- `bought_on`: The date the fund was bought.
#### Return Values
- `status`: Success or failure message.

## Top Funds
### Endpoint
`/top-funds`
### Method
`GET`
### Query Values
None
### Return Values
- `funds`: List of top funds based on their rank.

## Fund Price on a Given Date
### Endpoint
`/fund/<fund_id>/price`
### Method
`GET`
### Query Values
- `fund_id`: The ID of the fund.
- `date`: The date to retrieve the price for.
### Return Values
- `price`: The price of the fund on or before the given date.