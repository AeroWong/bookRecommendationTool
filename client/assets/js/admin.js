(function() {
	'use strict';
	var admin = {
		init: function(){
			admin.login();
		},
		login: function(){
			$('#log-in-form .button').click(function(){
				logIn();
			})
			$(document).keypress(function(e){
				if (e.which == 13) {
					logIn();
				}
			})
			var logIn = function(){
				// port 80 for live-site
				var port = window.location.hostname === 'localhost' ? ':3000' : ':80', 
					obj = { email: $('#log-in-form #email').val(),
							password: $('#log-in-form #password').val() };

				$.ajax({
					type: "POST",
					url: 'http://' + window.location.hostname + port + '/login',
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
			}
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
					$site = $('#add-wisdomizer-form #wisdomizer-site').val(),
					reminder = 'Please fill in the neccessary field.',
					port = window.location.hostname === 'localhost' ? ':3000' : ':80';

				var obj = {	name: $name,
							profile_pic: $profile_pic,
							gender: $gender,
							site: $site };

				if (obj.name.length === 0){
					$('#alert-message-1').css('display', 'block');
					console.log(reminder);
				}
				if (obj.profile_pic.length === 0){
					$('#alert-message-2').css('display', 'block');
					console.log(reminder);
				}
				if (obj.gender.length === 0){
					$('#alert-message-3').css('display', 'block');
					console.log(reminder);
				}
				if (obj.site.length === 0){
					$('#alert-message-4').css('display', 'block');
					console.log(reminder);
				}

				if (obj.name && obj.profile_pic && obj.gender && obj.site) {
					$.ajax({
						type: "POST",
						url: 'http://' + window.location.hostname + port + '/api/Wisdomizers/addWisdomizer',
						dataType: 'json',
						data: obj
					})
					.success(function(res){
						if (res.data === "Duplicated wisdomzier."){
							console.log("Duplicated Wisdomizer. Please add another one.")
						} else {
							$('#success-message-1').css('display', 'block');
							$('.alert-message').css('display', 'none');
							$('#success-message-1').fadeOut(5000, function(){
								console.log('Added a widomizer.');
								$('#success-message-1').css('display', 'none');
								$('#add-wisdomizer-form #wisdomizer-name').val('');
								$('#add-wisdomizer-form #wisdomizer-profile-pic').val('');
								$('#add-wisdomizer-form #wisdomizer-gender').val('');
								$('#add-wisdomizer-form #wisdomizer-site').val('');
							});
						}
					})
					.error(function(res){
						console.log('back-end error', res);
					})
				}
			})
		},
		addBookRecommendation: function() {

			$('#add-book-recommendation-form .button').click(function(){

				var $bookTitle = $('#add-book-recommendation-form #book-title').val(),
					$bookIsbn = $('#add-book-recommendation-form #book-isbn').val(),
					$bookCoverImage = $('#add-book-recommendation-form #book-cover-image').val(),
					$amazonPage = $('#add-book-recommendation-form #book-amazon-page').val(),
					$wisdomizer = $('#add-book-recommendation-form #book-corresponding-wisdomizer').val(),
					$src = $('#add-book-recommendation-form #book-src').val(),
					$srcTitle = $('#add-book-recommendation-form #book-src-title').val(),
					$successMsg = $('#success-message-2'),
					reminder = 'Please fill in the neccessary field.';

				var obj = { bookTitle: $bookTitle,
							bookIsbn: $bookIsbn,
							bookCoverImage: $bookCoverImage,
							authors: [],
							categories: [],
							amazonPage: $amazonPage,
							wisdomizer: $wisdomizer,
							src: $src,
							srcTitle: $srcTitle };

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

				if (obj.bookTitle.length === 0){
					$('#alert-message-5').css('display', 'block');
					console.log(reminder);
				}
				if (obj.bookIsbn.length === 0){
					$('#alert-message-14').css('display', 'block');
					console.log(reminder);
				}
				if (obj.bookCoverImage.length === 0){
					$('#alert-message-6').css('display', 'block');
					console.log(reminder);
				}
				if (obj.authors.length === 0){
					$('#alert-message-7').css('display', 'block');
					console.log(reminder);
				}
				if (obj.categories.length === 0){
					$('#alert-message-8').css('display', 'block');
					console.log(reminder);
				}
				if (obj.amazonPage.length === 0){
					$('#alert-message-9').css('display', 'block');
					console.log(reminder);
				}
				if (obj.wisdomizer.length === 0){
					$('#alert-message-10').css('display', 'block');
					console.log(reminder);
				}
				if (obj.src.length === 0){
					$('#alert-message-11').css('display', 'block');
					console.log(reminder);
				}
				if (obj.srcTitle.length === 0){
					$('#alert-message-12').css('display', 'block');
					console.log(reminder);
				}

				if(obj.bookTitle && obj.bookCoverImage && obj.authors && obj.categories && 
				   obj.amazonPage && obj.wisdomizer && obj.src && obj.srcTitle){
					
					$.ajax({
						type: 'POST',
						url: ((window.location.hostname.indexOf('wisdomtrigger.com') > -1)? 'https://' : 'http://') + window.location.hostname + ':3000/api/Recommendations/addRecommendation',
						dataType: 'json',
						data: obj
					})
					.success(function(res){
						if(res.data === "The wisdomizer doesn't exist. Please create one."){
							$('#alert-message-13').css('display', 'block');
							console.log("The Wisdomizer doesn't exist. Please add one.");
						} else if (res.data === 'Duplicated book recommendation.') {
							console.log('Duplicated book recommendation. Please make a new one.');
						} else {
							$('#success-message-2').css('display', 'block');
							$('#alert-message-13').css('display', 'none');
							$successMsg.fadeOut(5000, function(){
								$('#add-book-recommendation-form #book-title').val('');
								$('#add-book-recommendation-form #book-isbn').val('');
								$('#add-book-recommendation-form #book-cover-image').val('');
								$('.book-author').val('');
								$('.book-category').val('');
								$('#add-book-recommendation-form #book-amazon-page').val('');
								$('#add-book-recommendation-form #book-corresponding-wisdomizer').val('');
								$('#add-book-recommendation-form #book-src').val('');
								$('#add-book-recommendation-form #book-src-title').val('');
								console.log('A new book recommendation is made.');
							}) 
						}
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