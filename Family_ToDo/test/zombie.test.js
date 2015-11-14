var Browser = require('zombie');

Browser.localhost(process.env.IP, process.env.PORT);

describe('User visits index page', function() {
    var browser = new Browser();
    
    before(function() {
        return browser.visit('/');
    });
    
    it('should be successful', function() {
        browser.assert.success();
    });
    
    it('should see welcome page', function() {
        browser.assert.text('div.page-header > h1', 'Családi Teendők Táblája');
    });
    
    describe('User visits new todo page', function (argument) {

        var browser = new Browser();
        
        before(function() {
            return browser.visit('/todos/new');
        });
        
        it('should go to the authentication page', function () {
            browser.assert.redirected();
            browser.assert.success();
            browser.assert.url({ pathname: '/login' });
        });
        
        it('should be able to login with correct credentials', function (done) {
            browser
                .fill('familyNickname', 'anya')
                .fill('password', 'anya')
                .pressButton('button[type=submit]')
                .then(function () {
                    browser.assert.redirected();
                    browser.assert.success();
                    browser.assert.url({ pathname: '/todos/list' });
                    done();
                });
        });
        
        it('should go the todo page', function () {
            return browser.visit('/todos/new')
            .then(function () {
                browser.assert.success();
                browser.assert.text('div.page-header > h1', 'Új teendő felvétele');
            });
        });
        
        it('should show errors if the form fields are not right', function () {
            return browser
                .fill('helyszin', '')
                .fill('leiras', '')
                .pressButton('button[type=submit]')
                .then(function() {
                    // browser.assert.redirected();
                    browser.assert.success();
                    browser.assert.element('form .form-group:nth-child(1) [name=helyszin]');
                    browser.assert.hasClass('form .form-group:nth-child(1)', 'has-error');
                    browser.assert.element('form .form-group:nth-child(2) [name=leiras]');
                    browser.assert.hasClass('form .form-group:nth-child(2)', 'has-error');
                });
        });
        
        it('should show submit the right-filled form fields and go back to list page', function() {
            browser
                .fill('helyszin', 'otthon')
                .fill('leiras', 'letörölgetni')
                .pressButton('button[type=submit]')
                .then(function() {
                    browser.assert.redirected();
                    browser.assert.success();
                    browser.assert.url({ pathname: '/todos/list' });
                    
                    browser.assert.element('table.table');
                    browser.assert.text('table.table tbody tr:last-child td:nth-child(2) span.label', 'Új');    
                    browser.assert.text('table.table tbody tr:last-child td:nth-child(3)', 'otthon');    
                    browser.assert.text('table.table tbody tr:last-child td:nth-child(4)', '0 letörölgetni');
                });
        });
    });
    
    
});