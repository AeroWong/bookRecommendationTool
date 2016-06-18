var express = require('express'),
    app = require('../server'),
    breadcrumb = require('../../common/widgets/breadcrumb')(),
    router = express.Router({mergeParams: true});

router.get('/', function(req, res, next){
    var breadcrumbL1 = 'wisdomizers';

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

router.get('/:wisdomizer', function(req, res, next){
    var breadcrumbL1 = 'wisdomizers',
        breadcrumbL2 = req.params.wisdomizers;

    var getEggheadInfo = app.models.EggHead.getEggheadInfo('eggheads/' + req.params.wisdomizer)
    .then(function(eggheadInfo){
        return eggheadInfo;
    })
    
    var getBreadcrumb = breadcrumb(breadcrumbL1, breadcrumbL2);

    return Promise.all([getEggheadInfo, getBreadcrumb])
    .then(function(promises){
        var pageContent = promises[0];

        pageContent.breadcrumbs = promises[1];

        console.log("rendering 'egghead' HTML template...");
        res.render('components/egghead', {pageContent});
    })
})

module.exports = router;