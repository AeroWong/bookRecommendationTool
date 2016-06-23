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
			dashboard.addBookRecommendation();
		},
		addWisdomizer: function() {
			$('#add-wisdomizer-form .button').click(function(){
				var $name = $('#add-wisdomizer-form #wisdomizer-name').val(),
					$profile_pic = $('#add-wisdomizer-form #wisdomizer-profile-pic').val(),
					$gender = $('#add-wisdomizer-form #wisdomizer-gender').val(),
					$site = $('#add-wisdomizer-form #wisdomizer-site').val();

				var obj = {	name: $name,
							profile_pic: $profile_pic,
							gender: $gender,
							site: $site };

				if ($name.length === 0){
					$('#alert-message-1').addClass('active');
				}
				if ($profile_pic.length === 0){
					$('#alert-message-2').addClass('active');
				}
				if ($gender.length === 0){
					$('#alert-message-3').addClass('active');
				}
				if ($site.length === 0){
					$('#alert-message-4').addClass('active');
				}

				if (obj.name && obj.profile_pic && obj.gender && obj.site) {
					$.ajax({
						type: "POST",
						url: ((window.location.hostname.indexOf('wisdomtrigger.com') > -1)? 'https://' : 'http://') + window.location.hostname + ':3000/api/EggHeads/addEgghead',
						dataType: 'json',
						data: obj
					})
					.success(function(res){
						var $successMsg = $('#success-message-1')

						$successMsg.addClass('active');
						
						$successMsg.fadeOut(5000, function(){
							console.log('Added a widomizer. You can add another one.');
						}) 
					})
					.error(function(res){
						console.log('error', res);
					})
				}
			})
		},
		addBookRecommendation: function() {
			$('#add-book-recommendation-form .button').click(function(){
				var obj = { bookTitle: $('#add-book-recommendation-form #book-title').val(),
							bookCoverImage: $('#add-book-recommendation-form #book-cover-image').val(),
							authors: [],
							categories: [],
							amazonPage: $('#add-book-recommendation-form #book-amazon-page').val(),
							egghead: $('#add-book-recommendation-form #book-corresponding-wisdomizer').val(),
							src: $('#add-book-recommendation-form #book-src').val(),
							srcTitle: $('#add-book-recommendation-form #book-src-title').val() };

				addAuthor($('.book-author').length);
				addCategory($('.book-category').length);

				function addAuthor(authorNo){
					for (var i = 1; i < authorNo + 1; i++){
						if ( $('#book-author-' + String(i)).val().length > 0) {
							obj.authors.push($('#book-author-' + String(i)).val());
						}
					}
				}
				function addCategory(categoryNo){
					for (var i = 1; i < categoryNo + 1; i++){
						if ( $('#book-category-' + String(i)).val().length > 0) {
							obj.categories.push($('#book-category-' + String(i)).val());
						}
					}
				}

				if(obj.bookTitle && obj.bookCoverImage && obj.authors && obj.categories && 
				   obj.amazonPage && obj.egghead && obj.src && obj.srcTitle){
					
					$.ajax({
						type: 'POST',
						url: ((window.location.hostname.indexOf('wisdomtrigger.com') > -1)? 'https://' : 'http://') + window.location.hostname + ':3000/api/Recommendations/addRecommendation',
						dataType: 'json',
						data: obj
					})
					.success(function(res){
						console.log('added a new book recommendation.')
					})
					.error(function(res){
						console.log('error', res);
					})
				}
			})
		}
	}
	admin.init();
	dashboard.init();
}());