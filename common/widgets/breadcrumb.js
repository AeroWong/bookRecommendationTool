var _ = require('lodash');
var Promise = require('bluebird');
var app = require('../../server/server.js');

module.exports = function() {
    return function renderBreadcrumb(level1, level2, options){
        var message = "L2 breadcrumb needs 'categories' or 'eggheads' to be L1 param and an existing category to be L2 param.";

        if (level1 && level2) {
            console.log('rendering a level 2 breadcrumb...');
            var breadcrumbLevel2 = null,
                alias = null;
            switch (level1) {
                case 'categories':
                    return app.models.Category.find()
                    .then(function(categories){
                        categories.forEach(function(category){
                            if (category.alias === level1 + '/' + level2) {
                                breadcrumbLevel2 = category.name;
                                alias = category.alias;
                            }
                        })
                        if (breadcrumbLevel2 === null) {
                            var e = new Error(message);
                            console.log(e.message);
                            throw e;
                        }
                        return [{name: 'Home', url: '/'},
                                {name: 'Categories', url: '/categories'},
                                {name: breadcrumbLevel2, url: '../' + alias}];
                    }).then(function(breadcrumb){
                        return breadcrumb;
                    })
                    break;
                case 'wisdomizers':
                    return app.models.EggHead.find()
                    .then(function(eggheads){
                        eggheads.forEach(function(egghead){
                            if (egghead.alias === level1 + '/' + level2) {
                                breadcrumbLevel2 = egghead.name;
                                alias = egghead.alias;
                            }
                        })
                        if (breadcrumbLevel2 === null) {
                            res.send(message);
                        }
                        return [{name: 'Home', url: '/'},
                                {name: 'Wisdomizers', url: '/wisdomziers'},
                                {name: breadcrumbLevel2, url: '../' + alias}];
                    })
                    break;
                case 'books':
                    return app.models.Book.find()
                    .then(function(books){
                        books.forEach(function(book){
                            if (book.alias === level1 + '/' + level2) {
                                breadcrumbLevel2 = book.title;
                                alias = book.alias;
                            }
                        })
                        if (breadcrumbLevel2 === null) {
                            res.send(message);
                        }
                        return [{name: 'Home', url: '/'},
                                {name: 'Books', url: '/books'},
                                {name: breadcrumbLevel2, url: '../' + alias}];
                    })
                    break;
                default:
                    var e = new Error(message);
                    console.log(e.message);
                    throw e;
            }
        }

        if (level1 && level2 === undefined) {
            console.log("rendering a level1 breadcrumb...");
            switch (level1) {
                case 'categories':
                    return [{name: 'Home', url: '/'},
                            {name: 'Categories', url: '/categories'}];
                    break;
                case 'wisdomizers':
                    return [{name: 'Home', url: '/'},
                            {name: 'Wisdomizers', url: '/wisdomizers'}];
                    break;
                default:
                    var e = new Error("L1 breadcrumb needs either 'categories' or 'eggheads' as params." );
                    console.log(e.message);
                    throw e;
            }
        }

    }
}