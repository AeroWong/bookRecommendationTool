var express = require('express'),
    app = require('../server'),
    bodyParser = require('body-parser'),
	urlencodedParser = bodyParser.urlencoded({ extended: false }),
    router = express.Router({mergeParams: true});

router.get('/', function(req, res, next){
    res.render('pages/admin', {layout: 'admin'});
})

router.get('/dashboard', function(req, res, next){
	console.log('req: ', req);
	res.render('pages/dashboard', {layout: 'admin'});	
})

app.post('/login', urlencodedParser, function(req, res) {
	return app.models.User.login({
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
	  	} else if (token) {
	  		res.redirect('/admin/dashboard');
	  		// res.render('pages/dashboard', {});
	  	}



	  	// res.render('pages/home', { //login user and render 'home' view
	   //  	email: req.body.email,
	   // 		accessToken: token.id
	  	// });
	});
});

module.exports = router;