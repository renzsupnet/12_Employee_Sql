// Required imports
const inquirer = require('inquirer');

class CLI {
// view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role
    // Runs the inquirer prompt method to asks questions
    async run(){
        const questions = [
            {
                type: "list",
                name: "queries",
                message: "What would you like to do?",
                choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee",
                          "Update an employee role", "Exit"]
            }
        ];
        
        /* async await to make sure the methods are finished before moving to the next one */
        const results = await inquirer.prompt(questions);
    }
    

}

module.exports = CLI;

