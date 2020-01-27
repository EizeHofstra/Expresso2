const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const employeesRouter = express.Router();

employeesRouter.param('employeeId', (req, res, next, id) => {
    const sql = `SELECT * FROM Employee WHERE Employee.id = $id`
    const values = { $id: id };
    db.get(sql, values, (err, employee) => {
        if (err) {
            next(err);
        } else  if (employee) {
            req.employee = employee;
            next();
        } else {
            res.status(404).send();
        }
    });
});

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

employeesRouter.get(`/:employeeId`, (req, res, next) => {
    res.status(200).json({ employee: req.employee });
});

employeesRouter.put('/:employeeId', (req, res, next) => {
    if (
        !req.body.employee.name ||
        !req.body.employee.position ||
        !req.body.employee.wage
    ) {
        res.status(400).send();
    } else {
        const sql = `UPDATE Employee SET name = $name, position = $position, wage = $wage WHERE id = $id`;
        const values = { $name: req.body.employee.name,
                         $position: req.body.employee.position,
                         $wage: req.body.employee.wage,
                         $id: req.params.employeeId
        };
        db.run(sql, values, (err) => {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (err, employee) => {
                    res.status(200).json({ employee: employee });
                }
            )}
        });
    }
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
    const sql = `UPDATE Employee SET is_current_employee = 0 WHERE id = $id`;
    const values = { $id: req.params.employeeId };
    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, (err, employee) => {
                res.status(200).json({ employee: employee });
            });
        }
    });
});

module.exports = employeesRouter;