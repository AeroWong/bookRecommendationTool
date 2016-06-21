module.exports = function(app) {
	var User = app.models.User;
    User.create({email: 'wisdom.hatching@gmail.com', password: 'opensesame'}, function(err, userInstance) {
	   console.log('One admin user was just created...');
	});
}