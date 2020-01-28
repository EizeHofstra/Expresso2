const express = require('express');

const apiRouter = express.Router();

const employeeRouter = require('./employees');

const menusRouter = require('./menus');

apiRouter.use('/menus', menusRouter);

apiRouter.use('/employees', employeeRouter);

module.exports = apiRouter;