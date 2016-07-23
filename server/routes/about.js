var express = require('express'),
    app = require('../server'),
    breadcrumb = require('../../common/widgets/breadcrumb')(),
    router = express.Router({mergeParams: true});

router.get('/', function(req, res, next){

    var breadcrumbL1 = 'about',
        pageContent = {};

    pageContent.breadcrumbs = breadcrumb(breadcrumbL1);

    console.log("rendering 'static' HTML template...");
    res.render('pages/about', {pageContent});
})

module.exports = router;