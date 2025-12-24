1. To create tables run this in MariaDB-

CREATE DATABASE student_event_system;
USE student_event_system;
SOURCE /full/path/to/db_setup.sql;

replace with your path to the .sql file 


2. Make Clerk account and add API Key to the .env file in /frontend.
3. In config.py under /backend , replace DB_PASSWORD with your password and DB_USER with your user.


