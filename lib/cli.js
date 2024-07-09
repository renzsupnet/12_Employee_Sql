// Required imports and reusable variables
const inquirer = require('inquirer');
const { Pool } = require('pg')
const dotenv = require('dotenv').config();
const Table = require('cli-table3');
let table, query, answer, departmentTable, roleTable, employeeTable, 
formattedEmployee, role_id, employee_id, department_id, manager_id;

const pool = new Pool(
    {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: 'localhost',
    database: process.env.DB_NAME
    }
);

pool.connect();

class CLI {
    
    // Runs the inquirer prompt method to asks questions
    async run(){
        
        const questions = [
            {
                type: "list",
                name: "queries",
                message: "What would you like to do?",
                choices: ["View all departments", "View all roles", "View all employees", "View employees by manager", "View employees by department",
                "View total utilized budget of a department", "Add a department", "Add a role", "Add an employee", "Update an employee's role", "Update an employee's manager", 
                "Delete a department", "Delete a role", "Delete an employee", "Exit"]
            }
        ];

        try {
        
            const header = `
        +========================+
        |╔═╗╔╦╗╔═╗╦  ╔═╗╦ ╦╔═╗╔═╗|
        |║╣ ║║║╠═╝║  ║ ║╚╦╝║╣ ║╣ |
        |╚═╝╩ ╩╩  ╩═╝╚═╝ ╩ ╚═╝╚═╝|
        |╔╦╗╔═╗╔╗╔╔═╗╔═╗╔═╗╦═╗   |
        |║║║╠═╣║║║╠═╣║ ╦║╣ ╠╦╝   |
        |╩ ╩╩ ╩╝╚╝╩ ╩╚═╝╚═╝╩╚═   |
        +========================+
            `;
            
            console.log(header);
            const results = await inquirer.prompt(questions);

            switch(results.queries){

                // .map has been used throughout this switch case to extract the required data from queries

                case 'View all departments':
                    query = `SELECT * FROM department`;
                    table = new Table({ head: ["id", "name"] });
                    departmentTable = await pool.query(query);
                    departmentTable.rows.map(row => {
                        table.push([row.id, row.name]);
                    })
                    console.log(table.toString());
                    break;

                // cli-table3 has been used to present table data in the console

                case 'View all roles':
                    query = `SELECT role.id, title, department.name AS department, salary FROM role
                    JOIN department ON department.id = role.department_id`;
                    table = new Table({ head: ["id", "title", "department", "salary"]});
                    roleTable = await pool.query(query);
                    roleTable.rows.map(row => {
                        table.push([row.id, row.title, row.department, row.salary])
                    });
                    console.log(table.toString());
                    break;

                // Format is essentially query => sub-tables => tables 

                case 'View all employees':
                    query = `SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, m.first_name || ' ' || m.last_name AS manager
                    FROM employee e 
                    LEFT JOIN employee m ON m.id = e.manager_id
                    JOIN role ON role.id = e.role_id
                    JOIN department ON department.id = role.department_id`;
                    table = new Table({ head: ["id", "first_name", "last_name", "title", "department", "salary", "manager"]});
                    employeeTable = await pool.query(query);
                    employeeTable.rows.map(row => {
                        if(!row.manager){
                            row.manager = 'null';
                        }
                        table.push([row.id, row.first_name, row.last_name, row.title, row.department, row.salary, row.manager]);
                    });
                    console.log(table.toString());
                    break;

                    // JOINS are used for employees table throughout

                    case 'View employees by manager':
                        query = `SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, m.first_name || ' ' || m.last_name AS manager
                        FROM employee e 
                        LEFT JOIN employee m ON m.id = e.manager_id
                        JOIN role ON role.id = e.role_id
                        JOIN department ON department.id = role.department_id
                        ORDER BY manager`;
                        table = new Table({ head: ["id", "first_name", "last_name", "title", "department", "salary", "manager"]});
                        employeeTable = await pool.query(query);
                        employeeTable.rows.map(row => {
                            if(!row.manager){
                                row.manager = 'null';
                            }
                            table.push([row.id, row.first_name, row.last_name, row.title, row.department, row.salary, row.manager]);
                        });
                        console.log(table.toString());
                        break;

                case 'View employees by department':
                            query = `SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, m.first_name || ' ' || m.last_name AS manager
                            FROM employee e 
                            LEFT JOIN employee m ON m.id = e.manager_id
                            JOIN role ON role.id = e.role_id
                            JOIN department ON department.id = role.department_id
                            ORDER BY department`;
                            table = new Table({ head: ["id", "first_name", "last_name", "title", "department", "salary", "manager"]});
                            employeeTable = await pool.query(query);
                            employeeTable.rows.map(row => {
                                if(!row.manager){
                                    row.manager = 'null';
                                }
                                table.push([row.id, row.first_name, row.last_name, row.title, row.department, row.salary, row.manager]);
                            });
                            console.log(table.toString());
                            break;
                
                // SUM() to aggregate all salaries used by a department

                case 'View total utilized budget of a department':

                    query = `SELECT SUM(role.salary) AS budget, department.name AS department FROM employee
                        JOIN role ON role.id = employee.role_id
                        JOIN department ON department.id = role.department_id
                        GROUP BY department.name
                        `;

                    table = new Table({ head: ["budget", "department"] });
                    departmentTable = await pool.query(query);
                    departmentTable.rows.map(row => {
                        table.push([row.budget, row.department]);
                    })
                    console.log(table.toString());
                    break;            

                // The following are the insert queries

                case 'Add a department':
                    query = `INSERT INTO department(name) VALUES($1)`;
                    answer = await inquirer.prompt([{
                        type: "input",
                        name: "name",
                        message: "What is the name of the department?"
                    }]);
                    await pool.query(query, [answer.name]);
                    console.log(`Added ${answer.name} to the database.`);
                    break;

                case 'Add a role':
                    query = `INSERT INTO role(title, salary, department_id) VALUES($1, $2, $3)`;
                    
                    departmentTable = await pool.query('SELECT name FROM department');
    
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
                            choices: departmentTable.rows.map(({name}) => name)
                        },
                
                    ]);

                    department_id = await pool.query('SELECT id FROM department WHERE name = $1', [answer.department]);
                    await pool.query(query, [answer.title, answer.salary, department_id.rows.map(({id}) => id)[0]]);
                    console.log(`Added ${answer.title} to the database.`);
                    break;

                // Mapping is the main extraction method used in dissecting queries into appropriate data

                case 'Add an employee':
                    query = `INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES($1, $2, $3, $4)`;
                    roleTable = await pool.query('SELECT * FROM role');
                    employeeTable = await pool.query('SELECT * FROM employee');
                    formattedEmployee = employeeTable.rows.map(employee => [employee.first_name, employee.last_name].join(" "));
                    formattedEmployee.splice(0, 0, "None");
                   
                    // Sub-prompts are used when additional inputs are needed 

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
                            choices: roleTable.rows.map(({title}) => title)
                        },
                        {
                            type: "list",
                            name: "manager",
                            message: "Who is the employees manager?",
                            choices: formattedEmployee
                        },
                
                    ]);

                    role_id = await pool.query('SELECT id FROM role WHERE title = $1', [answer.role]);
                    manager_id;

                    if(answer.manager !== "None"){
                        manager_id = await pool.query('SELECT id FROM employee WHERE first_name = $1 AND last_name = $2', [answer.manager.split(" ")[0], answer.manager.split(" ")[1]]);
                        manager_id = manager_id.rows.map(({id}) => id)[0];
                    }
                    else{
                        manager_id = null;
                    }

                    await pool.query(query, [answer.first_name, answer.last_name, role_id.rows.map(({id}) => id)[0], manager_id]);
                    console.log(`Added ${answer.first_name} ${answer.last_name} to the database.`);
                    break;

                    // The following are the update queries

                    case "Update an employee's manager":

                        query = `UPDATE employee SET manager_id = $1 WHERE id = $2`;
                        employeeTable = await pool.query('SELECT * FROM employee');
                        formattedEmployee = employeeTable.rows.map(employee => [employee.first_name, employee.last_name].join(" "));
                        answer = await inquirer.prompt([
                            {
                                type: "list",
                                name: "employee",
                                message: "Which employee's manager would you like to update?",
                                choices: formattedEmployee
                            }]);
                        employee_id = await pool.query('SELECT id FROM employee WHERE first_name = $1 AND last_name = $2', [answer.employee.split(" ")[0], answer.employee.split(" ")[1]]);
                        employee_id = employee_id.rows.map(({id}) => id)[0];
                        formattedEmployee.splice(formattedEmployee.indexOf(answer.employee), 1, "None");
                        let employee_name = `${answer.employee.split(" ")[0]} ${answer.employee.split(" ")[1]}`;
                        answer = await inquirer.prompt([{
                                type: "list",
                                name: "manager",
                                message: "Which employee would you like to be the manager?",
                                choices: formattedEmployee
                            }]);
                            
                            if(answer.manager !== "None"){
                                manager_id = await pool.query('SELECT id FROM employee WHERE first_name = $1 AND last_name = $2', [answer.manager.split(" ")[0], answer.manager.split(" ")[1]]);
                                manager_id = manager_id.rows.map(({id}) => id)[0];
                            }
                            else{
                                manager_id = null;
                            }
                            await pool.query(query, [manager_id, employee_id]);
                            console.log(`Updated ${employee_name}'s manager.`);
                        break;

                        case `Update an employee's role`:
                            query = `UPDATE employee SET role_id = $1 WHERE id = $2`;
        
                            roleTable = await pool.query('SELECT * FROM role');
                            employeeTable = await pool.query('SELECT * FROM employee');
                            formattedEmployee = employeeTable.rows.map(employee => [employee.first_name, employee.last_name].join(" "));
                            answer = await inquirer.prompt([
                                {
                                    type: "list",
                                    name: "employee",
                                    message: "Which employee's role would you like to update?",
                                    choices: formattedEmployee
                                },
                                {
                                    type: "list",
                                    name: "role",
                                    message: "Which role do you want to assign the selected employee?",
                                    choices: roleTable.rows.map(({title}) => title)
                                },
                        
                            ]);
                            employee_id = await pool.query('SELECT id FROM employee WHERE first_name = $1 AND last_name = $2', [answer.employee.split(" ")[0], answer.employee.split(" ")[1]]);
                            employee_id = employee_id.rows.map(({id}) => id)[0];
                            role_id = await pool.query('SELECT id FROM role WHERE title = $1', [answer.role]);
                            await pool.query(query, [role_id.rows.map(({id}) => id)[0], employee_id]);
                            console.log(`Updated ${answer.employee.split(" ")[0]} ${answer.employee.split(" ")[1]}'s role.`);
                            break;

               // The following are the delete queries. 

                case 'Delete a department':
                    query = `DELETE FROM department WHERE id = $1`;
                    departmentTable = await pool.query(`SELECT * FROM department`);        
                    answer = await inquirer.prompt([{
                        type: "list",
                        name: "name",
                        message: "Which department would you like to delete?",
                        choices: departmentTable.rows.map(department => department.name)
                    }]);
                    department_id = await pool.query(`SELECT id FROM department WHERE name = $1`, [answer.name]);
                    department_id = department_id.rows.map(({id}) => id)[0];
                    await pool.query(query, [department_id]);
                    console.log(`Deleted ${answer.name} from the department table.`);
                    break;
                    case 'Delete an employee':
                        query = `DELETE FROM employee WHERE id = $1`;
                        employeeTable = await pool.query(`SELECT * FROM employee`);      
                        formattedEmployee = employeeTable.rows.map(employee => [employee.first_name, employee.last_name].join(" "));  
                        answer = await inquirer.prompt([{
                            type: "list",
                            name: "employee",
                            message: "Which employee would you like to delete?",
                            choices: formattedEmployee
                        }]);
                        employee_id = await pool.query('SELECT id FROM employee WHERE first_name = $1 AND last_name = $2', [answer.employee.split(" ")[0], answer.employee.split(" ")[1]]);
                        employee_id = employee_id.rows.map(({id}) => id)[0];
                        await pool.query(query, [employee_id]);
                        console.log(`Deleted ${answer.employee} from the employee table.`);
                        break;
                        case 'Delete a role':
                            query = `DELETE FROM role WHERE id = $1`;
                            roleTable = await pool.query(`SELECT * FROM role`);        
                            answer = await inquirer.prompt([{
                                type: "list",
                                name: "title",
                                message: "Which role would you like to delete?",
                                choices: roleTable.rows.map(role => role.title)
                            }]);
                            role_id = await pool.query(`SELECT id FROM role WHERE title = $1`, [answer.title]);
                            role_id = role_id.rows.map(({id}) => id)[0];
                            await pool.query(query, [role_id]);
                            console.log(`Deleted ${answer.title} from the role table.`);
                            break;
                case 'Exit':
                    console.log("Session Terminated.")
                    // Ends the cli
                    return process.exit(0);
                default:
                    throw new Error('Query is invalid!')
                    
            }
           
            // Recursion with a delay to not overload the database with asynchronous queries that may interfere with each other
            setTimeout(() => this.run(), 1000);
        } catch (error) {
            // Error handling
            console.log(error.message);
            process.exit(0);
        }
        
    }
    

}

module.exports = CLI;

