module.exports = function(app) {
	var User = app.models.User;
    User.create({email: 'dummy@email.com', password: 'foobar'}, function(err, userInstance) {
	   console.log('One admin user was just created...');
	});
}