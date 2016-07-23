var express = require('express'),
    app = require('../server'),
    breadcrumb = require('../../common/widgets/breadcrumb')(),
    router = express.Router({mergeParams: true});

router.get('/', function(req, res, next){

    var breadcrumbL1 = 'contact',
        pageContent = {};

    var getBreadcrumb = breadcrumb(breadcrumbL1);

    var getWisdomizerCount = app.models.Wisdomizer.getWisdomizerCount()
    .then(function(wisdomizerCount){
        return wisdomizerCount;
    })

    return Promise.all([getWisdomizerCount, getBreadcrumb])
    .then(function(promises){
    	var pageContent = {};

    	pageContent.wisdomizerCount = promises[0];
    	pageContent.breadcrumbs = promises[1];

	    console.log("rendering 'contact' HTML template...");
	    res.render('pages/contact', {pageContent});
    })
})

module.exports = router;