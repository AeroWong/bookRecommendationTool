var _ = require('lodash');
var Promise = require('bluebird');
var app = require('../../server/server.js');

module.exports = function() {
    return function renderBreadcrumb(req, res, next){
        var params = req.params,
            baseUrl = req.baseUrl,
            level1 = params.level1,
            level2 = params.level2,
            message = "L2 breadcrumb needs 'categories' or 'eggheads' to be L1 param and an existing category to be L2 param.";

        if (level1 && level2) {
            console.log('rendering a level 2 breadcrumb...');
            var breadcrumbLevel2 = null;
            switch (level1) {
                case 'categories':
                    return app.models.Category.find()
                    .then(function(categories){
                        categories.forEach(function(category){
                            if ('/renderBreadcrumbL2/' + category.alias === baseUrl) {
                                breadcrumbLevel2 = category.name;
                            }
                        })
                        if (breadcrumbLevel2 === null) {
                            res.send(message);
                        }
                        res.json(['Home', 'Categories', breadcrumbLevel2]);
                    })
                    break;
                case 'eggheads':
                    return app.models.EggHead.find()
                    .then(function(eggheads){
                        eggheads.forEach(function(egghead){
                            if ('/renderBreadcrumbL2/' + egghead.alias === baseUrl) {
                                breadcrumbLevel2 = egghead.name;
                            }
                        })
                        if (breadcrumbLevel2 === null) {
                            res.send(message);
                        }
                        res.json(['Home', 'Eggheads', breadcrumbLevel2]);
                    })
                    break;
                case 'books':
                    return app.models.Book.find()
                    .then(function(books){
                        books.forEach(function(book){
                            if ('/renderBreadcrumbL2/' + book.alias === baseUrl) {
                                breadcrumbLevel2 = book.title;
                            }
                        })
                        if (breadcrumbLevel2 === null) {
                            res.send(message);
                        }
                        res.json(['Home', 'Books', breadcrumbLevel2]);
                    })
                    break;
                default:
                    res.send(message);
            }
        }

        if (level1 && level2 === undefined) {
            console.log("rendering a level1 breadcrumb...");
            switch (level1) {
                case 'categories':
                    res.json(['Home', 'Categories']);
                    break;
                case 'eggheads':
                    res.json(['Home', 'Eggheads']);
                    break;
                default:
                    res.send("L1 breadcrumb needs either 'categories' or 'eggheads' as params." );
            }
        }

    }
}