var express = require('express'),
    app = require('../server'),
    breadcrumb = require('../../common/widgets/breadcrumb')(),
    router = express.Router({mergeParams: true});

router.get('/', function(req, res, next){
    var breadcrumbL1 = 'categories';

    var getCatgoriesInfo = app.models.Category.getCatgoriesInfo()
    .then(function(categoriesInfo){
        return categoriesInfo;
    })
    var getBreadcrumb = breadcrumb(breadcrumbL1);

    return Promise.all([getCatgoriesInfo, getBreadcrumb])
    .then(function(promises){
        return app.models.EggHead.getEggHeadCount()
        .then(function(wisdomizerCount){
            var pageContent = promises[0];

            pageContent.breadcrumbs = promises[1];
            pageContent.wisdomizerCount = wisdomizerCount;

            console.log("rendering 'categories' HTML template...");
            res.render('pages/categories', {pageContent});
        })
    })

})

router.get('/:category', function(req, res, next){
    var breadcrumbL1 = 'categories',
        breadcrumbL2 = req.params.category;

    var getCategoryRecommendations = app.models.Category.getCategoryRecommendations('categories/' + req.params.category)
    .then(function(categoryRecommendations){
        return categoryRecommendations;
    })
    var getBreadcrumb = breadcrumb(breadcrumbL1, breadcrumbL2)
    
    var getWisdomizerCount = app.models.EggHead.getEggHeadCount()
    .then(function(wisdomizerCount){
        return wisdomizerCount;
    })
    return Promise.all([getCategoryRecommendations, getBreadcrumb, getWisdomizerCount])
    .then(function(promises){
        var pageContent = promises[0];

        pageContent.breadcrumbs = promises[1];
        pageContent.wisdomizerCount = promises[2];

        console.log("rendering 'category' HTML template...");
        res.render('pages/category', {pageContent});
    })
})

module.exports = router;