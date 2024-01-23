--
-- Resets my databse
-- 

-- Creates / resets the database
source setup.sql;
use pulse;

-- ddl creates the tables, views and procedures etc ...
source ddl.sql;

-- lastly insert the data
source insert.sql;
