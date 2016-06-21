var express = require('express'),
    app = require('../server'),
    router = express.Router({mergeParams: true});

router.get('/', function(req, res, next){
    res.render('pages/admin', {layout: 'admin'});
})

app.post('/login', function(req, res) {
	console.log('---- ', req);
	app.models.User.login({
	  	email: req.body.email,
	  	password: req.body.password
	}, 'user', function(err, token) {
	  	if (err) {
	    	res.render('response', { //render view named 'response.ejs'
	      	title: 'Login failed',
	      	content: err,
	      	redirectTo: '/',
	      	redirectToLinkText: 'Try again'
	    });
	    	return;
	  	}

	  	res.render('home', { //login user and render 'home' view
	    	email: req.body.email,
	   		accessToken: token.id
	  	});
	});
});

module.exports = router;