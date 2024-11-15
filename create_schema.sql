USE fund;

-- Login info
CREATE TABLE user(user_id int primary key auto_increment, user_name varchar(500) NOT NULL UNIQUE, password_hash char(64) NOT NULL, salt char(32) NOT NULL);

-- Fund related schema
CREATE TABLE fund_company(company_id int primary key auto_increment, company_name varchar(500));
CREATE TABLE fund_category(category_id int primary key auto_increment, category_name varchar(500));
CREATE TABLE fund_name(fund_id int primary key auto_increment , company_id int, category_id int, fund_name varchar(500),
foreign key(category_id) references fund_category(category_id), foreign key(company_id) references fund_company(company_id));
CREATE TABLE fund_value(fund_id int, date datetime, price double, foreign key(fund_id) references fund_name(fund_id));
CREATE TABLE fund(fund_id int, one_day double, one_week double, one_month double, three_month double,
six_month double, one_year double, lifetime double, earliest_date datetime, latest_date datetime, high double, low double, standard_deviation double,
value double, fund_rank int, fund_category_rank int, primary key(fund_id), foreign key(fund_id) references fund_name(fund_id));
CREATE TABLE portfolio(user_id int, fund_id int, bought_on datetime, bought_for double, sold_on datetime, sold_for double, invested_amount double
, return_amount double, foreign key(user_id) references user(user_id), foreign key(fund_id) references fund_name(fund_id),
primary key(user_id, fund_id, bought_on) );
CREATE TABLE watchlist(user_id int, fund_id int, foreign key(user_id) references user(user_id), foreign key(fund_id) references fund_name(fund_id),
primary key(user_id, fund_id));
CREATE TABLE auth (user_id INT(11) NOT NULL, token_hash CHAR(64) NOT NULL PRIMARY KEY, created_on DATE NOT NULL);


DELIMITER //

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

CREATE PROCEDURE calculate_fund_rank()
BEGIN
    SET @rank := 0;
    UPDATE fund
    SET fund_rank = NULL; 
    
    UPDATE fund
    SET fund_rank = (@rank := @rank + 1)
    ORDER BY one_year DESC, six_month DESC, three_month DESC, one_month DESC, one_week DESC, one_day DESC;
END //

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


DELIMITER ;


