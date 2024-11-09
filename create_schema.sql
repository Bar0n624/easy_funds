Use fund;
Create table fund_company(company_id int primary key auto_increment, company_name varchar(500));
Create table fund_category(category_id int primary key auto_increment, category_name varchar(500));
Create table fund_name(fund_id int primary key auto_increment , company_id int, category_id int, fund_name varchar(500),
foreign key(category_id) references fund_category(category_id), foreign key(company_id) references fund_company(company_id));
Create table fund_value(fund_id int, date datetime, price double, foreign key(fund_id) references fund_name(fund_id));
Create table fund(fund_id int, one_day double, one_week double, one_month double, three_month double, 
six_month double, one_year double, lifetime double, earliest_date datetime, latest_date datetime, high double, low double, standard_deviation double,
value double, fund_rank int, fund_category_rank int, primary key(fund_id), foreign key(fund_id) references fund_name(fund_id));
Create table user(user_id int primary key auto_increment, username varchar(20), password char(60));
Create table portfolio(user_id int, fund_id int, bought_on datetime, bought_for double, sold_on datetime, sold_for double, invested_amount double
, return_amount double, foreign key(user_id) references user(user_id), foreign key(fund_id) references fund_name(fund_id),
primary key(user_id, fund_id, bought_on) );
Create table watchlist(user_id int, fund_id int, foreign key(user_id) references user(user_id), foreign key(fund_id) references fund_name(fund_id),
primary key(user_id, fund_id));


DELIMITER //

-- Calculate one-day change percentage
CREATE FUNCTION one_day_change(f_id INT) RETURNS DOUBLE
BEGIN
    DECLARE change_val DOUBLE;
    SET change_val = (
        SELECT (latest.price - previous.price) / previous.price * 100
        FROM fund_value AS latest
        JOIN fund_value AS previous
        ON previous.date = DATE_SUB(latest.date, INTERVAL 1 DAY)
        WHERE latest.fund_id = f_id
        ORDER BY latest.date DESC
        LIMIT 1
    );
    RETURN IFNULL(change_val, 0);
END //

-- Calculate one-week change percentage
CREATE FUNCTION one_week_change(f_id INT) RETURNS DOUBLE
BEGIN
    DECLARE change_val DOUBLE;
    SET change_val = (
        SELECT (latest.price - previous.price) / previous.price * 100
        FROM fund_value AS latest
        JOIN fund_value AS previous
        ON previous.date = DATE_SUB(latest.date, INTERVAL 7 DAY)
        WHERE latest.fund_id = f_id
        ORDER BY latest.date DESC
        LIMIT 1
    );
    RETURN IFNULL(change_val, 0);
END //

-- Calculate one-month change percentage
CREATE FUNCTION one_month_change(f_id INT) RETURNS DOUBLE
BEGIN
    DECLARE change_val DOUBLE;
    SET change_val = (
        SELECT (latest.price - previous.price) / previous.price * 100
        FROM fund_value AS latest
        JOIN fund_value AS previous
        ON previous.date = DATE_SUB(latest.date, INTERVAL 1 MONTH)
        WHERE latest.fund_id = f_id
        ORDER BY latest.date DESC
        LIMIT 1
    );
    RETURN IFNULL(change_val, 0);
END //

-- Calculate three-month change percentage
CREATE FUNCTION three_month_change(f_id INT) RETURNS DOUBLE
BEGIN
    DECLARE change_val DOUBLE;
    SET change_val = (
        SELECT (latest.price - previous.price) / previous.price * 100
        FROM fund_value AS latest
        JOIN fund_value AS previous
        ON previous.date = DATE_SUB(latest.date, INTERVAL 3 MONTH)
        WHERE latest.fund_id = f_id
        ORDER BY latest.date DESC
        LIMIT 1
    );
    RETURN IFNULL(change_val, 0);
END //

-- Calculate six-month change percentage
CREATE FUNCTION six_month_change(f_id INT) RETURNS DOUBLE
BEGIN
    DECLARE change_val DOUBLE;
    SET change_val = (
        SELECT (latest.price - previous.price) / previous.price * 100
        FROM fund_value AS latest
        JOIN fund_value AS previous
        ON previous.date = DATE_SUB(latest.date, INTERVAL 6 MONTH)
        WHERE latest.fund_id = f_id
        ORDER BY latest.date DESC
        LIMIT 1
    );
    RETURN IFNULL(change_val, 0);
END //

-- Calculate one-year change percentage
CREATE FUNCTION one_year_change(f_id INT) RETURNS DOUBLE
BEGIN
    DECLARE change_val DOUBLE;
    SET change_val = (
        SELECT (latest.price - previous.price) / previous.price * 100
        FROM fund_value AS latest
        JOIN fund_value AS previous
        ON previous.date = DATE_SUB(latest.date, INTERVAL 1 YEAR)
        WHERE latest.fund_id = f_id
        ORDER BY latest.date DESC
        LIMIT 1
    );
    RETURN IFNULL(change_val, 0);
END //

-- Calculate lifetime change percentage (based on earliest price entry)
CREATE FUNCTION lifetime_change(f_id INT) RETURNS DOUBLE
BEGIN
    DECLARE change_val DOUBLE;
    SET change_val = (
        SELECT (latest.price - earliest.price) / earliest.price * 100
        FROM fund_value AS latest
        JOIN fund_value AS earliest
        ON earliest.date = (
            SELECT MIN(date)
            FROM fund_value
            WHERE fund_id = f_id
        )
        WHERE latest.fund_id = f_id
        ORDER BY latest.date DESC
        LIMIT 1
    );
    RETURN IFNULL(change_val, 0);
END //

-- Calculate standard deviation over lifetime
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

CREATE TRIGGER update_fund_after_insert
AFTER INSERT ON fund_value
FOR EACH ROW
BEGIN
    DECLARE max_value DOUBLE;
    DECLARE min_value DOUBLE;
    DECLARE earliest_dt DATETIME;
    DECLARE latest_dt DATETIME;

    -- Calculate high (max) and low (min) prices
    SET max_value = (SELECT MAX(price) FROM fund_value WHERE fund_id = NEW.fund_id);
    SET min_value = (SELECT MIN(price) FROM fund_value WHERE fund_id = NEW.fund_id);
    
    -- Get earliest and latest dates for the fund
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
            one_day_change(NEW.fund_id),  -- Use function for one_day change
            one_week_change(NEW.fund_id),  -- Use function for one_week change
            one_month_change(NEW.fund_id),  -- Use function for one_month change
            three_month_change(NEW.fund_id),  -- Use function for three_month change
            six_month_change(NEW.fund_id),  -- Use function for six_month change
            one_year_change(NEW.fund_id),  -- Use function for one_year change
            lifetime_change(NEW.fund_id),  -- Use function for lifetime change
            earliest_dt,
            latest_dt,
            max_value,
            min_value,
            fund_std_dev(NEW.fund_id),  -- Use function for standard deviation
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

CREATE PROCEDURE calculate_fund_rank()
BEGIN
    -- Calculate fund ranks based on returns in the specified order
    SET @rank := 0;
    UPDATE fund
    SET fund_rank = NULL; -- Reset ranks first
    
    UPDATE fund
    SET fund_rank = (@rank := @rank + 1)
    ORDER BY one_year DESC, six_month DESC, three_month DESC, one_month DESC, one_week DESC, one_day DESC;
END //

CREATE PROCEDURE calculate_fund_category_rank()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE cat_id INT;
    DECLARE cur CURSOR FOR SELECT DISTINCT category_id FROM fund;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Cursor to iterate over each category
    OPEN cur;
    category_loop: LOOP
        FETCH cur INTO cat_id;
        IF done THEN
            LEAVE category_loop;
        END IF;
        
        -- Rank funds within the current category
        SET @category_rank := 0;
        UPDATE fund
        SET fund_category_rank = NULL -- Reset ranks first
        WHERE category_id = cat_id;
        
        UPDATE fund
        SET fund_category_rank = (@category_rank := @category_rank + 1)
        WHERE category_id = cat_id
        ORDER BY one_year DESC, six_month DESC, three_month DESC, one_month DESC, one_week DESC, one_day DESC;
    END LOOP;

    CLOSE cur;
END //

DELIMITER ;


