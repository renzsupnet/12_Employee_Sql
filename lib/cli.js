// Required imports
const inquirer = require('inquirer');
const { Pool } = require('pg')
const dotenv = require('dotenv').config();
const Table = require('cli-table3');
let table;
const pool = new Pool(
    {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: 'localhost',
    database: 'company_db'
    }
);

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

        await pool.connect();

        let query;
        let answer;
        const results = await inquirer.prompt(questions);

        switch(results.queries){
            case 'View all departments':
                query = `SELECT * FROM department`;
                table = new Table({ head: ["id", "name"] });
                await pool.query(query, async function (err, {rows}) {
                    console.log(rows.map(row =>{
                        table.push([row.id, row.name]);
                    }));
                });
                console.log(table.toString());
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
                
                const departmentRows = await pool.query('SELECT name FROM department');
  
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
                        choices: departmentRows.rows.map(({name}) => name)
                    },
            
                ]);

                const department_id = await pool.query('SELECT id FROM department WHERE name = $1', [answer.department]);
                console.log(department_id.rows.map(({id}) => id));
                await pool.query(query, [answer.title, answer.salary, department_id.rows.map(({id}) => id)[0]]);
                break;
            case 'Add an employee':
                query = `INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES($1, $2, $3, $4)`;
                let roleRows = await pool.query('SELECT * FROM role');
                let employeeRows = await pool.query('SELECT * FROM employee');
                let formattedEmployee = employeeRows.rows.map(employee => [employee.first_name, employee.last_name].join(" "));
                formattedEmployee.splice(0, 0, "None");
                console.log(formattedEmployee);
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
                        choices: roleRows.rows.map(({title}) => title)
                    },
                    {
                        type: "list",
                        name: "manager",
                        message: "Who is the employees manager?",
                        choices: formattedEmployee
                    },
            
                ]);

                let role_id = await pool.query('SELECT id FROM role WHERE title = $1', [answer.role]);
                let manager_id;
                if(answer.manager !== "None"){
                    manager_id = await pool.query('SELECT id FROM employee WHERE first_name = $1 AND last_name = $2', [answer.manager.split(" ")[0], answer.manager.split(" ")[1]]);
                    manager_id = manager_id.rows.map(({id}) => id)[0];
                }
                else{
                    manager_id = null;
                }
                await pool.query(query, [answer.first_name, answer.last_name, role_id.rows.map(({id}) => id)[0], manager_id]);
                break;
            case 'Update an employee role':
                query = `UPDATE employee SET role_id = $1 WHERE id = $2`;

                let role = await pool.query('SELECT * FROM role');
                let employee = await pool.query('SELECT * FROM employee');
                let formatEmployee = employee.rows.map(employee => [employee.first_name, employee.last_name].join(" "));
                answer = await inquirer.prompt([
                    {
                        type: "list",
                        name: "employee",
                        message: "Which employee's role would you like to update?",
                        choices: formatEmployee
                    },
                    {
                        type: "list",
                        name: "role",
                        message: "Which role do you want to assign the selected employee?",
                        choices: role.rows.map(({title}) => title)
                    },
            
                ]);
                let employee_id = await pool.query('SELECT id FROM employee WHERE first_name = $1 AND last_name = $2', [answer.employee.split(" ")[0], answer.employee.split(" ")[1]]);
                employee_id = employee_id.rows.map(({id}) => id)[0]
                let roleId = await pool.query('SELECT id FROM role WHERE title = $1', [answer.role]);
                await pool.query(query, [roleId.rows.map(({id}) => id)[0], employee_id]);
                break;
            case 'Exit':
                console.log("Session Terminated.")
                return process.exit(0);
            default:
                throw new Error('Query is invalid!')
        }
        setTimeout(() => this.run(), 250);
    }
    

}

module.exports = CLI;

