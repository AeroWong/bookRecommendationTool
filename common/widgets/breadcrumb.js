var _ = require('lodash');
var Promise = require('bluebird');
var app = require('../../server/server.js');

module.exports = function() {
    return function renderBreadcrumb(level1, level2, options){
        var message = "L2 breadcrumb needs 'categories' or 'eggheads' to be L1 param and an existing category to be L2 param.";

        if (level1 && level2) {
            console.log('rendering a level 2 breadcrumb...');
            var breadcrumbLevel2 = null;
            switch (level1) {
                case 'categories':
                    return app.models.Category.find()
                    .then(function(categories){
                        categories.forEach(function(category){
                            if (category.alias === level1 + '/' + level2) {
                                breadcrumbLevel2 = category.name;
                            }
                        })
                        if (breadcrumbLevel2 === null) {
                            res.send(message);
                        }
                        return [{name: 'Home'},{name: 'Categories'},{name: breadcrumbLevel2}]
                    }).then(function(breadcrumb){
                        return breadcrumb;
                    })
                    break;
                case 'eggheads':
                    return app.models.EggHead.find()
                    .then(function(eggheads){
                        eggheads.forEach(function(egghead){
                            if (egghead.alias === level1 + '/' + level2) {
                                breadcrumbLevel2 = egghead.name;
                            }
                        })
                        if (breadcrumbLevel2 === null) {
                            res.send(message);
                        }
                        return ['Home', 'Eggheads', breadcrumbLevel2];
                    })
                    break;
                case 'books':
                    return app.models.Book.find()
                    .then(function(books){
                        books.forEach(function(book){
                            if (book.alias === level1 + '/' + level2) {
                                breadcrumbLevel2 = book.title;
                            }
                        })
                        if (breadcrumbLevel2 === null) {
                            res.send(message);
                        }
                        return ['Home', 'Books', breadcrumbLevel2];
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
                    return ['Home', 'Categories'];
                    break;
                case 'eggheads':
                    return ['Home', 'Eggheads'];
                    break;
                default:
                    res.send("L1 breadcrumb needs either 'categories' or 'eggheads' as params." );
            }
        }

    }
}