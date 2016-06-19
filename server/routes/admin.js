var express = require('express'),
    app = require('../server'),
    router = express.Router({mergeParams: true});

router.get('/', function(req, res, next){
    res.render('pages/admin', {layout: 'admin'});
})

module.exports = router;