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
            pageContent.breadcrumbs = promises[1];

        console.log('--- ', pageContent);

        console.log("rendering 'categories' HTML template...");
        res.render('components/eggheads', {pageContent});
    })
})

module.exports = router;