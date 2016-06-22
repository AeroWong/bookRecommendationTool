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
		console.log('user with userId - ' + req.params.userId + ' - logged in the admin dashboard.')
		res.render('pages/dashboard', {layout: 'admin'});	
	}
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
	  		res.send(token);
	  	}



	  	// res.render('pages/home', { //login user and render 'home' view
	   //  	email: req.body.email,
	   // 		accessToken: token.id
	  	// });
	});
});

module.exports = router;