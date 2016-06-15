var express = require('express'),
    app = require('../server'),
    breadcrumb = require('../../common/widgets/breadcrumb')(),
    router = express.Router({mergeParams: true});

router.get('/', function(req, res, next){
    var breadcrumbL1 = 'categories',
        breadcrumbL2;

    var getCatgoriesInfo = app.models.Category.getCatgoriesInfo()
    .then(function(categoriesInfo){
        return categoriesInfo;
    })
    var getBreadcrumb = breadcrumb(breadcrumbL1);

    return Promise.all([getCatgoriesInfo, getBreadcrumb])
    .then(function(promises){
        var pageContent = promises[0];

        pageContent.breadcrumbs = promises[1];

        console.log("rendering 'categories' HTML template...");
        res.render('components/categories', {pageContent});
    })

})

router.get('/:category', function(req, res, next){
    var breadcrumbL1 = 'categories',
        breadcrumbL2 = req.params.category;

    var getCategoryRecommendations = app.models.Category.getCategoryRecommendations('categories/' + req.params.category)
    .then(function(categoryRecommendations){
        return categoryRecommendations;
    })
    var getBreadcrumb = breadcrumb(breadcrumbL1, breadcrumbL2).then(function(breadcrumb){
        return breadcrumb;
    });
    return Promise.all([getCategoryRecommendations, getBreadcrumb])
    .then(function(promises){
        var pageContent = promises[0];

        pageContent.breadcrumbs = promises[1];

        console.log("rendering 'category' HTML template...");
        res.render('components/category', {pageContent});
    })
})

module.exports = router;