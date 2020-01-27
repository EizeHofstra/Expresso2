const express = require('express');
const timesheetRouter = express.Router({ mergeParams: true });
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Timesheet WHERE employee_id = ${req.params.employeeId}`, (err, timesheets) => {
        if (err) {
            next(err);
        } else if (timesheets) {
            res.status(200).send({ timesheets: timesheets });
        } else {
            res.status(200).send({ timesheets: [] });
        }
    })
})

module.exports = timesheetRouter;