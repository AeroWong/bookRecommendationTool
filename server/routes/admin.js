var express = require('express'),
    app = require('../server'),
    bodyParser = require('body-parser'),
	urlencodedParser = bodyParser.urlencoded({ extended: false }),
    router = express.Router({mergeParams: true});

router.get('/', function(req, res, next){
    res.render('pages/admin', {layout: 'admin'});
})

router.get('/dashboard/:userId', function(req, res, next){
	if(req.params.userId){
		return app.models.User.findById(req.params.userId, function(err, user){
			if (user) {
				console.log('User with userId - ' + req.params.userId + ' - logged in the admin dashboard.')
				res.render('pages/dashboard', {layout: 'admin'});	
			} else {
		    	res.render('pages/404_not_found', {layout: 'admin'}); 
			}
		});
	}
})

app.post('/login', urlencodedParser, function(req, res) {
	return app.models.User.login({
	  	email: req.body.email,
	  	password: req.body.password
	}, 'user', function(err, token) {
	  	if (err) {
	    	res.render('pages/404_not_found', {layout: 'admin'}); 
	    	return;
	  	} else if (token) {
	  		res.send(token);
	  	} else {
	    	res.render('pages/404_not_found', {layout: 'admin'}); 
	  	}
	});
});

module.exports = router;