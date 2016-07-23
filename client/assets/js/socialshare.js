(function() {
	'use strict';
	var socialShare = {
		init: function(){
			socialShare.addButton();
		},
		addButton: function(){
			$('.element').socialShare({
			    twitterVia		: 'aerowong',
			    twitterHashTags : 'bookRecommendations, wisdomTrigger, wisdomizer',
			    description     : 'Book Recommendations from Wisdomizers',
			    image 			: 'http://wisdomtrigger.com/images/books.jpg'
			});
		}
	}
	socialShare.init();
}());