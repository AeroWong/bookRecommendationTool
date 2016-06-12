var express = require('express'),
    app = require('../server'),
    getBreadCrumb = require('../../common/widgets/breadcrumb'),
    router = express.Router({mergeParams: true});

router.get('/', function(req, res, next){
    return app.models.Category.getCatgoriesInfo()
    .then(function(categories){
        console.log('req: ', req);
        // console.log('rendering categories HTML template...');
        // res.render('components/categories', {categories: categories});
    })
})

module.exports = router;


// app.get('/categories', function(req, res){
//   var fruits = [{"name": "Apple"},
//                 {"name": "Orange"},
//                 {"name": "Lemon"}];

//   res.render('categories', {fruits: fruits});
// })