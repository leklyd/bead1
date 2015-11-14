// controllers/todo.js
var express = require('express');
var router = express.Router();

//Viewmodel réteg
var statusTexts = {
    'new': 'Új',
    'assigned': 'Hozzárendelve',
    'done': 'Elvégezve',
    'checked': 'Ellenőrízve',
    'pending': 'Felfüggesztve',
};
var statusClasses = {
    'new': 'danger',
    'assigned': 'info',
    'done': 'success',
    'checked': 'default',
    'pending': 'warning',
};

function decorateTodos(todoContainer) {
    return todoContainer.map(function (e) {
        e.statusText = statusTexts[e.status];
        e.statusClass = statusClasses[e.status];
        return e;
    });
}

router.get('/list', function (req, res) {
    req.app.models.todo.find().then(function (todos) {
        console.log(todos);
        //megjelenítés
        res.render('todos/list', {
            todos: decorateTodos(todos),
            messages: req.flash('info'),
        });
    });
});
router.get('/new', function (req, res) {
    var validationErrors = (req.flash('validationErrors') || [{}]).pop();
    var data = (req.flash('data') || [{}]).pop();
    
    res.render('todos/new', {
        validationErrors: validationErrors,
        data: data,
    });
});
router.post('/new', function (req, res) {
    // adatok ellenőrzése
    req.checkBody('helyszin', 'Hibás helyszín').notEmpty().withMessage('Kötelező megadni!');
    req.sanitizeBody('leiras').escape();
    req.checkBody('leiras', 'Hibás leírás').notEmpty().withMessage('Kötelező megadni!');
    
    var validationErrors = req.validationErrors(true);
    console.log(validationErrors);
    
    if (validationErrors) {
        // űrlap megjelenítése a teendőkkel és a felküldött adatokkal
        req.flash('validationErrors', validationErrors);
        req.flash('data', req.body);
        res.redirect('/todos/new');
    }
    else {
        // adatok elmentése (ld. később) és a teendők listájának megjelenítése
        req.app.models.todo.create({
            status: 'new',
            location: req.body.helyszin,
            description: req.body.leiras
        })
        .then(function (todo) {
            req.flash('info', 'Teendő sikeresen felvéve!');
            res.redirect('/todos/list');
        })
        .catch(function (err) {
            console.log(err);
        });
    }
});

router.get('/edit:id', function (req, res) {
    var id = req.params.id;
    var validationErrors = (req.flash('validationErrors') || [{}]).pop();
    var data = (req.flash('data') || [{}]).pop();
    req.app.models.todo.findOne({ id: id}).then(function (todo) {
        res.render('todos/edit:id', {
            todo: todo,
            validationErrors: validationErrors,
            data: data
        }); 
    });
});
router.post('/edit:id', function (req, res) {
    // adatok ellenőrzése
    req.checkBody('statusz', 'Hibás státusz').notEmpty().withMessage('Kötelező megadni!');
    //req.sanitizeBody('helyszin').escape();
    req.checkBody('helyszin', 'Hibás helyszín').notEmpty().withMessage('Kötelező megadni!');
    req.sanitizeBody('leiras').escape();
    req.checkBody('leiras', 'Hibás leírás').notEmpty().withMessage('Kötelező megadni!');
    
    var id = req.params.id;
    var validationErrors = req.validationErrors(true);
    console.log(validationErrors);
    
    if (validationErrors) {
        // űrlap megjelenítése a teendőkkel és a felküldött adatokkal
        req.flash('validationErrors', validationErrors);
        req.flash('data', req.body);
        res.redirect('/todos/edit:id');
    }
    else {
        // adatok elmentése (ld. később) és a teendők listájának megjelenítése
        req.app.models.todo.findOne({ id: id}).then(function (todo) {
            console.log(todo);
            req.app.models.todo.destroy({ id: id}).then(function (todo) {
                req.app.models.todo.create({
                    status: req.body.statusz,
                    location: req.body.helyszin,
                    description: req.body.leiras
                })
                .then(function (todo) {
                    req.flash('info', 'Teendő sikeresen módosítva!');
                    res.redirect('/todos/list');
                })
                .catch(function (err) {
                    console.log(err);
                }); 
            });
            
        });
    }
});

router.get('/delete:id', function (req, res) {
    var id = req.params.id;
    req.app.models.todo.findOne({ id: id}).then(function (todo) {
        res.render('todos/delete:id', {
            todo: todo
        }); 
    });
});
router.post('/delete:id', function (req, res) {
    var id = req.params.id;
    req.app.models.todo.findOne({ id: id}).then(function (todo) {
        if (!req.app.models.todo.status.equal('checked')) {
            req.flash('info', 'Teendő nem törölhető, mert nincs ellenőrízve!');
            res.redirect('/todos/list');
        }
        else {
            req.app.models.todo.destroy({ id: id}).then(function (todo) {
                req.flash('info', 'Teendő sikeresen törölve');
                res.redirect('/todos/list');
            })
            .catch(function (err) {
                console.log(err);
            });
        }
    });
});

module.exports = router;