/**
 * Created by Ashik on 24/05/2023
 */
require('dotenv').config();
const mysql = require('mysql')

const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
})

conn.query('CREATE DATABASE IF NOT EXISTS '+process.env.DB_DATABASE);

//
conn.query('\
CREATE TABLE IF NOT EXISTS `' + process.env.DB_DATABASE + '`.`users` ( \
    `u_id` INT NOT NULL AUTO_INCREMENT, \
    `Name` VARCHAR(60) NOT NULL, \
    `Email` VARCHAR(100) NOT NULL, \
    `Password` VARCHAR(255) NOT NULL, \
     PRIMARY KEY (`u_id`)\
)');

console.log('Completed');

conn.end();