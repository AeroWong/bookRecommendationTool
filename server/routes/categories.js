var express = require('express'),
    app = require('../server'),
    breadcrumb = require('../../common/widgets/breadcrumb')(),
    router = express.Router({mergeParams: true});

router.get('/', function(req, res, next){
    return app.models.Category.getCatgoriesInfo()
    .then(function(categories){
        console.log('req: ', req);
        // console.log('rendering categories HTML template...');
        // res.render('components/categories', {categories: categories});
    })
})

router.get('/:category', function(req, res, next){
    var result = {},
        breadcrumbL1 = 'categories',
        breadcrumbL2 = req.params.category;

    var getCategoriesInfo = app.models.Category.getCategoryRecommendations('categories/' + req.params.category)
    .then(function(categoriesInfo){
        return categoriesInfo;
    })
    var getBreadcrumb = breadcrumb(breadcrumbL1, breadcrumbL2).then(function(breadcrumb){
        return breadcrumb;
    });
    return Promise.all([getCategoriesInfo, getBreadcrumb])
    .then(function(promises){
        var pageContent = promises[0];

        pageContent.breadcrumbs = promises[1];

        console.log("rendering 'category' HTML template...");
        res.render('components/category', {pageContent});
    })
})

module.exports = router;