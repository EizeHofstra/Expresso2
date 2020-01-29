const express = require('express');
const sqlite3 = require('sqlite3');
const menusRouter = express.Router();
const menuItemsRouter = require('./menu-items');

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.param('menuId', (req, res, next, menuId) => {
    const sql = `SELECT * FROM Menu WHERE id = $id`;
    const values = { $id: menuId };
    db.get(sql, values, (err, menu) => {
        if (err) {
            next(err);
        } else if (menu) {
            req.menu = menu;
            next();
        } else {
            res.status(404).send();
        }
    });
});

menusRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Menu`, (err, rows) => {
        if (err) {
            next (err);
        } else {
            res.status(200).json({ menus: rows });
        }
    });
});

menusRouter.post('/', (req, res, next) => {
    if (!req.body.menu.title) {
        res.status(400).send();
    }
    db.run(`INSERT INTO Menu (title) VALUES ($title)`, {$title: req.body.menu.title}, function(err){
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, menu) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({ menu: menu });
                }
            });
        }
    });
});

menusRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({ menu: req.menu });
});

menusRouter.put('/:menuId', (req, res, next) => {
    if (!req.body.menu.title) {
        res.status(400).send();
    }
    const sql = `UPDATE Menu SET title = $title WHERE id = $id`;
    const values = {
        $title: req.body.menu.title,
        $id: req.params.menuId
    };
    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (err, menu) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({ menu: menu });
                }
            });
        }
    });
});

menusRouter.delete('/:menuId', (req, res, next) => {
    const isEmptyMenu = false;
    db.get(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`, (err, menus) => {
        if (menus) {
            res.status(400).send();
        } else {
            db.run(`DELETE FROM Menu WHERE id = ${req.params.menuId}`, (err) => {
                if (err) {
                    next(err);
                } else {
                    res.status(204).send();
                }
            });
        }
    });
});

module.exports = menusRouter;