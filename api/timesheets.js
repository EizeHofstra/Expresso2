const express = require('express');
const timesheetRouter = express.Router({ mergeParams: true });
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetRouter.param('timesheetId', (req, res, next, timesheetId) => {
    const sql = `SELECT * FROM Timesheet WHERE Timesheet.id = $id`;
    const values = { $id: timesheetId };
    db.get(sql, values, (err, timesheet) => {
        if (err) {
            next(err);
        } else if (timesheet) {
            req.timesheet = timesheet;
            next();
        } else {
            res.status(404).send();
        }
    });
});

timesheetRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`, (err, timesheets) => {
        if (err) {
            next(err);
        } else if (timesheets) {
            res.status(200).send({ timesheets: timesheets });
        } else {
            res.status(200).send({ timesheets: [] });
        }
    });
});

timesheetRouter.post('/', (req, res, next) => {
    if (
        !req.body.timesheet.hours ||
        !req.body.timesheet.rate ||
        !req.body.timesheet.date
    ) {
        res.status(400).send();
    }
    const sql = `INSERT INTO Timesheet (hours, rate, date, employee_id)
                VALUES ($hours, $rate, $date, $employee_id)`;
    const values = {
        $hours: req.body.timesheet.hours,
        $rate: req.body.timesheet.rate,
        $date: req.body.timesheet.date,
        $employee_id: req.params.employeeId
    };
    db.run(sql, values, function (err){
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, timesheet) => {
                res.status(201).send({ timesheet: timesheet });
            });
        }
    });
});

timesheetRouter.put('/:timesheetId', (req, res, next) => {
    if (
        !req.body.timesheet.hours ||
        !req.body.timesheet.rate ||
        !req.body.timesheet.date
    ) {
        res.status(400).send();
    }
    const sql = `UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date WHERE id = $id`;
    const values = {
        $hours: req.body.timesheet.hours,
        $rate: req.body.timesheet.rate,
        $date: req.body.timesheet.date,
        $id: req.params.timesheetId
    };
    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`, function(err, timesheet){
                res.status(200).json({ timesheet: timesheet });
            });
        }
    });
});

timesheetRouter.delete('/:timesheetId', (req, res, next) => {
    db.run(`DELETE FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`, (err) => {
        if (err) {
            next(err);
        } else {
            res.status(204).send();
        }
    });
});

module.exports = timesheetRouter;