var express = require('express'),
    router = express.Router({mergeParams: true});

var remoteMethod = require('../../common/models/category');

router.get('/', function(req, res, next){
    console.log('app: ', app.models);
    console.log('remote method: ', remoteMethod);
    res.render('components/categories');
})

module.exports = router;


// app.get('/categories', function(req, res){
//   var fruits = [{"name": "Apple"},
//                 {"name": "Orange"},
//                 {"name": "Lemon"}];

//   res.render('categories', {fruits: fruits});
// })