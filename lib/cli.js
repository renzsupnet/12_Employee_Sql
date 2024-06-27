// Required imports
const inquirer = require('inquirer');
const { Pool } = require('pg')
const dotenv = require('dotenv').config();
const pool = new Pool(
    {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: 'localhost',
    database: 'company_db'
    }
);

pool.connect();

class CLI {
// view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role
    // Runs the inquirer prompt method to asks questions
    async run(){
        const questions = [
            {
                type: "list",
                name: "queries",
                message: "What would you like to do?",
                choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role", "Exit"]
            }
        ];


        let query;
        let answer;
        const results = await inquirer.prompt(questions);

        switch(results.queries){
            case 'View all departments':
                query = `SELECT * FROM department`;
                await pool.query(query, async function (err, {rows}) {
                    console.table(rows);
                });
                break;
            case 'View all roles':
                query = `SELECT * FROM role`;
                await pool.query(query, async function (err, {rows}) {
                    console.table(rows);
                });
                break;
            case 'View all employees':
                query = `SELECT * FROM employee`;
                await pool.query(query, async function (err, {rows}) {
                    console.table(rows);
                });
                break;
            case 'Add a department':
                query = `INSERT INTO department(name) VALUES($1)`;
                answer = await inquirer.prompt([{
                    type: "input",
                    name: "name",
                    message: "What is the name of the department?"
                }]);
                await pool.query(query, [answer.name], function (err, {rows}) {
                    console.table(rows);
                });
                break;
            case 'Add a role':
                query = `INSERT INTO role(title, salary, department_id) VALUES($1, $2, $3)`;
                
                const departmentRows = await pool.query('SELECT name FROM department', function(error, {rows}){
                    console.log(rows.name);
                });
  
                answer = await inquirer.prompt([
                    {
                        type: "input",
                        name: "title",
                        message: "What is the title of the role?"
                    },
                    {
                        type: "input",
                        name: "salary",
                        message: "What is the salary of the role?"
                    },
                    {
                        type: "list",
                        name: "department",
                        message: "Which department does the role belong to?",
                        choices: departmentRows
                    },
            
                ]);
                await pool.query(query, [answer.title, parseFloat(answer.salary), answer.department_id], function (err, {rows}) {
                    console.table(rows);
                });
                break;
            case 'Add an employee':
                query = `INSERT INTO employee(first_name, last_name, department_id) VALUES($1, $2, $3)`;
                const roleRows = await pool.query('SELECT * FROM department', async function (err, {rows}) {
                    if(!err){
                        return rows;
                    }
                    else{
                        throw err.message();
                    }
                });
                const employeeRows = await pool.query('SELECT * FROM department', async function (err, {rows}) {
                    if(!err){
                        return rows;
                    }
                    else{
                        throw err.message();
                    }
                });
                
                employeeRows.splice(0, 0, "None");

                answer = await inquirer.prompt([
                    {
                        type: "input",
                        name: "first_name",
                        message: "What is the employee's first name?"
                    },
                    {
                        type: "input",
                        name: "last_name",
                        message: "What is the employee's last name?"
                    },
                    {
                        type: "list",
                        name: "role",
                        message: "What is the employees role?",
                        choices: roleRows
                    },
                    {
                        type: "list",
                        name: "manager",
                        message: "Who is the employees manager?",
                        choices: employeeRows
                    },
            
                ]);
                pool.query(query, [answer.title, answer.salary, answer.department_id], function (err, {rows}) {
                    console.log(rows);
                });
                break;
            case 'Update an employee role':
                break;
            case 'Exit':
                return;
            default:
                throw new Error('Query is invalid!')
        }
        pool.end();
    }
    

}

module.exports = CLI;

