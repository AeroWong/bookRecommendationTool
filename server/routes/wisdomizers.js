var express = require('express'),
    app = require('../server'),
    breadcrumb = require('../../common/widgets/breadcrumb')(),
    router = express.Router({mergeParams: true});

router.get('/', function(req, res, next){
    var breadcrumbL1 = 'wisdomizers';

    var getWisdomizersInfo = app.models.Wisdomizer.getWisdomizersInfo()
    .then(function(wisdomizersInfo){
        return wisdomizersInfo;
    })

    var getBreadcrumb = breadcrumb(breadcrumbL1);

    var getWisdomizerCount = app.models.Wisdomizer.getWisdomizerCount()
    .then(function(wisdomizerCount){
        return wisdomizerCount;
    })

    return Promise.all([getWisdomizersInfo, getBreadcrumb, getWisdomizerCount])
    .then(function(promises){
        var pageContent = {};
            pageContent.wisdomizers = promises[0];
            pageContent.wisdomizerCount = promises[0].length;
            pageContent.breadcrumbs = promises[1];
            pageContent.wisdomizerCount = promises[2];

        console.log("rendering 'wisdomizers' HTML template...");
        res.render('pages/wisdomizers', {pageContent});
    })
})

router.get('/:wisdomizer', function(req, res, next){
    var breadcrumbL1 = 'wisdomizers',
        breadcrumbL2 = req.params.wisdomizer;

    var getWisdomizerInfo = app.models.Wisdomizer.getWisdomizerInfo('wisdomizers/' + req.params.wisdomizer)
    .then(function(wisdomizerInfo){
        return wisdomizerInfo;
    })
    
    var getBreadcrumb = breadcrumb(breadcrumbL1, breadcrumbL2);

    var getWisdomizerCount = app.models.Wisdomizer.getWisdomizerCount()
    .then(function(wisdomizerCount){
        return wisdomizerCount;
    })

    return Promise.all([getWisdomizerInfo, getBreadcrumb, getWisdomizerCount])
    .then(function(promises){
        return app.models.Wisdomizer.getWisdomizerCount()
        .then(function(wisdomizerCount){    
            var pageContent = promises[0];

            pageContent.breadcrumbs = promises[1];
            pageContent.wisdomizerCount = promises[2];

            console.log("rendering 'wisdomizer' HTML template...");
            res.render('pages/wisdomizer', {pageContent});
        })

    })
})

module.exports = router;