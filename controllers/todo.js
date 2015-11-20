// controllers/todo.js
var express = require('express');
var router = express.Router();

//Viewmodel réteg
var statusTexts = {
    'new': 'Új',
    'assigned': 'Hozzárendelve',
    'done': 'Elvégezve',
    'checked': 'Ellenőrízve',
};
var statusClasses = {
    'new': 'danger',
    'assigned': 'info',
    'done': 'success',
    'checked': 'default',
};

function decorateTodos(todoContainer) {
    return todoContainer.map(function (e) {
        e.statusText = statusTexts[e.status];
        e.statusClass = statusClasses[e.status];
        return e;
    });
}

function findRightTodos(todoContainer, familyName) {
    return todoContainer.map(function (e) {
        console.log(e.userFamilyName);
        if (e.userFamilyName === familyName) {
            //console.log(e);
           // console.log("ide bejut");
            return e;
        }
    });
}

router.get('/list', function (req, res) {
    var familyName = req.user.surname;
    console.log(familyName);
    req.app.models.todo.find().then(function (todos) {
        //console.log(todos);
        //megjelenítés
        res.render('todos/list', {
            todos: findRightTodos(decorateTodos(todos), familyName),
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
            description: req.body.leiras,
            user: req.user,
            userFamilyName: req.user.surname
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
                    description: req.body.leiras,
                    user: req.user,
                    userFamilyName: req.user.surname
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

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
}

function andRestrictTo(role) {
    return function(req, res, next) {
        if (req.user.role == role) {
            next();
        } else {
            req.flash('info', 'Unauthorized!');
            res.redirect('/todos/list');
        }
    };
}

/*
app.get('/todos/delete:id', ensureAuthenticated, andRestrictTo('parent'), function(req, res) {
    res.end('parent');
});
*/
router.get('/delete:id', ensureAuthenticated, andRestrictTo('parent'), function(req, res) {
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