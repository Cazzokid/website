-- creates the tables that are used in Project Pulse.
use pulse;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS timestamps;
DROP TABLE IF EXISTS updates;
DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS report_content;
DROP TABLE IF EXISTS report;
DROP TABLE IF EXISTS project_assignment;
DROP TABLE IF EXISTS project;
DROP TABLE IF EXISTS user;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE user (
    user_id INT PRIMARY KEY,
    username VARCHAR(255) UNIQUE KEY NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    adress VARCHAR(255),
    phonenumber VARCHAR(255),
    password VARCHAR(255),
    credentials ENUM('manager', 'user') NOT NULL DEFAULT 'user'
);

CREATE TABLE project (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    report_frequency ENUM('daily', 'weekly', 'fortnight', 'monthly') NOT NULL DEFAULT 'daily',
    report_day ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday'),
    reporting_time TIME NOT NULL,
    project_start_date DATETIME NOT NULL,
    project_end_date DATETIME NOT NULL,
    project_manager INT NOT NULL,
    FOREIGN KEY (project_manager) REFERENCES user(user_id)
);

-- this is to avoid many-many relationships between user and project
CREATE TABLE project_assignment(
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES project(project_id),
    FOREIGN KEY (user_id) REFERENCES user(user_id)
);

CREATE TABLE report (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    report_name VARCHAR(255)UNIQUE KEY NOT NULL,
    report_description VARCHAR(255),
    report_start_date DATETIME NOT NULL,
    report_end_date DATETIME NOT NULL,
    report_status ENUM('not started', 'completed', 'unread', 'read') NOT NULL DEFAULT 'not started',
    user_id INT, 
    project_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(user_id),
    FOREIGN KEY (project_id) REFERENCES project(project_id)
);

CREATE TABLE report_content (
    content_id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    content TEXT NOT NULL,
    submission_time DATETIME NOT NULL,
    report_comments VARCHAR(255),
    FOREIGN KEY (report_id) REFERENCES report(report_id)
);

CREATE TABLE tokens (
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    FOREIGN KEY (email) REFERENCES user(email)
);

CREATE TABLE updates (
    report_id INT NOT NULL,
    content VARCHAR(255),
    time_stamp DATETIME NOT NULL,
    FOREIGN KEY (report_id) REFERENCES report(report_id)

);

CREATE TABLE timestamps (
    deadline_id INT NOT NULL,
    report_id INT NOT NULL,
    report_name VARCHAR(255) NOT NULL,
    report_datetime DATETIME NOT NULL,
    FOREIGN KEY (report_id) REFERENCES project(project_id)
);