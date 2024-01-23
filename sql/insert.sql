-- inserts values into the ddl.sql tables
use pulse;

-- Here I just reset the database with some dummy data.
LOAD DATA LOCAL INFILE 'users.csv'
INTO TABLE user
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(user_id, username, email, adress, phonenumber)
SET credentials = 'user';

UPDATE user
SET credentials = 'manager'
WHERE user_id = 1;

INSERT INTO project (project_name, report_frequency, report_day,reporting_time, project_start_date, project_end_date, project_manager)
VALUES 
('Project 1', 'daily', NULL , '09:00:00' ,'2023-10-02 09:00:00', '2023-10-30 17:00:00', 1),
('Project 2', 'weekly','monday','09:00:00', '2023-09-01 09:00:00', '2023-12-03 17:00:00', 1),
('Project 3', 'fortnight','friday','09:00:00', '2021-09-01 09:00:00', '2023-10-30 17:00:00', 1),
('Project 4', 'monthly','monday','09:00:00', '2023-10-01 09:00:00', '2023-10-30 17:00:00', 1);


INSERT INTO project_assignment (project_id, user_id)
VALUES 
(1, 2),
(1, 3),
(2, 2),
(3, 3);

INSERT INTO report (report_name, report_description, report_start_date, report_end_date, project_id, user_id)
VALUES 
('Report 1', 'Tell me about your day', '2023-10-01 09:00:00', '2023-10-25 17:00:00', 1, 2),
('Report 2', 'Tell me about your day', '2023-10-01 09:00:00', '2023-10-25 17:00:00', 1, 3),
('Report 3','Weekly HOD report', '2023-10-01 09:00:00', '2023-10-25 20:00:00', 2, 2),
('Report 4','Write whatever you want', '2023-10-01 09:00:00', '2023-10-30 09:00:00', 2, 2),
('Report 5', 'Describe what a fortnight is','2023-10-01 09:00:00', '2023-10-30 09:00:00', 3, 3),
('Report 6','Write something you have learned this month', '2023-10-01 09:00:00', '2023-10-30 09:00:00', 3, 3);


--
-- USER PROCEDURES
--

DROP PROCEDURE IF EXISTS createuser;
DELIMITER $$

CREATE PROCEDURE createuser(
    IN user_id_param INT,
    IN username_param VARCHAR(255),
    IN email_param VARCHAR(255),
    IN adress_param VARCHAR(255),
    IN phonenumber_param VARCHAR(20)
)
BEGIN
    IF (SELECT COUNT(*) FROM user WHERE user_id = user_id_param) = 0 THEN
        INSERT INTO user (user_id, username, email, adress, phonenumber, credentials) 
        VALUES (user_id_param, username_param, email_param, adress_param, phonenumber_param, 'user');
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User already exists';
    END IF;
END $$

DELIMITER ;


DROP PROCEDURE IF EXISTS userlogin;
DELIMITER $$

CREATE PROCEDURE userlogin(IN email_param VARCHAR(255))
BEGIN
        SELECT password, email, username, credentials, user_id FROM user WHERE email = email_param;
END $$

DELIMITER ;


DROP PROCEDURE IF EXISTS changepassword;
DELIMITER $$

CREATE PROCEDURE changepassword(IN email_param VARCHAR(255), IN new_password_param VARCHAR(255))
BEGIN 
    -- update the password of the user with the given email, delete the token from the tokens table
    UPDATE user 
    SET password = new_password_param 
    WHERE email = email_param;
    DELETE FROM tokens 
    WHERE email = email_param;

END $$

DELIMITER ;

-- tokens are for email verification and password reset. 
DROP PROCEDURE IF EXISTS addtoken;

DELIMITER $$

CREATE PROCEDURE addtoken(IN user_email_param VARCHAR(255), IN token_param VARCHAR(255))
BEGIN
    INSERT INTO tokens (email, token) VALUES (user_email_param, token_param);
END $$

DELIMITER ;


DROP PROCEDURE IF EXISTS verifytoken;

DELIMITER $$

CREATE PROCEDURE verifytoken(IN token_param VARCHAR(255))
BEGIN
    SELECT email, COUNT(*) as token_count FROM tokens WHERE token = token_param GROUP BY email;
END $$


DELIMITER ;


--
-- PROJECT PROCEDURES
--


DROP PROCEDURE IF EXISTS createproject;

DELIMITER $$

CREATE PROCEDURE createproject(
    IN project_name VARCHAR(255), 
    IN report_frequency ENUM('daily', 'weekly', 'fortnight', 'monthly'), 
    IN report_day ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday'),
    IN reporting_time TIME,
    IN project_start_date DATETIME,
    IN project_end_date DATETIME,
    IN project_manager INT
)

BEGIN 
    INSERT INTO project 
    (project_name, report_frequency, report_day, reporting_time, project_start_date, project_end_date, project_manager) 
    VALUES 
    (project_name, report_frequency, report_day, reporting_time, project_start_date, project_end_date,  project_manager);
END $$

DELIMITER ;


DROP PROCEDURE IF EXISTS editproject;
DELIMITER $$

CREATE PROCEDURE editproject( 
    IN project_id_param INT,
    IN project_name VARCHAR(255), 
    IN report_frequency ENUM('daily', 'weekly', 'fortnight', 'monthly'), 
    IN report_day ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday'),
    IN reporting_time TIME,
    IN project_start_date DATETIME,
    IN project_end_date DATETIME
    
)
BEGIN
    UPDATE project
    SET 
    project_name = project_name,
    report_frequency = report_frequency, 
    report_day = report_day, 
    reporting_time = reporting_time,
    project_start_date = project_start_date, 
    project_end_date = project_end_date
    WHERE 
    project_id = project_id_param;
END $$

DELIMITER ;


DROP PROCEDURE IF EXISTS addusertoproject;
DELIMITER $$

CREATE PROCEDURE addusertoproject(IN project_id_param INT, IN added_user_param INT)
BEGIN
    IF (SELECT COUNT(*) FROM project_assignment WHERE project_id = project_id_param AND user_id = added_user_param) = 0 THEN
        INSERT INTO project_assignment VALUES (project_id_param, added_user_param);
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User is already in the project';
    END IF;
END $$

DELIMITER ;


--
-- REPORT PROCEDURES 
--

DROP PROCEDURE IF EXISTS createreport;
DELIMITER $$

CREATE PROCEDURE createreport(
    IN report_name VARCHAR(255), 
    IN report_description VARCHAR(255),
    IN report_start_date DATETIME,
    IN report_end_date DATETIME,
    IN user_id_param INT,
    IN project_id_param INT
)
BEGIN 
    INSERT INTO report 
    (report_name, report_description, report_start_date, report_end_date, user_id, project_id) 
    VALUES 
    (report_name, report_description, report_start_date, report_end_date, user_id_param, project_id_param);
END $$

DELIMITER ;

DROP PROCEDURE IF EXISTS editreport;
DELIMITER $$

CREATE PROCEDURE editreport(
    IN report_id_param INT,
    IN report_name_param VARCHAR(255),
    IN report_description_param VARCHAR(255),
    IN report_start_date_param DATETIME,
    IN report_end_date_param DATETIME
)
BEGIN 
    UPDATE report
    SET
    report_name = report_name_param,
    report_description = report_description_param,
    report_start_date = report_start_date_param,
    report_end_date = report_end_date_param
    WHERE
    report_id = report_id_param;
END $$

DELIMITER ;

DROP PROCEDURE IF EXISTS updatereport;
DELIMITER $$

CREATE PROCEDURE updatereport(
    IN content_id_param INT,
    IN report_id_param INT,
    IN report_content_param TEXT,
    IN report_status_param ENUM('not started', 'in progress', 'completed', 'read')
)
BEGIN 
    IF (report_status_param = 'read') THEN
        IF report_content_param IS NOT NULL THEN
            UPDATE report_content
            SET
            report_comments = report_content_param
            WHERE 
            content_id = content_id_param AND report_id = report_id_param;

            UPDATE report
            SET
            report_status = report_status_param
            WHERE
            report_id = report_id_param;
        ELSE
            UPDATE report
            SET
            report_status = report_status_param
            WHERE
            report_id = report_id_param;
        END IF;

    ELSEIF (report_status_param = 'completed') THEN
        INSERT INTO report_content (report_id, content, submission_time) 
        VALUES (report_id_param, report_content_param, NOW());

        UPDATE report
        SET
        report_status = report_status_param
        WHERE
        report_id = report_id_param;

    END IF;
END $$
DELIMITER ;



DROP PROCEDURE IF EXISTS showcontent;
DELIMITER $$

CREATE PROCEDURE showcontent(IN report_id_param INT)
BEGIN
    SELECT * FROM report_content WHERE report_id = report_id_param;
END $$
DELIMITER ;


--
-- DISPLAY PROCEDURES
--

DROP PROCEDURE IF EXISTS showusers;

DELIMITER $$

CREATE PROCEDURE showusers()
BEGIN
    SELECT 
        u.user_id,
        u.username,
        u.email,
        u.adress,
        u.phonenumber,
        u.credentials,
        GROUP_CONCAT(DISTINCT p.project_name) AS projects,
        COUNT(DISTINCT r.report_id) AS reports
    FROM
        user u
    LEFT JOIN
        project_assignment pa ON u.user_id = pa.user_id
    LEFT JOIN
        project p ON pa.project_id = p.project_id
    LEFT JOIN
        report r ON u.user_id = r.user_id
    GROUP BY
        u.user_id, u.username, u.email, u.adress, u.phonenumber, u.credentials;
END $$

DELIMITER ;

DROP PROCEDURE IF EXISTS showusersinproject;

DELIMITER $$
CREATE PROCEDURE showusersinproject(IN project_id_param INT)
BEGIN
    SELECT * FROM user WHERE user_id IN (SELECT user_id FROM project_assignment WHERE project_id = project_id_param);
END $$
DELIMITER ;

DROP VIEW IF EXISTS projectdashboard;

CREATE VIEW projectdashboard AS
SELECT
    p.project_id,
    p.project_name,
    p.report_frequency,
    p.report_day,
    p.reporting_time,
    p.project_start_date AS project_start_date,
    p.project_end_date AS project_end_date,
    u.user_id AS project_manager_id,
    u.username AS project_manager_username,
    ua.user_id AS assigned_user_id,
    ua.username AS assigned_username,
    (SELECT COUNT(*) FROM report WHERE project_id = p.project_id AND report_status IN ('not started','in progress')) AS reports_in_progress,
    (SELECT COUNT(*) FROM report WHERE project_id = p.project_id AND report_status = 'completed') AS reports_completed,
    (SELECT COUNT(*) FROM report WHERE project_id = p.project_id AND report_status = 'unread') AS reports_unread,
    (SELECT COUNT(*) FROM report WHERE project_id = p.project_id AND report_status = 'read') AS reports_read,
    (SELECT COUNT(*) FROM report WHERE project_id = p.project_id AND report_status IN ('not started','in progress') AND user_id = ua.user_id) AS assigned_reports_in_progress,
    (SELECT COUNT(*) FROM report WHERE project_id = p.project_id AND report_status = 'unread' AND user_id = ua.user_id) AS assigned_reports_unread

FROM
    project p
JOIN
    user u ON p.project_manager = u.user_id
LEFT JOIN
    project_assignment pa ON p.project_id = pa.project_id
LEFT JOIN
    user ua ON pa.user_id = ua.user_id;

DROP PROCEDURE IF EXISTS showprojectdashboard;

DELIMITER $$

CREATE PROCEDURE showprojectdashboard(IN username_param VARCHAR(255))
BEGIN
    SELECT * FROM projectdashboard 
    WHERE project_manager_username = username_param OR assigned_username = username_param;
END $$

DELIMITER ;

DROP VIEW IF EXISTS reportdashboard;

CREATE VIEW reportdashboard AS
SELECT
    r.report_id,
    r.report_name,
    r.report_description,
    r.report_start_date AS report_start_date,
    r.report_end_date AS report_end_date,
    r.report_status,
    u.user_id AS assigned_user_id,
    u.username AS assigned_username,
    p.project_id,
    p.project_name,
    p.report_frequency,
    p.report_day,
    p.reporting_time,
    p.project_start_date AS project_start_date,
    p.project_end_date AS project_end_date,
    pm.user_id AS project_manager_id,
    pm.username AS project_manager_username
FROM
    report r
JOIN
    user u ON r.user_id = u.user_id
JOIN
    project p ON r.project_id = p.project_id
JOIN
    user pm ON p.project_manager = pm.user_id;

DROP PROCEDURE IF EXISTS showreportdashboard;

DELIMITER $$
CREATE PROCEDURE showreportdashboard(IN project_id_param INT)
BEGIN
    SELECT * FROM reportdashboard WHERE project_id = project_id_param;
END $$

DELIMITER ;

DROP PROCEDURE IF EXISTS reportinformation;

DELIMITER $$
CREATE PROCEDURE reportinformation(IN report_id_param INT)
BEGIN
    SELECT * FROM reportdashboard WHERE report_id = report_id_param;
END $$
DELIMITER ;

DROP PROCEDURE IF EXISTS showuserprofile;

DELIMITER $$
CREATE PROCEDURE showuserprofile(IN username_param VARCHAR(255))
BEGIN
    SELECT 
        u.user_id,
        u.username,
        u.email,
        u.adress,
        u.phonenumber,
        u.credentials,
        GROUP_CONCAT(DISTINCT p.project_name) AS projects,
        GROUP_CONCAT(DISTINCT r.report_name) AS reports
    FROM
        user u
    LEFT JOIN
        project_assignment pa ON u.user_id = pa.user_id
    LEFT JOIN
        project p ON pa.project_id = p.project_id
    LEFT JOIN
        report r ON u.user_id = r.user_id
    WHERE
        u.username = username_param
    GROUP BY
        u.user_id, u.username, u.email, u.adress, u.phonenumber, u.credentials;
END $$

DELIMITER ;


--
-- UPDATE PROCEDURES / TRIGGERS
--

DROP TRIGGER IF EXISTS update_report_status;

DELIMITER $$
CREATE TRIGGER update_report_status
AFTER UPDATE ON report
FOR EACH ROW
BEGIN
    IF NEW.report_status = 'completed' AND OLD.report_status != 'completed' THEN
        INSERT INTO updates (report_id, content, time_stamp)
        VALUES (NEW.report_id, CONCAT(NEW.report_name, ' has been completed.'), NOW());
    END IF;
    
    IF NEW.report_status = 'read' AND OLD.report_status != 'read' THEN
        INSERT INTO updates (report_id, content, time_stamp)
        VALUES (NEW.report_id, CONCAT(NEW.report_name, ' has been read.'), NOW());
    END IF;
END $$
DELIMITER ;


DROP PROCEDURE IF EXISTS showupdates;

DELIMITER $$

CREATE PROCEDURE showupdates(IN username_param VARCHAR(255), IN user_role_param VARCHAR(50))
BEGIN
    IF user_role_param = 'manager' THEN
        SELECT * FROM updates;
    ELSE
        SELECT * FROM updates WHERE report_id 
        IN (SELECT report_id FROM report 
        WHERE user_id = (SELECT user_id FROM user WHERE username = username_param));
    END IF;
END $$

DELIMITER ;

DROP PROCEDURE IF EXISTS getreportingdays;

DELIMITER $$

CREATE PROCEDURE getreportingdays(projectId INT)
BEGIN
    DECLARE startdate DATE;
    DECLARE enddate DATE;
    DECLARE frequency ENUM('daily', 'weekly', 'fortnight', 'monthly');
    DECLARE reportday ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday');
    DECLARE curdate DATE;
    
    DECLARE done INT DEFAULT 0;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    SELECT project_start_date, project_end_date, report_frequency, report_day 
    INTO startdate, enddate, frequency, reportday
    FROM project
    WHERE project_id = projectId;

    DROP TEMPORARY TABLE IF EXISTS Reportdays;
    CREATE TEMPORARY TABLE Reportdays (report_date DATE);

    SET curdate = startdate;

    WHILE curdate <= enddate DO
        CASE
            WHEN frequency = 'daily' AND DAYOFWEEK(curdate) NOT IN (1,7) THEN
                INSERT INTO Reportdays(report_date) VALUES (curdate);
            WHEN frequency = 'weekly' AND reportday IS NOT NULL AND DAYNAME(curdate) = UCASE(reportday) THEN
                INSERT INTO Reportdays(report_date) VALUES (curdate);
            WHEN frequency = 'fortnight' AND reportday IS NOT NULL AND DAYNAME(curdate) = UCASE(reportday) THEN
                IF (DATEDIFF(curdate, startdate) DIV 7) MOD 2 = 0 THEN
                    INSERT INTO Reportdays(report_date) VALUES (curdate);
                END IF;
            WHEN frequency = 'monthly' AND reportday IS NOT NULL AND DAYNAME(curdate) = UCASE(reportday) THEN
                IF DAY(curdate) BETWEEN 1 AND 7 THEN
                    INSERT INTO Reportdays(report_date) VALUES (curdate);
                END IF;
            ELSE
                SET curdate = curdate;
        END CASE;

        SET curdate = DATE_ADD(curdate, INTERVAL 1 DAY);
    END WHILE;

    SELECT report_date FROM Reportdays;

END $$

DELIMITER ;


DROP PROCEDURE IF EXISTS getuserdeadlines;

DELIMITER $$

CREATE PROCEDURE getuserdeadlines(username VARCHAR(255))
BEGIN

    DECLARE _projectid INT;
    DECLARE done INT DEFAULT 0;
    
    DECLARE projectcursor CURSOR FOR
    SELECT pa.project_id 
    FROM project_assignment pa
    JOIN user u ON pa.user_id = u.user_id
    WHERE u.username = username;
   
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
    
    DROP TEMPORARY TABLE IF EXISTS userdeadlines;
    CREATE TEMPORARY TABLE userdeadlines (project_id INT, report_date DATE);
    

    OPEN projectcursor;
    
    read_loop: LOOP
        FETCH projectcursor INTO _projectid;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        CALL getreportingdays(_projectid);
        
        INSERT INTO userdeadlines
        SELECT _projectid, report_date FROM reportdays WHERE report_date >= CURDATE();

    END LOOP;

    CLOSE projectcursor;

    SELECT * FROM userdeadlines WHERE report_date >= CURDATE() ORDER BY report_date;

END $$

DELIMITER ;
