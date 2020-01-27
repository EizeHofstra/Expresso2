const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const employeesRouter = express.Router();

employeesRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Employee WHERE is_current_employee = 1`, (err, employees) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({ employees: employees });
        }
    })
})

employeesRouter.post('/', (req, res, next) => {
    if (
        !req.body.employee.name ||
        !req.body.employee.position ||
        !req.body.employee.wage
    ) {
        res.status(400).send();
    } else {
        db.run(`INSERT INTO Employee (name, position, wage, is_current_employee) 
                VALUES ($name, $position, $wage, 1)`, 
                {
                    $name: req.body.employee.name,
                    $position: req.body.employee.position,
                    $wage: req.body.employee.wage
                }, function(err) {
                    if (err) {
                        next(err);
                    } else {
                        db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`, (err, employee) => {
                            res.status(201).json({ employee: employee });
                        });
                    }
                });
            }
});

module.exports = employeesRouter;