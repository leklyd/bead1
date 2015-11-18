// controllers/comment.js

var express = require('express');
var router = express.Router();

router.get('/comment', function (req, res) {
    var id = req.params.id;
    req.app.models.comment.create({
        text: req.body.text,
        todo: id
    })
    .then(function (comment) {
        req.flash('info', 'Megjegyzés sikeresen felvéve!');
        res.redirect('/todos/list' + id);
    })
    .catch(function (err) {
        console.log(err);
    });
});
router.post('/comment', function (req, res) {
    // adatok ellenőrzése
    req.checkBody('megjegyzes', 'Hibás megjegyzes').notEmpty().withMessage('Kötelező megadni!');
    
    var id = req.params.id;
    var validationErrors = req.validationErrors(true);
    console.log(validationErrors);
    
    if (validationErrors) {
        // űrlap megjelenítése a teendőkkel és a felküldött adatokkal
        req.flash('validationErrors', validationErrors);
        req.flash('data', req.body);
        res.redirect('/comment');
    }
    else {
        // adatok elmentése (ld. később) és a teendők listájának megjelenítése
        req.app.models.todo.findOne({ id: id}).populate('comments').then(function (todo) {
            res.render('todos/new', {
                todo: todo,
                /* ... */
            }); 
        });
    }
});