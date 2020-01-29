const express = require('express');
const sqlite3 = require('sqlite3');
const menuItemsRouter = express.Router({ mergeParams: true });

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    const sql = `SELECT * FROM MenuItem WHERE id = $id`;
    const values = { $id: menuItemId };
    db.get(sql, values, (err, menuItem) => {
        if (err) {
            next(err);
        } else if (menuItem) {
            { req.menuItem = menuItem };
            next();
        } else {
            res.status(404).send();
        }
    });
});

menuItemsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`, (err, menuItems) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({ menuItems: menuItems });
        }
    });
});

menuItemsRouter.post('/', (req, res, next) => {
    if (
        !req.body.menuItem.name ||
        !req.body.menuItem.description ||
        !req.body.menuItem.inventory ||
        !req.body.menuItem.price
    ) {
        res.status(400).send();
    }
    const sql = `INSERT INTO MenuItem (name, description, inventory, price, menu_id)
                            VALUES ($name, $description, $inventory, $price, $menu_id)`;
    const values = { 
        $name: req.body.menuItem.name,
        $description: req.body.menuItem.description,
        $inventory: req.body.menuItem.inventory,
        $price: req.body.menuItem.price,
        $menu_id: req.params.menuId
    }
    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, menuItem) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({menuItem: menuItem});
                }
            });
        }
    });
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    if (
        !req.body.menuItem.name ||
        !req.body.menuItem.description ||
        !req.body.menuItem.inventory ||
        !req.body.menuItem.price
    ) {
        res.status(400).send();
    }
    const sql = `UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price WHERE id = $id`;
    const values = {
        $name: req.body.menuItem.name,
        $description: req.body.menuItem.description,
        $inventory: req.body.menuItem.inventory,
        $price: req.body.menuItem.price,
        $id: req.params.menuItemId
    };
    db.run(sql, values, (err) => {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`, (err, menuItem) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({ menuItem: menuItem });
                }
            });
        }
    });
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    db.run(`DELETE FROM MenuItem WHERE id = ${req.params.menuItemId}`, (err) => {
        if (err) {
            next(err);
        } else {
            res.status(204).send();
        }
    });
});

module.exports = menuItemsRouter;