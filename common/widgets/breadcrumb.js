var _ = require('lodash');
var Promise = require('bluebird');
var app = require('../../server/server.js');

module.exports = function() {
    return function renderBreadcrumb(level1, level2, options){
        var message = "L2 breadcrumb needs 'categories' or 'wisdomizers' to be L1 param and an existing category to be L2 param.";

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
                    return app.models.Wisdomizer.find()
                    .then(function(wisdomizers){
                        wisdomizers.forEach(function(wisdomizer){
                            if (wisdomizer.alias === level1 + '/' + level2) {
                                breadcrumbLevel2 = wisdomizer.name;
                                alias = wisdomizer.alias;
                            }
                        })
                        if (breadcrumbLevel2 === null) {
                            res.send(message);
                        }
                        return [{name: 'Home', url: '/'},
                                {name: 'Wisdomizers', url: '/wisdomizers'},
                                {name: breadcrumbLevel2, url: '../' + alias}];
                    })
                    break;
                case 'wisdombabies':
                    return app.models.Wisdombaby.find()
                    .then(function(wisdomBabies){
                        wisdomBabies.forEach(function(wisdomBaby){
                            if (wisdomBaby.alias === level1 + '/' + level2) {
                                breadcrumbLevel2 = wisdomBaby.name;
                                alias = wisdomBaby.alias;
                            }
                        })
                        if (breadcrumbLevel2 === null) {
                            res.send(message);
                        }
                        return [{name: 'Home', url: '/'},
                                {name: 'Wisdom Babies', url: '/wisdombabies'},
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
                case 'about':
                    return [{name: 'Home', url: '/'},
                            {name: "Wisdom's story", url: '/about'}];
                    break;
                case 'contact':
                    return [{name: 'Home', url: '/'},
                            {name: "Wisdom's contact", url: '/contact'}];
                    break;                    
                case 'categories':
                    return [{name: 'Home', url: '/'},
                            {name: 'Categories', url: '/categories'}];
                    break;
                case 'wisdomizers':
                    return [{name: 'Home', url: '/'},
                            {name: 'Wisdomizers', url: '/wisdomizers'}];
                    break;
                case 'wisdombabies':
                    return [{name: 'Home', url: '/'},
                            {name: 'Wisdom babies', url: '/wisdombabies'}];
                    break;
                default:
                    var e = new Error("L1 breadcrumb needs either 'categories' or 'wisdomizers' as params." );
                    console.log(e.message);
                    throw e;
            }
        }

    }
}