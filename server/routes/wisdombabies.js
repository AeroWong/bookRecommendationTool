var express = require('express'),
    app = require('../server'),
    breadcrumb = require('../../common/widgets/breadcrumb')(),
    router = express.Router({mergeParams: true});

router.get('/', function(req, res, next){
    var breadcrumbL1 = 'wisdombabies';

    var getWisdombabiesInfo = app.models.Wisdombaby.getWisdomBabiesInfo()
    .then(function(wisdomBabiesInfo){
        return wisdomBabiesInfo;
    })

    var getBreadcrumb = breadcrumb(breadcrumbL1);

    var getWisdomizerCount = app.models.Wisdomizer.getWisdomizerCount()
    .then(function(wisdomizerCount){
        return wisdomizerCount;
    })

    var getWisdombabyCount = app.models.Wisdombaby.getWisdombabyCount()
    .then(function(wisdombabyCount){
        return wisdombabyCount;
    })

    return Promise.all([getWisdombabiesInfo, getBreadcrumb, getWisdomizerCount, getWisdombabyCount])
    .then(function(promises){
        var pageContent = {};

        pageContent.wisdomizers = promises[0];
        pageContent.breadcrumbs = promises[1];
        pageContent.wisdomizerCount = promises[2];
        pageContent.wisdombabyCount = promises[3];

        console.log("rendering 'wisdombabies' HTML template...");
        res.render('pages/wisdombabies', {pageContent});
    })
})

router.get('/:wisdombaby', function(req, res, next){
    var breadcrumbL1 = 'wisdombabies',
        breadcrumbL2 = req.params.wisdombaby;

    var getWisdombabyInfo = app.models.Wisdombaby.getWisdombabyInfo('wisdombabies/' + req.params.wisdombaby)
    .then(function(wisdombabyInfo){
        return wisdombabyInfo;
    })
    
    var getBreadcrumb = breadcrumb(breadcrumbL1, breadcrumbL2);

    var getWisdomizerCount = app.models.Wisdomizer.getWisdomizerCount()
    .then(function(wisdomizerCount){
        return wisdomizerCount;
    })

    return Promise.all([getWisdombabyInfo, getBreadcrumb, getWisdomizerCount])
    .then(function(promises){
        var pageContent = promises[0];

        pageContent.breadcrumbs = promises[1];
        pageContent.wisdomizerCount = promises[2];

        console.log('pageContent: ', pageContent);

        console.log("rendering 'wisdombaby' HTML template...");
        res.render('pages/wisdombaby', {pageContent});
    })
})

module.exports = router;