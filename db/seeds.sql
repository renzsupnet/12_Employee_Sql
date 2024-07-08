INSERT INTO department(name)
VALUES ('Information Technology'),
       ('Human Resources'),
       ('Retail'),
       ('Logistics'),
       ('Accounting');


INSERT INTO role(title, salary, department_id)
VALUES ('IT Technician', 75000, 1),
       ('HR Associate', 70000, 2),
       ('Cashier', 31000, 3),
       ('Warehouse Worker', 32000, 4),
       ('Accountant', 80000, 5),
       ('IT Manager', 90000, 1),
       ('HR Manager', 85000, 2),
       ('Retail Manager', 78000, 3),
       ('Warehouse Manager', 76000, 4),
       ('Accounting Manager', 82000, 5);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ('John', 'Deere', 1, 2),
       ('Jack', 'Sparrow', 6, NULL),
       ('Snow', 'White', 2, 4),
       ('Jane', 'Doe', 7, NULL),
       ('Gordon', 'Ramsay', 3, 6),
       ('Marco Pierre', 'White', 8, NULL),
       ('Michael', 'Jordan', 4, 8),
       ('Lebron', 'James', 9, NULL),
       ('Larry', 'Bird', 5, 10),
       ('Magic', 'Johnson', 10, NULL);