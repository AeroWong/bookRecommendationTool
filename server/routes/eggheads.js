var express = require('express'),
    app = require('../server'),
    breadcrumb = require('../../common/widgets/breadcrumb')(),
    router = express.Router({mergeParams: true});

router.get('/', function(req, res, next){
    var breadcrumbL1 = 'eggheads';

    var getEggheadsInfo = app.models.EggHead.getEggHeadsInfo()
    .then(function(eggheadsInfo){
        return eggheadsInfo;
    })
    var getBreadcrumb = breadcrumb(breadcrumbL1);

    return Promise.all([getEggheadsInfo, getBreadcrumb])
    .then(function(promises){
        var pageContent = {};
            pageContent.eggheads = promises[0];
            pageContent.eggheadCount = promises[0].length;
            pageContent.breadcrumbs = promises[1];

        console.log("rendering 'categories' HTML template...");
        res.render('components/eggheads', {pageContent});
    })
})

router.get('/:egghead', function(req, res, next){
    var breadcrumbL1 = 'eggheads',
        breadcrumbL2 = req.params.egghead;

    var getEggheadInfo = app.models.EggHead.getEggheadInfo('eggheads/' + req.params.egghead)
    .then(function(eggheadInfo){
        return eggheadInfo;
    })
    var getBreadcrumb = breadcrumb(breadcrumbL1, breadcrumbL2).then(function(breadcrumb){
        return breadcrumb;
    });
    return Promise.all([getEggheadInfo, getBreadcrumb])
    .then(function(promises){
        var pageContent = promises[0];

        pageContent.breadcrumbs = promises[1];

        console.log("rendering 'egghead' HTML template...");
        res.render('components/egghead', {pageContent});
    })
})

module.exports = router;