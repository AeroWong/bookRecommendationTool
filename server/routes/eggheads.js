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

    var getWisdomizerCount = app.models.EggHead.getEggHeadCount()
    .then(function(wisdomizerCount){
        return wisdomizerCount;
    })

    return Promise.all([getEggheadsInfo, getBreadcrumb, getWisdomizerCount])
    .then(function(promises){
        var pageContent = {};
            pageContent.eggheads = promises[0];
            pageContent.eggheadCount = promises[0].length;
            pageContent.breadcrumbs = promises[1];
            pageContent.wisdomizerCount = promises[2];

        console.log("rendering 'wisdomizers' HTML template...");
        res.render('pages/eggheads', {pageContent});
    })
})

router.get('/:wisdomizer', function(req, res, next){
    var breadcrumbL1 = 'wisdomizers',
        breadcrumbL2 = req.params.wisdomizer;

    var getEggheadInfo = app.models.EggHead.getEggheadInfo('wisdomizers/' + req.params.wisdomizer)
    .then(function(eggheadInfo){
        return eggheadInfo;
    })
    
    var getBreadcrumb = breadcrumb(breadcrumbL1, breadcrumbL2);

    var getWisdomizerCount = app.models.EggHead.getEggHeadCount()
    .then(function(wisdomizerCount){
        return wisdomizerCount;
    })

    return Promise.all([getEggheadInfo, getBreadcrumb, getWisdomizerCount])
    .then(function(promises){
        return app.models.EggHead.getEggHeadCount()
        .then(function(wisdomizerCount){    
            var pageContent = promises[0];

            console.log('pageContent: ', pageContent);

            pageContent.breadcrumbs = promises[1];
            pageContent.wisdomizerCount = promises[2];

            console.log("rendering 'wisdomizer' HTML template...");
            res.render('pages/egghead', {pageContent});
        })

    })
})

module.exports = router;