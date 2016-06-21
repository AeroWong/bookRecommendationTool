(function() {
	'use strict';
	var admin = {
		init: function(){
			admin.login();
		},
		login: function(){
			$('#log-in-form .button').click(function(){
				var obj = { email: $('#log-in-form #email').val(),
							password: $('#log-in-form #password').val()};

				$.ajax({
					type: "POST",
					url: ((window.location.hostname.indexOf('wisdomtrigger.com') > -1)? 'https://' : 'http://') + window.location.hostname + ':3000/login',
					dataType: 'json',
					data: obj
				}).success(function(res){
					console.log('success', res);
				}).error(function(res){
					console.log('error', res);
				})
			})

		}
	}
	admin.init();
}());