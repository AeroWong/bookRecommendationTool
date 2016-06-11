var _ = require('lodash');
var Promise = require('bluebird');
var app = require('../../server/server.js');

module.exports = function() {
    return function renderBreadcrumb(req, res, next){
        var params = req.params,
            baseUrl = req.baseUrl,
            level1 = params.level1,
            level2 = params.level2;

        if (level1 && level2) {
            switch (level1) {
                case 'categories':
                    return app.models.Category.find()
                    .then(function(categories){
                        var breadcrumbCategoryName = null;
                        categories.forEach(function(category){
                            if ('/renderBreadcrumbL2/' + category.alias === baseUrl) {
                                breadcrumbCategoryName = category.name;
                            }
                        })
                        if (breadcrumbCategoryName === null) {
                            res.json("L2 breadcrumb needs 'categories' or 'eggheads' to be L1 param and an existing category to be L2 param.");
                        }
                        res.json(['Home', 'Categories', breadcrumbCategoryName]);
                    })
                    break;
                case 'eggheads':
                    return app.models.EggHead.find()
                    .then(function(eggheads){
                        var breadcrumbEggheadName = null;
                        eggheads.forEach(function(egghead){
                            if ('/renderBreadcrumbL2/' + egghead.alias === baseUrl) {
                                breadcrumbEggheadName = egghead.name;
                            }
                        })
                        if (breadcrumbEggheadName === null) {
                            res.json("L2 breadcrumb needs 'categories' or 'eggheads' to be L1 param and an existing egghead to be L2 param.");
                        }
                        res.json(['Home', 'Eggheads', breadcrumbEggheadName]);
                    })
                    break;
                default:
                    res.send("L2 breadcrumb needs 'categories' or 'eggheads' to be L1 param and an existing category to be L2 param.");
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