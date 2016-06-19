var express = require('express'),
    app = require('../server'),
    breadcrumb = require('../../common/widgets/breadcrumb')(),
    router = express.Router({mergeParams: true});

router.get('/:book', function(req, res, next){
    var breadcrumbL1 = 'books',
        breadcrumbL2 = req.params.book;

    var getBookInfo = app.models.Book.getBookInfo('books/' + req.params.book)
    .then(function(bookInfo){
        return bookInfo;
    })
    
    var getBreadcrumb = breadcrumb(breadcrumbL1, breadcrumbL2)

    var getWisdomizerCount = app.models.EggHead.getEggHeadCount()
    .then(function(wisdomizerCount){
        return wisdomizerCount;
    })

    return Promise.all([getBookInfo, getBreadcrumb, getWisdomizerCount])
    .then(function(promises){
        var pageContent = promises[0];

        pageContent.breadcrumbs = promises[1];
        pageContent.wisdomizerCount = promises[2];

        console.log("rendering 'book' HTML template...");
        res.render('pages/book', {pageContent});
    })
})

module.exports = router;