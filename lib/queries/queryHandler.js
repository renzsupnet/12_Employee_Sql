const inquirer = require('inquirer');
const format = require('pg-format');

function extractQuery(query){
    let item;
    let table;
    let results;
    switch(query){
        case "View all departments":
            item = '*';
            table = 'department';
            break;
        case "View all roles":
            item = '*';
            table = 'role'
            break;
        case "View all employees":
            item = '*';
            table = 'employee';
        case "Add a department":
            insertHandler('department');
            break;
        case "Add a role":
            insertHandler('role');
            break;
        case "Add an employee:":
            insertHandler('employee');
            break;
    }
}

function insertHandler(table){
    let values;
    let columns;
    const department = `name`;
    const role = `'title', 'salary', department_id`;
    const employee = `first_name, last_name, role_id, manager_id`

    switch(table){
        case 'department':
            columns = department;
            break;
        case 'role':
            columns = role;
            break;
        case 'employee':
            columns = employee;
    }

    const sql = `INSERT INTO ${table}(${columns}) VALUES %L`;
    
    let questions = [];
    for(let col of columns){
        questions.push({
                type: "input",
                name: `${col}`,
                message: `What is the ${col} of the ${table}?`,
        })
    }

    const results = [sql, questions];
    return results;    
}