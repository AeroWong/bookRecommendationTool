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
					if(res.userId){
						console.log('userId: ', res.userId);
						location.assign('admin/dashboard/' + res.userId);
					}
					console.log('success', res);
				}).error(function(res){
					console.log('error', res);
				})
			})

		}
	};
	var dashboard = {
		init: function() {
			dashboard.addWisdomizer();
		},
		addWisdomizer: function() {

			$('#add-wisdomizer-form .button').click(function(){
				var obj = {	name: $('#add-wisdomizer-form #wisdomizer-name').val(),
							profile_pic: $('#add-wisdomizer-form #wisdomizer-profile-pic').val(),
							gender: $('#add-wisdomizer-form #wisdomizer-gender').val(),
							site: $('#add-wisdomizer-form #wisdomizer-site').val() };
				console.log(obj);
				if (obj.name && obj.profile_pic && obj.gender && obj.site) {
					$.ajax({
						type: "POST",
						url: ((window.location.hostname.indexOf('wisdomtrigger.com') > -1)? 'https://' : 'http://') + window.location.hostname + ':3000/api/EggHeads/addEgghead',
						dataType: 'json',
						data: obj
					}).success(function(res){
						console.log('added a new wisdomizer.');
					}).error(function(res){
						console.log('error', res);
					})
				}
			})
		}
	}
	admin.init();
	dashboard.init();
}());