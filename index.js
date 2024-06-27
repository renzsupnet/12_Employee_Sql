const express = require('express');
const { Pool } = require('pg')
const dotenv = require('dotenv').config();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

const pool = new Pool(
    {
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: 'localhost',
    database: 'employee_db'
    },
    console.log(`Connected to the employee_db database.`)
);

await pool.connect();

